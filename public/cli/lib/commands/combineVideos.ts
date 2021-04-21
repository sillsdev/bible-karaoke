import { paths } from '../path-constants';
import { spawn } from 'child_process';
import winston from 'winston';
import { EventEmitter } from 'events';
import fs from 'fs';
import tempy from 'tempy';
import path from 'path';

export function combineVideos(videoPaths: Array<string>, outputFilePath: string, notifyEvent?: EventEmitter) {
  tempy.directory.task((dir) => {
    winston.info('Generating videoList.txt');
    notifyEvent && notifyEvent.emit('Generating videoList.txt');
    //Create a list file to concatenate (see https://trac.ffmpeg.org/wiki/Concatenate)
    const listFile = path.join(dir, 'videoList.txt');
    fs.writeFile(listFile, videoPaths.map((videoPath) => `file '${videoPath}'`).join('\n'), (err) => {
      winston.error(err);
    });
    winston.info('Combining Videos');
    notifyEvent && notifyEvent.emit('Combining Videos');
    const combineProcess = spawn(paths.ffmpeg, ['f concat -safe 0 -i', listFile, '-c copy', outputFilePath]);
    combineProcess.stderr.on('data', (err: Error) => {
      winston.error(err);
    });
  });
}
