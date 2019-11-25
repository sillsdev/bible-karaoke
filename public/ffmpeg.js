const path = require('path');
const process = require('process');
const ffbinaries = require('ffbinaries');
const shell = require('shelljs');

module.exports = { setupFfmpeg };

async function setupFfmpeg() {
  let dest = path.join(process.cwd(), 'binaries');
  await new Promise(function setupCallback(accept, reject) {
    ffbinaries.downloadBinaries(
      ['ffmpeg', 'ffprobe'],
      { quiet: true, destination: dest },
      function(err, results) {
        // console.log('Downloaded ffmpeg binaries to ' + dest + '.', err, results);
        if (!err) {
          accept();
        } else {
          reject();
        }
      },
    );
  });
  // Ensure executables are... executable
  shell.chmod('+X', path.join(dest, '*.*'));
  return dest;
}
