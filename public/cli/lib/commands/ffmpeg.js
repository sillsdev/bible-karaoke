"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobFormat = exports.mergeWavFiles = exports.combineAudioIfNecessary = exports.execute = void 0;
const fs_1 = __importDefault(require("fs"));
const readdir_sorted_1 = __importDefault(require("readdir-sorted"));
const shelljs_1 = __importDefault(require("shelljs"));
const tempy_1 = __importDefault(require("tempy"));
const path_1 = __importDefault(require("path"));
async function execute(settings) {
    // set default value
    settings.ffmpegPath = settings.ffmpegPath || 'ffmpeg';
    const executeAudioPath = await combineAudioIfNecessary(settings.ffmpegPath, settings.audioFileOrFolderPath, settings.skipAudioFiles);
    return new Promise((resolve, reject) => {
        shelljs_1.default.exec(`"${settings.ffmpegPath}" -framerate ${settings.framerateIn} -i "${path_1.default.join(settings.imagesPath, 'frame_%06d.png')}" -i
      "${executeAudioPath}" ${settings.framerateOut ? `${settings.framerateOut} ` : ''} -pix_fmt yuv420p "${settings.outputName}"`, (code, stdout, stderr) => {
            if (code != 0) {
                const error = new Error(stderr || stdout);
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
}
exports.execute = execute;
async function combineAudioIfNecessary(ffmpegExe, fileOrFolderPath, skipAudioFiles) {
    return new Promise((resolve, reject) => {
        // if we have a directory, read the files in the directory
        if (fs_1.default.lstatSync(fileOrFolderPath).isDirectory()) {
            // read files in the directory
            readdir_sorted_1.default(fileOrFolderPath, { numeric: true }).then(async (filesSorted) => {
                const files = (filesSorted || []).map((fileName) => path_1.default.join(fileOrFolderPath, fileName)), mp3Files = files.filter((f) => f.indexOf('.mp3') > -1), wavFiles = files.filter((f) => f.indexOf('.wav') > -1);
                // If this folder contains wave and mp3 files, then throw error
                if (mp3Files.length && wavFiles.length) {
                    reject(new Error('Conflicting audio types'));
                }
                // if we have wav files, then we merge them into one file
                // and return the combined file path
                else if (wavFiles.length) {
                    resolve(await mergeWavFiles(ffmpegExe, wavFiles, skipAudioFiles));
                }
                // if we have mp3 files, return the glob format with .mp3 files
                else if (mp3Files.length) {
                    resolve(getGlobFormat(mp3Files, skipAudioFiles));
                }
            });
        }
        // if we have a wav/mp3 file
        else {
            resolve(fileOrFolderPath);
        }
    });
}
exports.combineAudioIfNecessary = combineAudioIfNecessary;
async function mergeWavFiles(ffmpegExe, wavFiles, skipAudioFiles) {
    return new Promise((resolve, reject) => {
        // NOTE: cannot use glob format with .wav files
        // we will combine them into a single file and use that in our encode.
        // but skip the ones we've been told to skip
        const audioFiles = wavFiles.filter((f) => !skipAudioFiles.includes(f));
        const combinedWavFilePath = path_1.default.join(tempy_1.default.directory(), 'bbkAudio.wav');
        const fileDir = path_1.default.join(path_1.default.dirname(combinedWavFilePath), 'listAudioFiles.txt');
        // write a list of wav file to prepare to combine
        let fileText = '';
        audioFiles.forEach((fileName) => {
            if (!path_1.default.isAbsolute(fileName)) {
                fileName = path_1.default.join(process.cwd(), fileName);
            }
            fileText += `file '${fileName}'\n`;
        });
        fs_1.default.writeFileSync(fileDir, fileText);
        // combine wav files
        shelljs_1.default.exec(`"${ffmpegExe}" -f concat -safe 0 -i "${fileDir}" -c copy "${combinedWavFilePath}"`, (err) => {
            err ? reject(err) : resolve(combinedWavFilePath);
        });
    });
}
exports.mergeWavFiles = mergeWavFiles;
function getGlobFormat(mp3Files, skipAudioFiles) {
    const audioFiles = mp3Files.filter((f) => !skipAudioFiles.includes(f));
    return `concat:${audioFiles.join('|')}`;
}
exports.getGlobFormat = getGlobFormat;
