import test from 'ava';
import { combineVideos } from './combineVideos';
import { resolve } from 'path';
import tempy from 'tempy';
import { readdirSync } from 'fs';
import winston from 'winston';
winston.add(new winston.transports.Console({ silent: true }));

test('combine two videos', async (t) => {
  await tempy.directory.task(async (dir: string) => {
    const videoPaths = [
      resolve(__dirname, '../test/videos/small.avi'),
      resolve(__dirname, '../test/videos/small2.avi'),
    ];
    const outputFilePath = resolve(dir, 'myvideo.avi');
    await combineVideos(videoPaths, outputFilePath);
    const files = readdirSync(dir);
    t.is(files.length, 1);
    return;
  });
});
