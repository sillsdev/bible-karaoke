// const { record } = require("./record-frames");
const fs = require("fs");
const path = require("path");
const tempy = require("tempy");
const DataURI = require("datauri").promise;

module.exports = { render };

const fontPlaceholder = "CAPTION_FONT_FAMILY";
const fontSizePlaceholder = "CAPTION_FONT_SIZE";
const fontColorPlaceholder = "CAPTION_FONT_COLOR";
const fontItalicPlaceholder = "CAPTION_FONT_ITALIC";
const fontBoldPlaceholder = "CAPTION_FONT_BOLD";
const bgColorPlaceholder = "BG_COLOR";
const videoSrcPlaceholder = "VIDEO_SRC"
const fallbackFont = "Helvetica Neue, Helvetica, Arial, sans-serif";
const fallbackFontSize = "20pt";
const fallbackFontColor = "#555";
const fallbackFontItalic = "normal";
const fallbackFontBold = "normal";
const fallbackBgColor = "#CCC";
const fallbackVideoSrc = "";

const _ = require("lodash");

// (async function mainIIFE() {
//     try {
//         await render('./src/rendering/lrc.json', './src/rendering/testBG.jpg', false, 'Kayan Unicode');
//     } catch (error) {
//         console.error(error);
//     }
// })();

//
// Parallel Processing:
// we are using the electron-workers library to create workers on other 
// threads/processes that can perform the rendering.

const os = require('os')
var cpuCount = os.cpus().length;
if (cpuCount < 1) cpuCount = 1;
// {int} cpuCount
// this is the # of cpus (cores) that our node process can detect.
// we will create a worker for each core and divide all the frames to be 
// generated across these workers.

var electronPath = require('electron/index.js');
// {string} 
// electron-workers needs to find the path to our electron package.
// The index.js actually returns the installed path to the electron package.

const electronWorkers = require('electron-workers')({
    connectionMode:'ipc',
    pathToElectron: electronPath,
    pathToScript: __dirname + '/record-frames.js',
    numberOfWorkers: cpuCount,
    timeout: 2147483647, 
    // {Int32} 
    // timeout is used in setInterval() and is limited to a 32 bit integer.
    // if we are trying to not put a limit, 2147483647 is the max value we 
    // can use.
});


/**
 * @function electronWorkersStarted()
 * initiates the pool of workers.
 * @return {Promise}
 */
async function electronWorkersStarted() {
    return new Promise((ready, error) =>{
        electronWorkers.start((startErr)=>{
            if (startErr) {
                console.log(startErr);
                return error(startErr);
            }
            ready();
        })
    });
} 


/**
 * workerJob()
 * create a single worker job to perform the given record batch.
 * @param {json} options
 *        The job options for record-frames.js to operate.
 * @return {Promise}
 */
function workerJob(options) {
    return new Promise((resolve, reject) => {
        electronWorkers.execute({options}, function(err, response) {
            if (err) {
                return reject(err);
            }
            resolve(response);
        })
    })
}

/**
 *
 * @param timingFilePath
 * @param bgType
 * @param bgFilePath
 * @param bgColor
 * @param font
 * @param fontColor
 * @param fontSize
 * @param fontItalic
 * @param fontBold
 * @param highlightColor
 * @param speechBubbleColor
 * @param speechBubbleOpacity
 * @param notifyEvent
 * @returns {Promise<string>}
 */
async function render(timingFilePath, textLocation, bgType, bgFilePath, bgColor, font, fontColor, fontSize, fontItalic, fontBold, highlightColor, speechBubbleColor, speechBubbleOpacity, notifyEvent) {
    let timingObj = require(timingFilePath);
    let duration = timingObj[timingObj.length - 1].end / 1000;
    let fps = 15;
    // let ffmpegLocation = await setupFfmpeg();
    let htmlContent = await getHtmlPage(timingObj, textLocation, bgType, bgFilePath, bgColor, fps, font, fontColor, fontSize, fontItalic, fontBold, highlightColor, speechBubbleColor, speechBubbleOpacity);

    let outputLocation = tempy.directory();

    // fs.writeFileSync(path.join(outputLocation, "renderedAnimation.html"), htmlContent);
    // console.log(htmlContent)

    // create a set of options for each of the workers we will create.
    var standardOptions = {
        browser: null, // Optional: a puppeteer Browser instance,
        page: null, // Optional: a puppeteer Page instance,
        // ffmpeg: ffmpegLocation,
        logEachFrame: false,
        output: outputLocation,
        fps,
        frames: Math.round(fps * duration), // duration in seconds at fps
        htmlContent: htmlContent,
        framesBeg:1,    // change this on each worker:
        framesEnd: 100, // change this on each worker
    };

    var allRecords = [];
    // {array} allRecords
    // an array of the worker thread {Promises} that are recording the frames.

    var lastBatchFrame = 0;
    // {int} lastBatchFrame
    // The Frame # that the last batch left off calculating

    var blockSize = Math.floor(standardOptions.frames / cpuCount);
    // {int} blockSize
    // the # of frames each worker will be responsible for creating

    // Wait for our worker pool to be created:
    await electronWorkersStarted();

    // for each cpu that can handle a worker:
    for (var i=0; i <cpuCount; i++) {

        // make a copy of the options
        var options = _.clone(standardOptions);

        // calculate which set of frames this batch is required to make
        options.framesBeg = lastBatchFrame + 1;
        options.framesEnd = lastBatchFrame + blockSize;

        // if this is our last run, then pass on all the remaining frames:
        if (i+1 == cpuCount) {
            options.framesEnd = options.frames;
        }
        lastBatchFrame = options.framesEnd;

        // start the render job
        console.log(`render job ${i+1}: ${options.framesBeg} - ${options.framesEnd}`);
        allRecords.push(workerJob(options));
    }

    // now watch for the files to show up and report back to Interface progress
    function watch() {
        // instead of each render job reporting back directly (can't do that any more)
        // this thread will simply scan the files and report back the # of files that 
        // have been created.  There should be 1 file for each frame being rendered.

        fs.readdir(outputLocation, (err, files) => {
            if (err) {
                console.error(err);
                return;
            }
            // report to the UI the progress:
            notifyEvent.emit("rendered", { curr: files.length, total: standardOptions.frames });
        })
    }
    // report back every second
    var watchInterval = setInterval(watch, 1000);

    // once all workers have finished, then close things down:
    await Promise.all(allRecords)
    .then(()=>{
        electronWorkers.kill();
    }).catch(e => {
        console.error(e);
        electronWorkers.kill();
    });

    clearInterval(watchInterval);

    // report back the outputLocation
    return outputLocation;
}

async function getHtmlPage(timingObj, textLocation, bgType, bgFilePath, bgColor, fps, font, fontColor, fontSize, fontItalic, fontBold, highlightColor, speechBubbleColor, speechBubbleOpacity) {
    let htmlContent = fs.readFileSync(path.join(__dirname, "render.html"), {
        encoding: "utf-8"
    });
    let timings = JSON.stringify(timingObj, null, 4); // fs.readFileSync(timingFilePath, { encoding: "utf-8" });
    let backgroundDataUri = null;
    if (bgFilePath && bgType == "image") {
        backgroundDataUri = await DataURI(bgFilePath);
    }
    if (fontItalic) {
        fontItalic = "italic";
    } else {
        fontItalic = "normal";
    }
    if (fontBold) {
        fontBold = "bold";
    } else {
        fontBold = "normal";
    }
    return htmlContent
        .replace(
            "<!-- replaced-HACK -->",
            `
    <script>
        let fps = ${fps};
        let timing = ${timings};
        let backgroundDataUri = '${backgroundDataUri}';
        let backgroundVideoUrl = '${bgFilePath}';
        let highlightColor = '${highlightColor}';
        let speechBubbleColor = '${speechBubbleColor}';
        let speechBubbleOpacity = '${speechBubbleOpacity}';
        let backgroundType = '${bgType}';
        let bgFilePath = '${bgFilePath}';
        let phraseLocation = '${textLocation}';
        window.onload = function () {
            window.afterLoadKar(timing, backgroundDataUri, fps, backgroundType, backgroundVideoUrl, highlightColor, speechBubbleColor, speechBubbleOpacity, phraseLocation);
        }
    </script>
    `
        )
        .replace(fontPlaceholder, font || fallbackFont)
        .replace(fontSizePlaceholder, fontSize + "pt" || fallbackFontSize)
        .replace(fontColorPlaceholder, fontColor || fallbackFontColor)
        .replace(fontItalicPlaceholder, fontItalic || fallbackFontItalic)
        .replace(fontBoldPlaceholder, fontBold || fallbackFontBold)
        .replace(bgColorPlaceholder, bgColor || fallbackBgColor)
        .replace(videoSrcPlaceholder, bgFilePath || fallbackVideoSrc);
}
