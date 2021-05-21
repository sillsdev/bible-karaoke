import test from 'ava';
import tempy from 'tempy';
import fs from 'fs';
import path from 'path';
import { prepareLogger } from './logger';
import winston from 'winston';

test('logger-removes-log-files', async (t) => {
  await tempy.directory.task(async (dir: string) => {
    //Create mock files
    for (let i = 0; i < 10; i++) {
      fs.writeFileSync(path.join(dir, `${i}.txt`), 'test');
    }
    await prepareLogger(5, dir);
    winston.clear();
    const numberOfFiles = fs.readdirSync(dir).length;
    t.is(numberOfFiles, 5);
  });
});
