const bbkConvert = require('./cli/lib/commands/convert').run;
const bbkCombine = require('./cli/lib/commands/combine').run;
const process = require('process');
const path = require('path');
const tempy = require("tempy");
const { setupFfmpeg } = require('./ffmpeg');

const FFMPEG_EXE = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';

module.exports = {
  execute,
};

async function execute({
  hearThisFolder,
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

    // hearThisFolder = [
    //   "/home/pong/hearThisProjects/ENT/Colossians/1",
    //   "/home/pong/hearThisProjects/ENT/Colossians/2"
    // ];

    // Convert to an array
    if (hearThisFolder && !Array.isArray(hearThisFolder)) {
      hearThisFolder = [hearThisFolder];
    }

    let tasks = [];
    let fileList = [];

    hearThisFolder.forEach((folder, index) => {

      tasks.push(async () => {
        let tempOutputFile = path.join(tempy.directory(), `${index}.mp4`);
        fileList.push(tempOutputFile);

        return await bbkConvert({
          _: [folder],
          output: tempOutputFile, // Render the chapter video file to the temporary folder
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
          onProgress, // TODO: need to edit progress and messages
          f: true,
        })
      });

    });

    // Combine video clips
    tasks.push(async () => await bbkCombine({
      fileList,
      output
    }));

    // Execute tasks sequentially
    await tasks.reduce((p, fn) => p.then(fn), Promise.resolve());

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
//           hearThisFolder: 'C:\\ProgramData\\SIL\\HearThis\\ENT\\Mark\\1',
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
