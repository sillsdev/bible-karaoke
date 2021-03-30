import { paths } from '../path-constants';
import { spawn } from 'child_process';
import { Logger } from 'winston';
import { EventEmitter } from 'events';
import fs from 'fs';
import tempy from 'tempy';
import path from 'path';

export function combineVideos(
  videoPaths: Array<string>,
  outputFilePath: string,
  logger?: Logger,
  notifyEvent?: EventEmitter
) {
  tempy.directory.task((dir) => {
    logger && logger.info('Generating videoList.txt');
    notifyEvent && notifyEvent.emit('Generating videoList.txt');
    //Create a list file to concatenate (see https://trac.ffmpeg.org/wiki/Concatenate)
    const listFile = path.join(dir, 'videoList.txt');
    fs.writeFile(listFile, videoPaths.map((videoPath) => `file '${videoPath}'`).join('\n'), (err) => {
      logger && logger.error(err);
    });
    logger && logger.info('Combining Videos');
    notifyEvent && notifyEvent.emit('Combining Videos');
    const combineProcess = spawn(paths.ffmpeg, ['f concat -safe 0 -i', listFile, '-c copy', outputFilePath]);
    combineProcess.stderr.on('data', (err: Error) => {
      logger && logger.error(err);
    });
  });
}
