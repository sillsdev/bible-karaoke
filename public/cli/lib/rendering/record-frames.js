const puppeteer = require("puppeteer-core");
const chromium = require("chromium");
const path = require("path");
const workerpool = require("workerpool");


function record(options) {

    // chronium.path may or may provide a path in an asar archive.  If it does
    // it is unusable, and we'll attempt to swap it out for the unarchived version
    const chromiumPath = chromium.path.replace('app.asar', 'app.asar.unpacked');

    var browser = null;
    var page = null;
    var outLocation = options.output;

    // when things get passed through the workerpool inter process communications
    // sometimes numbers get passed as "strings":
    options.framesBeg = parseInt(options.framesBeg);
    options.framesEnd = parseInt(options.framesEnd);

    // NOTE: couldn't get the async / await semantics to work properly with
    // the workerpool library.  So back to the old school Promise.chain():
    return Promise.resolve()
    .then(()=>{
        // NOTE: running puppeteer inside Docker is a PAIN!
        // run with --no-sandbox until a better solution is figured out.
        return puppeteer.launch({
            executablePath: chromiumPath,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        }).then((newBrowser)=>{
            browser = newBrowser;
        })
    })
    .then(()=>{
        return browser.newPage()
        .then((newPage)=>{
            page = newPage;
        })
    })
    .then(()=>{
        return preparePage(browser, page, options.htmlContent)
    })
    .then(()=>{
        return new Promise((resolve, reject) =>{

            function doOne(i, cb) {
                // @function do One
                // recursive fn() to process each frame 
                // we stop when i is past our last frame: .framesEnd
                if (i > options.framesEnd) {
                    cb();
                } else {

                    renderPage(browser, page, i)
                    .then(()=>{

                        // save a screen shot for this rendered frame:
                        const paddedIndex = `${i}`.padStart(6, "0");
                        let fileName = `frame_${paddedIndex}.png`;
                        return page.screenshot({
                            omitBackground: false,
                            path: path.join(outLocation, fileName)
                        });

                    })
                    .then(()=>{
                        // move on to the next frame:
                        doOne(i+1, cb);
                    })
                }
            }

            // start the process with the 1st frame: .framesBeg
            doOne(options.framesBeg, (err) => {
                resolve();
            })
        })
    })
    .then(()=>{
        // after we are done, go through the process of closing out our
        // browsers and pages:
        return page.close()
        .then(()=>{
            return browser.close();
        });
    })
    .catch(()=>{
        // be sure to go through the process of closing out our
        // browsers and pages if we had an error too:
        return page.close()
        .then(()=>{
            return browser.close();
        });
    })

};

/**
 * @function preparePage
 * perform the initial Puppeteer setup of the page that will be generating
 * the frames for us.
 * @param {Browser} browser 
 *        The Puppeteer Browser object
 * @param {PuppeteerPage} page
 *        The Puppeteer Page object
 * @param {html} htlmContent
 *        The html content that should be displayed on the page.
 * @return {Promise}
 */
async function preparePage(browser, page, htmlContent) {
    await page.setViewport({
        width: 720,
        height: 480
    });
    await page.setContent(htmlContent);
}

/**
 * @function renderPage
 * Tell the page to render a specific frame 
 * @param {Browser} browser 
 *        The Puppeteer Browser object
 * @param {PuppeteerPage} page
 *        The Puppeteer Page object
 * @param {int} frame
 *        The frame # that should be rendered
 * @return {Promise}
 */
function renderPage(browser, page, frame) {
    return page.evaluate((nextFrame) => {
        //executing in browser
        renderNextFrame(nextFrame);
    }, frame)
}

// Create an instance of the workerpool worker.
workerpool.worker({
    record
    // we expose 1 method: record
})

/*
 * Anyone know why these are here?
 *
const ffmpegArgs = (fps) => [
    "-y",
    "-f",
    "image2pipe",
    "-r",
    `${+fps}`,
    "-i",
    "-",
    "-c:v",
    "libvpx",
    "-auto-alt-ref",
    "0",
    "-pix_fmt",
    "yuva420p",
    "-metadata:s:v:0",
    'alpha_mode="1"'
];

const write = (stream, buffer) =>
    new Promise((resolve, reject) => {
        stream.write(buffer, (error) => {
            if (error) reject(error);
            else resolve();
        });
    });
*/