import { record } from './recordFrames';
import fs from 'fs';
import path from 'path';
import { AnimationSettings, Timings, NotifyEvent, ProjectData } from '../../../models';
import { allowedNodeEnvironmentFlags } from 'process';
const _ = require('lodash');
const DataURI = require('datauri').promise;

export async function render(
  animationSettings: AnimationSettings,
  projectData: ProjectData,
  timings: Timings,
  notify: NotifyEvent
) {
  const logEachFrame = false;
  const fps = 15;

  let htmlContent = await getHtml(timings, animationSettings, fps);

  let durationInSeconds = timings[timings.length - 1].end / 1000;

  await record(htmlContent, Math.round(durationInSeconds * fps), projectData.outputLocation, logEachFrame, notify);
}

export async function getHtml(
  timings: Timings,
  animationSettings: AnimationSettings,
  fps: number = 15
): Promise<string> {
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
