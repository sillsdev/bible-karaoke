import { record } from './recordFrames';

export async function render(outputLocation: string) {
  // collect UI options

  // load caption/frames object
  let captions = {};

  // create HTMLcontent
  const htmlContent = getHtml(captions);

  // run record
  //await record(htmlContent, numberOfFrames, outputLocation, notifyEvent);
}

function getHtml(captions: object) {}
