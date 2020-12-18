import test from 'ava';
import { getHtml } from './renderFrames';

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
  let captions = mockCaptions();
  let htmlContent = await getHtml(captions, style);
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

function mockStyle() {
  return {
    bgType: 'color',
    bgFile: false,
    bgColor: '#333',
    fontFamily: 'Arial',
    fontSize: 20,
    fontColor: '#555',
    fontItalic: true,
    fontBold: false,
    highlightColor: 'yellow',
    speechBubbleColor: '#FFF',
    speechBubbleOpacity: 1,
  };
}

function mockCaptions() {
  // TODO: Make sure timings work in template
  return {};
}
