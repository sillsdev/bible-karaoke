const { record } = require('./recordFrames');
const fs = require('fs');
const path = require('path');
const DataURI = require('datauri').promise;
const _ = require('lodash');

module.exports = { render, getHtmlPage };

/**
 * @todo
 */
async function render(timings, style, outputLocation, notifyEvent) {
  let fps = 15;
  let duration = timings[timings.length - 1].end / 1000;
  let numberOfFrames = Math.round(fps * duration);
  let htmlContent = await getHtmlPage(timings, style);
  await record(htmlContent, numberOfFrames, outputLocation, false, notifyEvent);
}

/**
 * Loads the render.html template and iserts style and bk timing data.
 * @param {object} timings BK timings
 * @param {object} style BK Style Options
 * @param {number} [fps=15]     Description
 * @return {string} html content
 */
async function getHtmlPage(timings, style, fps = 15) {
  let htmlTemplate = _.template(fs.readFileSync(path.join(__dirname, 'render.html'), { encoding: 'utf-8' }));
  let backgroundDataUri =
    style.bgFile && style.bgType == 'image' ? (backgroundDataUri = await DataURI(style.bgFile)) : null;
  let data = {
    timings: timings,
    fps: fps,
    style: style,
    backgroundDataUri: backgroundDataUri,
  };
  return htmlTemplate(data);
}
