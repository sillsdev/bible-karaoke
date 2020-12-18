import { record } from './recordFrames';
import fs from 'fs';
import path from 'path';
const _ = require('lodash');
const DataURI = require('datauri').promise;

export async function render(outputLocation: string) {
  // collect UI options

  // load caption/frames object
  let captions = {};

  // create HTMLcontent
  const htmlContent = await getHtml(captions, {});

  // run record
  //await record(htmlContent, numberOfFrames, outputLocation, notifyEvent);
}

// TODO: Define style (should not be type any)
export async function getHtml(captions: object, style: any, fps = 15) {
  let htmlTemplate = _.template(fs.readFileSync(path.join(__dirname, 'render.html'), { encoding: 'utf-8' }));
  let backgroundDataUri = style.bgFile && style.bgType == 'image' ? await DataURI(style.bgFile) : null;
  let data = {
    timings: captions,
    fps: fps,
    style: style,
    backgroundDataUri: backgroundDataUri,
  };
  return htmlTemplate(data);
}
