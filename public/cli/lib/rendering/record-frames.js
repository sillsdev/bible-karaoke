const puppeteer = require("puppeteer");
const path = require("path");
const locateChrome = require("locate-chrome");

module.exports.record = async function(options) {
    // NOTE: running puppeteer inside Docker is a PAIN!
    // run with --no-sandbox until a better solution is figured out.
    const chromePath = await locateChrome();
    if (!chromePath) {
        throw new Error("Could not find Chrome");
    }
    const browser =
        options.browser ||
        (await puppeteer.launch({
            executablePath: chromePath,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        }));
    const page = options.page || (await browser.newPage());

    await options.prepare(browser, page);

    //   var ffmpegPath = options.ffmpeg || 'ffmpeg';
    var fps = options.fps || 60;

    var outLocation = options.output;

    for (let i = 1; i <= options.frames; i++) {
        if (options.logEachFrame)
            console.log(
                `[puppeteer-recorder] rendering frame ${i} of ${options.frames}.`
            );

        await options.render(browser, page, i);
        const paddedIndex = `${i}`.padStart(6, "0");
        let fileName = `frame_${paddedIndex}.png`;
        let screenshot = await page.screenshot({
            omitBackground: false,
            path: path.join(outLocation, fileName)
        });
        if (options.notify) {
            options.notify.emit("rendered", { curr: i, total: options.frames });
        }
    }
    await browser.close();
    //   ffmpeg.stdin.end();

    //   await closed;
};

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
