import test from 'ava';
import { getHtml } from './renderFrames';
import { AnimationSettings, Timings } from '../../../models';

test('renderFrames smoke test', async (t) => {
  // TODO implement this
  t.pass();
});

test('getHtml() loads html from template', async (t) => {
  const style = mockStyle();
  const timings = mockTimings();
  const htmlContent = await getHtml(timings, style);
  const regexPatterns = [
    /font-family: "Arial";/,
    /font-size: 20pt;/,
    /color: #555;/,
    /font-style: "italic";/,
    /font-weight: "normal";/,
    /let highlightColor = 'yellow';/,
    /background: #333;/,
    /let backgroundType = 'color';/,
    /let speechBubbleColor = '#FFF'/,
    /let speechBubbleOpacity = 1;/,
  ];
  t.plan(regexPatterns.length);
  regexPatterns.forEach((pattern) => {
    t.regex(htmlContent, pattern);
  });
});

test('getHtml() timing words are present in html', async (t) => {
  const style = mockStyle();
  const timings = mockTimings();
  const htmlContent = await getHtml(timings, style);
  t.regex(htmlContent, new RegExp('let timings = ' + JSON.stringify(timings).replace(/\[/g, '\\[')));
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
  // generate mock Timings here
  return [
    {
      type: 'caption',
      index: 1,
      start: 1,
      end: 100,
      duration: 100,
      content: 'string',
      text: 'string',
      words: [
        { word: 'Hello', start: 1, end: 5 },
        { word: 'World', start: 6, end: 10 },
      ],
    },
  ];
}
