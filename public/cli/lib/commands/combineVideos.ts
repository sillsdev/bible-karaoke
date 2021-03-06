import { paths } from '../path-constants';
import { spawnSync } from 'child_process';
import winston from 'winston';
import { EventEmitter } from 'events';
import { writeFileSync } from 'fs';
import tempy from 'tempy';

export async function combineVideos(
  videoPaths: string[],
  outputFilePath: string,
  notifyEvent?: EventEmitter
): Promise<void> {
  winston.info('Generating videoList file');
  notifyEvent && notifyEvent.emit('Generating videoList file');
  // Create a temporary list file to concatenate videos (see https://trac.ffmpeg.org/wiki/Concatenate)
  tempy.file.task(
    (file) => {
      const contents = videoPaths.map((videoPath) => `file '${videoPath}'`).join('\n');
      writeFileSync(file, contents);
      winston.info('Combining Videos');
      notifyEvent && notifyEvent.emit('Combining Videos');
      const combineProcess = spawnSync(
        paths.ffmpeg,
        ['-f', 'concat', '-loglevel', 'error', '-safe', '0', '-i', file, '-c', 'copy', outputFilePath],
        {
          stdio: 'pipe',
        }
      );
      const stderr = combineProcess.stderr.toString();
      if (stderr !== '') {
        winston.error(stderr);
        throw new Error(stderr);
      } else {
        winston.info('Videos Combined');
        notifyEvent && notifyEvent.emit('Videos Combined');
      }
    },
    { extension: 'txt' }
  );
}
