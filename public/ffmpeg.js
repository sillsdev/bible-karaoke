const path = require('path');
const process = require('process');
const shell = require('shelljs');

module.exports = { setupFfmpeg };

async function setupFfmpeg() {
  let dest = path.join(process.cwd(), 'binaries');

  // Ensure executables are... executable
  shell.chmod('+X', path.join(dest, '*.*'));
  return dest;
}
