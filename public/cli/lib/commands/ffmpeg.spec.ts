import test from 'ava';
import { getGlobFormat } from './ffmpeg';

test('getGlobFormat: nothing skipped: expected format', (t) => {
  const mp3Files = ['one.mp3', 'two.mp3'];
  const skippedFiles: string[] = [];

  t.is(getGlobFormat(mp3Files, skippedFiles), 'concat:one.mp3|two.mp3');
});

test('getGlobFormat: file skipped: expected format', (t) => {
  const mp3Files = ['one.mp3', 'two.mp3'];
  const skippedFiles: string[] = ['two.mp3'];

  t.is(getGlobFormat(mp3Files, skippedFiles), 'concat:one.mp3');
});
