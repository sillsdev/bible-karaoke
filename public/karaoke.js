const bbkConvert = require('bbk/lib/commands/convert').run;
const process = require('process');
const path = require('path');
const { setupFfmpeg } = require('./ffmpeg');

const FFMPEG_EXE = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';

module.exports = {
  execute,
};

async function execute(hearThisFolder, bgImage, fontFamily, output, onProgress) {
  try {
    let ffmpegFolder = await setupFfmpeg();
    const ffmpegPath =  path.join(ffmpegFolder, FFMPEG_EXE);
    await bbkConvert({ _: [hearThisFolder], output, bgImage, ffmpegPath, fontFamily, onProgress, f: true });
    return output;
  } catch (err) {
    console.warn('Failed to generate karaoke file', err);
    return err;
  }
}

// (async function main() {
//     const onProgress = (data) => {
//       console.log('OnProgress callback', data);
//     };
//     try {
//         await execute("C:\\ProgramData\\SIL\\HearThis\\ENT\\Mark\\1", "C:\\DigiServe\\bible-karaoke\\cross-blog_orig.jpg", "Arial", "output.mp4", onProgress);
//     } catch (error) {
//         console.error(error);
//     }
// })();