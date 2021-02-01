import fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tempy = require('tempy');

export function getIntermediateRootDir() {
  // TODO: Use a directory within AppData where the cache can persist
  return tempy.directory();
}

export function mkDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
}
