import fs from 'fs';
import readdirSorted from 'readdir-sorted';
import path from 'path';
async function mergeAudio(folderPath: string, skipAudioFiles: Array<string>, outputFilename: string) {
  return new Promise<void>((resolve, reject) => {

  readdirSorted(folderPath, { numeric: true }).then((filesSorted) => {
    var files = (filesSorted || []).map((fileName) => path.join(folderPath, fileName));
    let mp3Files = files.filter((f) => f.indexOf('.mp3') > -1),
      wavFiles = files.filter((f) => f.indexOf('.wav') > -1),
      audioFiles = [];

    // If this folder contains wave and mp3 files, then throw error
    if (mp3Files.length && wavFiles.length) {
      reject(new Error('Conflicting audio types'));
    } else if (mp3Files.length) {
      // can use glob format with .mp3 files
      audioFiles = mp3Files.filter((f) => {
        return !skipAudioFiles.includes(f);
      });
      Options.audioInput = 'concat:' + audioFiles.join('|');
      resolve();
    } else if (wavFiles.length) {
      // NOTE: cannot use glob format with .wav files
      // we will combine them into a single file and use that in our encode.
      // but skip the ones we've been told to skip
      audioFiles = wavFiles.filter((f) => {
        return Options.skipAudioFiles.indexOf(f) == -1;
      });

      Options.audioInput = path.join(tempy.directory(), 'bbkAudio.wav');
      var fileDir = path.join(path.dirname(Options.audioInput), 'listAudioFiles.txt');
      var fileText = '';
      audioFiles.forEach((fileName) => {
        if (!path.isAbsolute(fileName)) {
          fileName = path.join(process.cwd(), fileName);
        }

        fileText += `file '${fileName}'\n`;
      });
      fs.writeFileSync(fileDir, fileText);
      var ffmpegExe = 'ffmpeg';
      if (Options.ffmpegPath) {
        ffmpegExe = Options.ffmpegPath;
      }
      shell.exec(`"${ffmpegExe}" -f concat -safe 0 -i "${fileDir}" -c copy "${Options.audioInput}"`, (err) => {
        err ? reject(err) : resolve();
      });
    }

});
}

async function combineAudioIfNecessary(fileOrFolderPath: string) {

  // if we have a directory, read the files in the directory
  if (fs.lstatSync(fileOrFolderPath).isDirectory()) {

    // read files in the directory

    // if we have wav files, then we merge them into one file
    await mergeWavFiles(fileOrFolderPath, outputFilename);

    // if we have mp3 files, do nothing
  }

}

