const { record } = require("./record-frames");
const fs = require("fs");
const path = require("path");
const tempy = require("tempy");
const DataURI = require("datauri").promise;

module.exports = { render };

const fontPlaceholder = "CAPTION_FONT_FAMILY";
const fallbackFont = "Helvetica Neue, Helvetica, Arial, sans-serif";

// (async function mainIIFE() {
//     try {
//         await render('./src/rendering/lrc.json', './src/rendering/testBG.jpg', false, 'Kayan Unicode');
//     } catch (error) {
//         console.error(error);
//     }
// })();

async function render(timingFilePath, bgImagePath, font, notifyEvent) {
    let timingObj = require(timingFilePath);
    let duration = timingObj[timingObj.length - 1].end / 1000;
    let fps = 15;
    // let ffmpegLocation = await setupFfmpeg();
    let htmlContent = await getHtmlPage(timingFilePath, bgImagePath, fps, font);
    // fs.writeFileSync("renderedAnimation.html", htmlContent);

    let outputLocation = tempy.directory();

    await record({
        browser: null, // Optional: a puppeteer Browser instance,
        page: null, // Optional: a puppeteer Page instance,
        // ffmpeg: ffmpegLocation,
        logEachFrame: false,
        output: outputLocation,
        fps,
        frames: Math.round(fps * duration), // duration in seconds at fps (15)
        prepare: async function(browser, page) {
            await page.setViewport({
                width: 720,
                height: 480
            });
            await page.setContent(htmlContent);
        },
        render: async (browser, page, frame) => {
            await page.evaluate(() => {
                //executing in browser
                renderNextFrame();
            });
        },
        notify: notifyEvent
    });
    return outputLocation;
}

async function getHtmlPage(timingFilePath, bgImagePath, fps, font) {
    let htmlContent = fs.readFileSync(path.join(__dirname, "render.html"), {
        encoding: "utf-8"
    });
    let timings = JSON.stringify(require(timingFilePath), null, 4); // fs.readFileSync(timingFilePath, { encoding: "utf-8" });
    let backgroundDataUri = null;
    if (bgImagePath) {
        backgroundDataUri = await DataURI(bgImagePath);
    }
    return htmlContent
        .replace(
            "<!-- replaced-HACK -->",
            `
    <script>
        let fps = ${fps};
        let timing = ${timings};
        let backgroundDataUri = '${backgroundDataUri}';
        window.onload = function () {
            window.afterLoadKar(timing, backgroundDataUri, fps);
        }
    </script>
    `
        )
        .replace(fontPlaceholder, font || fallbackFont);
}
