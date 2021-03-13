import fs from 'fs';
import tempy from 'tempy';

export function getIntermediateRootDir(): string {
  // TODO: Use a directory within AppData where the cache can persist
  return tempy.directory();
}

export function mkDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
}
