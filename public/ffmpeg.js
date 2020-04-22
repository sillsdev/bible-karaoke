const path = require('path');
const process = require('process');
const shell = require('shelljs');

module.exports = { setupFfmpeg };

/**
 * locates the "binaries" directory containing the ffmpeg utilities
 * sets the executable bit on all of the utilities
 *
 * returns the path to the binaries directory
 */
async function setupFfmpeg() {
  //example paths to binaries folder:
  //
  // Linux AppImage: /tmp/.mount_Bible cusbqB/
  //        Windows: C:\Users\bob\
  //   electron-dev: /Users/bob/bible-karaoke/node_modules/electron/dist/

  let executableFilename = process.execPath;

  let executablePath = path.dirname(executableFilename);

  // if in the electron-dev environment, running from node_modules tree
  // so find the parent to the node_modules directory
  const NODE_MODULES = "node_modules";

  if (executablePath.includes(NODE_MODULES)) {
    let node_modules_position = executablePath.indexOf(NODE_MODULES);
    executablePath = executablePath.substring(0, node_modules_position);
  }

  let binariesPath = path.join(executablePath, 'binaries');

  console.log( `ffmpeg.js: setupFfmpeg() binaries directory: [${binariesPath}]` );

  // Ensure executables are... executable
  shell.chmod('+X', path.join(binariesPath, (process.platform == 'win32') ? '*.*' : '*' ));
  return binariesPath;
}
