import { record } from './recordFrames';
import fs from 'fs';
import path from 'path';
import { AnimationSettings, Timings } from '../../../models';
const _ = require('lodash');
const DataURI = require('datauri').promise;

export async function render(outputLocation: string) {
  // collect UI options

  // load caption/frames object
  let captions = {};

  // create HTMLcontent
  // const htmlContent = await getHtml(captions, {});

  // run record
  //await record(htmlContent, numberOfFrames, outputLocation, notifyEvent);
}

// TODO: Define style (should not be type any)
export async function getHtml(timings: Timings, animationSettings: AnimationSettings, fps = 15) {
  let htmlTemplate = _.template(fs.readFileSync(path.join(__dirname, 'render.html'), { encoding: 'utf-8' }));
  let backgroundDataUri =
    animationSettings.background.file && animationSettings.background.type == 'image'
      ? await DataURI(animationSettings.background.file)
      : null;
  let data = {
    timings: timings,
    fps: fps,
    animationSettings: animationSettings,
    backgroundDataUri: backgroundDataUri,
  };
  return htmlTemplate(data);
}
