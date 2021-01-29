import test from 'ava';
import { getHtml } from './renderFrames';
import { AnimationSettings, Timings } from '../../../models';

test('renderFrames smoke test', async (t) => {
  t.pass();
});

test('getHtml() loads html from template', async (t) => {
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

test('getHtml() timing words are present in html', async (t) => {});

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
  return [];
}
