const fs = require('fs');
var tempy = require('tempy');

function getIntermediateRootDir() {
  // TODO: Use a directory within AppData where the cache can persist
  return tempy.directory();
}

function mkDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
}

module.exports = {
  getIntermediateRootDir,
  mkDir,
};
