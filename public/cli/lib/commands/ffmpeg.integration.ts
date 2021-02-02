import test from 'ava';
import tempy from 'tempy';
import fs from 'fs';
import { mergeWavFiles, combineAudioIfNecessary } from './ffmpeg';

let _ffmpegPath = '';
function getFFMpegPath(): string {
  if (_ffmpegPath == '') {
    // do complicated setup
    _ffmpegPath = 'ffmpeg';
  }
  return _ffmpegPath;
}

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

test('mergeWavFiles smoke test: multiple files: success', async (t) => {
  const ffmpegPath = getFFMpegPath();
  const wavFiles = [`${__dirname}/test/fixtures/sampleWav/one.wav`, `${__dirname}/test/fixtures/sampleWav/two.wav`];
  const skipFiles: string[] = [];
  const newFilePath = await mergeWavFiles(ffmpegPath, wavFiles, skipFiles);

  // it is a wav file who is in the temporary folder.
  // like '/tmp/323f39912f9f9ff84c29479bfb77a266/bbkAudio.wav'
  // or '/temp/323f39912f9f9ff84c29479bfb77a266/bbkAudio.wav'
  const regex = new RegExp(/\/\w+\/\w+\/bbkAudio.wav/g);
  t.true(regex.test(newFilePath));
});
