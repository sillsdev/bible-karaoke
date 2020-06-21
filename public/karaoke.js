const bbkConvert = require('./cli/lib/commands/convert').run;
const process = require('process');
const path = require('path');
const { setupFfmpeg } = require('./ffmpeg');

const FFMPEG_EXE = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';

module.exports = {
  execute,
};

async function execute({
  sourceDirectory,
  textLocation,
  background,
  text,
  speechBubble,
  output,
  onProgress,
}) {
  try {
    let ffmpegFolder = await setupFfmpeg();
    const ffmpegPath = path.join(ffmpegFolder, FFMPEG_EXE);
    await bbkConvert({
      _: [sourceDirectory],
      output,
      ffmpegPath,
      textLocation: textLocation.location,
      bgType: background.type,
      bgFile: background.file,
      bgColor: background.color,
      fontFamily: text.fontFamily,
      fontSize: text.fontSize,
      fontColor: text.color,
      fontItalic: text.italic,
      fontBold: text.bold,
      highlightColor: text.highlightRGB,
      speechBubbleColor: speechBubble.rgba,
      speechBubbleOpacity: speechBubble.opacity,
      onProgress,
      f: true,
    });
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
//         const executeArgs = {
//           sourceDirectory: 'C:\\ProgramData\\SIL\\HearThis\\ENT\\Mark\\1',
//           backgroundFile: 'C:\\DigiServe\\bible-karaoke\\cross-blog_orig.jpg',
//           backgroundColor: '',
//           speechBubbleColor: 'white',
//           speechBubbleOpacity: 1,
//           textColor: 'black',
//           fontFamily: 'Arial',
//           fontSize: '20pt',
//           highlightColor: 'yellow',
//           output: 'output.mp4',
//           onProgress,
//         };
//         await execute(executeArgs);
//     } catch (error) {
//         console.error(error);
//     }
// })();
