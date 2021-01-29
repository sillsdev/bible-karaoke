import { record } from './recordFrames';
import fs from 'fs';
import path from 'path';
import { AnimationSettings, Timings, NotifyEvent, ProjectData } from '../../../models';
// import { allowedNodeEnvironmentFlags } from 'process'; //unsure if we will need this or not
import { template } from 'lodash';
const DataURI = require('datauri').promise;

export async function render(
  animationSettings: AnimationSettings,
  projectData: ProjectData,
  timings: Timings,
  notify: NotifyEvent
) {
  const logEachFrame = false;
  const fps = 15;

  const htmlContent = await getHtml(timings, animationSettings, fps);

  const durationInSeconds = timings[timings.length - 1].end / 1000;

  await record(htmlContent, Math.round(durationInSeconds * fps), projectData.outputLocation, logEachFrame, notify);
}

export async function getHtml(
  timings: Timings,
  animationSettings: AnimationSettings,
  fps: number = 15
): Promise<string> {
  const htmlTemplate = template(fs.readFileSync(path.join(__dirname, 'render.html'), { encoding: 'utf-8' }));
  const backgroundDataUri =
    animationSettings.background.file && animationSettings.background.type == 'image'
      ? await DataURI(animationSettings.background.file)
      : null;
  const data = { timings, fps, animationSettings, backgroundDataUri };
  return htmlTemplate(data);
}
