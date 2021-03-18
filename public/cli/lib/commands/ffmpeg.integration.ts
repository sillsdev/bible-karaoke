import test from 'ava';
import fs from 'fs';
import path from 'path';
import { mergeWavFiles } from './ffmpeg';
import { paths } from '../path-constants';
import { testPaths } from '../test/test-path-constants';

let _ffmpegPath = '';
function getFFMpegPath(): string {
  if (_ffmpegPath == '') {
    // do complicated setup
    _ffmpegPath = paths.ffmpeg;
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
  const wavFiles = [
    path.join(testPaths.exampleHearThisProject, 'Book1', '1', '1.wav'),
    path.join(testPaths.exampleHearThisProject, 'Book1', '1', '2.wav'),
  ];
  const skipFiles: string[] = [];
  const newFilePath = await mergeWavFiles(ffmpegPath, wavFiles, skipFiles);

  t.true(fs.existsSync(newFilePath));
});
