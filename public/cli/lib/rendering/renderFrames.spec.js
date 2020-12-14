const test = require('ava');
const { getHtmlPage } = require('./renderFrames');

test('Test load html content from template', async (t) => {
  let style = mockStyle();
  let timings = mockTimings();
  let htmlContent = await getHtmlPage(timings, style);
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

function mockTimings() {
  // TODO: Make sure timings work in template
  return {};
}
