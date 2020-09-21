const { record } = require('./record-frames');
const fs = require('fs');
const path = require('path');
const tempy = require('tempy');
const DataURI = require('datauri').promise;

module.exports = { render };

const fontPlaceholder = 'CAPTION_FONT_FAMILY';
const fontSizePlaceholder = 'CAPTION_FONT_SIZE';
const fontColorPlaceholder = 'CAPTION_FONT_COLOR';
const fontItalicPlaceholder = 'CAPTION_FONT_ITALIC';
const fontBoldPlaceholder = 'CAPTION_FONT_BOLD';
const bgColorPlaceholder = 'BG_COLOR';
const videoSrcPlaceholder = 'VIDEO_SRC';
const fallbackFont = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const fallbackFontSize = '20pt';
const fallbackFontColor = '#555';
const fallbackFontItalic = 'normal';
const fallbackFontBold = 'normal';
const fallbackBgColor = '#CCC';
const fallbackVideoSrc = '';

async function render(
  timingFilePath,
  textLocation,
  bgType,
  bgFilePath,
  bgColor,
  font,
  fontColor,
  fontSize,
  fontItalic,
  fontBold,
  highlightColor,
  speechBubbleColor,
  speechBubbleOpacity,
  notifyEvent
) {
  let timingObj = require(timingFilePath);
  let duration = timingObj[timingObj.length - 1].end / 1000;
  let fps = 15;
  // let ffmpegLocation = await setupFfmpeg();
  let htmlContent = await getHtmlPage(
    timingFilePath,
    textLocation,
    bgType,
    bgFilePath,
    bgColor,
    fps,
    font,
    fontColor,
    fontSize,
    fontItalic,
    fontBold,
    highlightColor,
    speechBubbleColor,
    speechBubbleOpacity
  );

  let outputLocation = tempy.directory();

  // fs.writeFileSync(path.join(outputLocation, "renderedAnimation.html"), htmlContent);

  // console.log(htmlContent)

  await record({
    browser: null, // Optional: a puppeteer Browser instance,
    page: null, // Optional: a puppeteer Page instance,
    // ffmpeg: ffmpegLocation,
    logEachFrame: false,
    output: outputLocation,
    fps,
    frames: Math.round(fps * duration), // duration in seconds at fps (15)
    prepare: async function (_browser, page) {
      await page.setViewport({
        width: 720,
        height: 480,
      });
      await page.setContent(htmlContent);
    },
    render: async (_browser, page) => {
      await page.evaluate(() => {
        // executing in browser
        // eslint-disable-next-line no-undef
        renderNextFrame();
      });
    },
    notify: notifyEvent,
  });
  return outputLocation;
}

async function getHtmlPage(
  timingFilePath,
  textLocation,
  bgType,
  bgFilePath,
  bgColor,
  fps,
  font,
  fontColor,
  fontSize,
  fontItalic,
  fontBold,
  highlightColor,
  speechBubbleColor,
  speechBubbleOpacity
) {
  // console.log("textLocation: ", textLocation);
  let htmlContent = fs.readFileSync(path.join(__dirname, 'render.html'), {
    encoding: 'utf-8',
  });
  let timings = JSON.stringify(require(timingFilePath), null, 4); // fs.readFileSync(timingFilePath, { encoding: "utf-8" });
  let backgroundDataUri = null;
  if (bgFilePath && bgType === 'image') {
    backgroundDataUri = await DataURI(bgFilePath);
  }
  if (fontItalic) {
    fontItalic = 'italic';
  } else {
    fontItalic = 'normal';
  }
  if (fontBold) {
    fontBold = 'bold';
  } else {
    fontBold = 'normal';
  }
  return htmlContent
    .replace(
      '<!-- replaced-HACK -->',
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
    .replace(fontSizePlaceholder, fontSize + 'pt' || fallbackFontSize)
    .replace(fontColorPlaceholder, fontColor || fallbackFontColor)
    .replace(fontItalicPlaceholder, fontItalic || fallbackFontItalic)
    .replace(fontBoldPlaceholder, fontBold || fallbackFontBold)
    .replace(bgColorPlaceholder, bgColor || fallbackBgColor)
    .replace(videoSrcPlaceholder, bgFilePath || fallbackVideoSrc);
}
