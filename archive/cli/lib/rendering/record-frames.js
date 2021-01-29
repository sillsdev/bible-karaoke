const puppeteer = require('puppeteer-core');
const chromium = require('chromium');
const path = require('path');

module.exports.record = async function (options) {
  // chromium.path may or may provide a path in an asar archive.  If it does
  // it is unusable, and we'll attempt to swap it out for the un-archived version
  const chromiumPath = chromium.path.replace('app.asar', 'app.asar.unpacked');

  // NOTE: running puppeteer inside Docker is a PAIN!
  // run with --no-sandbox until a better solution is figured out.
  const browser =
    options.browser ||
    (await puppeteer.launch({
      executablePath: chromiumPath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }));
  const page = options.page || (await browser.newPage());

  await options.prepare(browser, page);

  var outLocation = options.output;

  for (let i = 1; i <= options.frames; i++) {
    if (options.logEachFrame) console.log(`[puppeteer-recorder] rendering frame ${i} of ${options.frames}.`);

    await options.render(browser, page, i);
    const paddedIndex = `${i}`.padStart(6, '0');
    let fileName = `frame_${paddedIndex}.png`;
    await page.screenshot({
      omitBackground: false,
      path: path.join(outLocation, fileName),
    });
    if (options.notify) {
      options.notify.emit('rendered', { curr: i, total: options.frames });
    }
  }
  await browser.close();
  //   ffmpeg.stdin.end();

  //   await closed;
};
