const puppeteer = require('puppeteer-core');
const chromium = require('chromium');
const path = require('path');

/**
 *
 * @param {string} htmlContent
 * @param {number} numberOfFrames
 * @param {string} outputLocation
 * @param {boolean} logEachFrame
 * @param {Function} notifyEvent TODO: I don't know what object or function this is yet
 */
module.exports.record = async function (
  htmlContent,
  numberOfFrames,
  outputLocation,
  logEachFrame = false,
  notifyEvent = false
) {
  // chromium.path may or may provide a path in an asar archive.  If it does
  // it is unusable, and we'll attempt to swap it out for the un-archived version
  const chromiumPath = chromium.path.replace('app.asar', 'app.asar.unpacked');

  const browser = await puppeteer.launch({
    executablePath: chromiumPath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 720,
    height: 480,
  });
  await page.setContent(htmlContent);

  for (let i = 1; i <= numberOfFrames; i++) {
    if (logEachFrame) console.log(`[puppeteer-recorder] rendering frame ${i} of ${numberOfFrames}.`);

    await page.evaluate(() => {
      // executing in browser
      // eslint-disable-next-line no-undef
      renderNextFrame();
    });

    const paddedIndex = `${i}`.padStart(6, '0');
    let fileName = `frame_${paddedIndex}.png`;
    await page.screenshot({
      omitBackground: false,
      path: path.join(outputLocation, fileName),
    });
    if (notifyEvent) {
      notifyEvent.emit('rendered', { curr: i, total: numberOfFrames });
    }
  }
};
