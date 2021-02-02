import test from 'ava';
import tempy from 'tempy';
import fs from 'fs';
import {getGlobFormat} from './ffmpeg';


/*
test('combineAudioIfNecessary: only mp3 files: nothing combined', (t) => {
  t.fail();
    //t.is(directoryOfFrameFiles.length, numberOfFrames);
});

test('combineAudioIfNecessary: wav files: combined into single wav file', (t) => {
  t.fail();
});

test('combineAudioIfNecessary: mixed file types: throws error', (t) => {
  t.fail();
});
*/

test('getGlobFormat: nothing skipped: expected format', (t) => {
  const mp3Files = ['one.mp3', 'two.mp3'];
  const skippedFiles: string[] = [];

  t.is(getGlobFormat(mp3Files, skippedFiles), "concat:one.mp3|two.mp3");
});

test('getGlobFormat: file skipped: expected format', (t) => {
  const mp3Files = ['one.mp3', 'two.mp3'];
  const skippedFiles: string[] = ['two.mp3'];

  t.is(getGlobFormat(mp3Files, skippedFiles), "concat:one.mp3");
});
