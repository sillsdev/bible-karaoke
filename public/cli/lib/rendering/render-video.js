const util = require('util');
const path = require('path');
const bbkFfmpeg = require('bbk/lib/commands/ffmpeg').run;
const exec = util.promisify(require('child_process').exec);
const {setupFfmpeg} = require('../ffmpeg');


module.exports = {
    renderToVideo
};
// (function (params) {
//     renderToVideo('./output', 'audio', 'video.mp4');
// })();
async function renderToVideo(imagesFolder, audioFolder, outputFile) {
    let ffmpegFolder = await setupFfmpeg();
    let ffmpegPath = path.join(ffmpegFolder, 'ffmpeg');
    await bbkFfmpeg({
        images:imagesFolder,
        audio: audioFolder,
        output: outputFile,
        ffmpegPath: ffmpegPath
    });
    // console.log(stdout);
}

