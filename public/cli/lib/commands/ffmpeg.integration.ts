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

  t.true(fs.existsSync(newFilePath));
});
