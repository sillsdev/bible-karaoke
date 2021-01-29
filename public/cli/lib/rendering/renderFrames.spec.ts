import test from 'ava';
import { getHtml } from './renderFrames';
import { AnimationSettings, Timings } from '../../../models';

test('renderFrames hello world', async (t) => {
  /*
  let htmlContent = createMockHtml();
  const numberOfFrames = 5;
  await tempy.directory.task(async (outputLocation) => {
    let files = fs.readdirSync(outputLocation);
    t.is(files.length, 0);
    await record(htmlContent, numberOfFrames, outputLocation);
    files = fs.readdirSync(outputLocation);
    t.is(files.length, numberOfFrames);
  });
  */
  t.pass();
});

test('renderFrames loads html from template', async (t) => {
  let style = mockStyle();
  let timings = mockTimings();
  let htmlContent = await getHtml(timings, style);
  let regexPatterns = [
    /font-family: "Arial";/,
    /font-weight: "normal";/,
    /font-style: "italic";/,
    /let highlightColor = 'yellow';/,
  ];
  t.plan(regexPatterns.length);
  regexPatterns.forEach((pattern) => {
    t.regex(htmlContent, pattern);
  });
});

function mockStyle(): AnimationSettings {
  return {
    text: {
      fontFamily: 'Arial',
      fontSize: 20,
      color: '#555',
      italic: true,
      bold: false,
      highlightColor: 'yellow',
      highlightRGB: '',
    },
    background: {
      type: 'color',
      file: '',
      color: '#333',
    },
    speechBubble: {
      color: '#FFF',
      rgba: '',
      opacity: 1,
    },
    output: '',
    textLocation: '',
  };
}

function mockTimings(): Timings {
  // TODO: Make sure timings work in template
  return [];
}
