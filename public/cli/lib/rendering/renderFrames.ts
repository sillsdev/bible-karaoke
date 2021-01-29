import { record } from './recordFrames';
import fs from 'fs';
import path from 'path';
import { AnimationSettings, Timings, NotifyEvent } from '../../../models';
import { allowedNodeEnvironmentFlags } from 'process';
const _ = require('lodash');
const DataURI = require('datauri').promise;

export async function render(animationSettings: AnimationSettings, timings: Timings, notify: NotifyEvent) {
  // create HTMLcontent
  const htmlContent = await getHtml(timings, animationSettings);

  // run record
  //await record(htmlContent, numberOfFrames, outputLocation, notify);
}

// TODO: Define style (should not be type any)
export async function getHtml(timings: Timings, animationSettings: AnimationSettings, fps = 15): Promise<string> {
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
