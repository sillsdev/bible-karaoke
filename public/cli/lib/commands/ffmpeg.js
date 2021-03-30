//
// ffmpeg
// convert the text & export files into a usable format
//
// options:
//
const {FFMpegProgress} = require('ffmpeg-progress-wrapper');
var async = require("async");
var path = require("path");
var fs = require("fs");
var readdirSorted = require("readdir-sorted");
var shell = require("shelljs");
var tempy = require("tempy");
var utils = require(path.join(__dirname, "..", "utils", "utils"));

var Options = {}; // the running options for this command.

var Log = null;  // the logger

shell.config.execPath = shell.which("node");

//
// Build the Install Command
//
var Command = new utils.Resource({
    command: "ffmpeg",
    params: "",
    descriptionShort:
        "convert the text and export files into an intermediate format.",
    descriptionLong: `
`
});

module.exports = Command;

Command.help = function() {
    console.log(`

  usage: $ bbk ffmpeg --images=[images] --audio=[audio] --output=[output] --ffmpegPath=[/path/to/ffmpeg] --ffprobePath=[/path/to/ffprobe]

  [name] : the name of the directory to install the AppBuilder Runtime into.

  [options] :
    --images                : path to the image folder
    --audio                 : path to the audio file
    --output                : output name
    --backgroundVideoUrl    : path to background video
    --backgroundType        : type of background ("image", "photo", "video")
    --ffmpegPath            : (optional) path to the ffmpeg executable
    --ffprobePath           : (optional) path to the ffprobe executable
    --framerateIn           : (optional) {number} what rate are the images taken at 
    --framerateOut          : (optional) {number} what is the resulting framerate of the video

  examples:

    $ bbk ffmpeg --images=/path/to/image  --audio=/path/to/audio --output=file
        - reads in /path/to/image
        - reads in /path/to/audio
        - outputs file.mp4

`);
};

Command.run = function(options) {
    return new Promise((resolve, reject) => {
        async.series(
            [
                // copy our passed in options to our Options
                (done) => {
                    for (var o in options) {
                        console.log(o);
                        Options[o] = options[o];
                    }

                    if (!options.Log) {
                        var logError = new Error("missing Log parameter for ffmpeg.js");
                        done(logError);
                        return;
                    } else {
                        Log = options.Log;
                    }

                    let requiredParams = ["images", "audio", "output"];
                    let isValid = true;

                    // check for valid params:
                    requiredParams.forEach((p) => {
                        if (!Options[p]) {
                            Log(`missing required param: [${p}]`);
                            isValid = false;
                        }
                    });

                    if (!isValid) {
                        Command.help();
                        process.exit(1);
                    }

                    if (!Options.framerateIn) {
                        Options.framerateIn = "15";
                    }

                    if (!Options.framerateOut) {
                        Options.framerateOut = "";
                    } else {
                        Options.framerateOut = `-r ${Options.framerateOut}`;
                    }

                    Options.skipAudioFiles = Options.skipAudioFiles || [];

                    done();
                },
                checkDependencies,
                checkAudioInput,
                execute
            ],
            (err) => {
                // shell.popd("-q");
                // if there was an error that wasn't an ESKIP error:
                if (err && (!err.code || err.code !== "ESKIP")) {
                    reject(err);
                    return;
                }

                resolve();
            }
        );
    });
};

/**
 * @function checkAudioInput
 * Adjust the audio parameter depending on what was provided.
 * if they sent us a file reference, just use that. Otherwise if it was a
 * folder, then we need to pass all the files to the comamnd line.
 * @param {function} done  node style callback(err)
 */
function checkAudioInput(done) {
    // Folder
    if (fs.lstatSync(Options.audio).isDirectory()) {
        readdirSorted(Options.audio, { numeric: true }).then((filesSorted) => {
            var files = (filesSorted || []).map((fileName) =>
                path.join(Options.audio, fileName)
            );
            let mp3Files = files.filter((f) => f.indexOf(".mp3") > -1),
                wavFiles = files.filter((f) => f.indexOf(".wav") > -1),
                audioFiles = [];
            // If this folder contains wave and mp3 files, then throw error
            if (mp3Files.length && wavFiles.length) {
                return done(new Error("Conflicting audio types"));
            } else if (mp3Files.length) {
                // can use glob format with .mp3 files
                audioFiles = mp3Files.filter((f)=>{ return Options.skipAudioFiles.indexOf(f) === -1; });
                Options.audioInput = "concat:" + audioFiles.join("|");
                done();
            } else if (wavFiles.length) {
                // NOTE: cannot use glob format with .wav files
                // we will combine them into a single file and use that in our encode.
                // but skip the ones we've been told to skip
                audioFiles = wavFiles.filter((f)=>{ return Options.skipAudioFiles.indexOf(f) === -1; });

                Options.audioInput = path.join(
                    tempy.directory(),
                    "bbkAudio.wav"
                );
                var fileDir = path.join(
                    path.dirname(Options.audioInput),
                    "listAudioFiles.txt"
                );
                var fileText = "";
                audioFiles.forEach((fileName) => {
                    if (!path.isAbsolute(fileName)) {
                        fileName = path.join(process.cwd(), fileName);
                    }

                    fileText += `file '${fileName}'\n`;
                });
                fs.writeFileSync(fileDir, fileText);
                var ffmpegExe = "ffmpeg";
                if (Options.ffmpegPath) {
                    ffmpegExe = Options.ffmpegPath;
                }
                shell.exec(
                    `"${ffmpegExe}" -f concat -safe 0 -i "${fileDir}" -c copy "${Options.audioInput}"`,
                    (err) => {
                        done(err);
                    }
                );
            }
        });
    }
    // File
    else {
        Options.audioInput = Options.audio;
        done();
    }
}

/**
 * @function checkDependencies
 * verify the system has any required dependencies for generating ssl certs.
 * @param {function} done  node style callback(err)
 */
function checkDependencies(done) {
    // if they provide a executable path then we don't check
    if (Options.ffmpegPath) {
        done();
        return;
    }
    if (Options.ffprobePath) {
        done();
        return;
    }

    // verify we have 'ffmpeg'
    utils.checkDependencies(["ffmpeg", "ffprobe"], done);
}

function execute(done, err) {
    var ffmpegExe = "ffmpeg";
    var ffprobeExe = "ffprobe";
    var totalLength = 0;
    var backgroundLength = 0;
    var loopsNeeded = 1;
    if (Options.ffmpegPath) {
        ffmpegExe = Options.ffmpegPath;
    }
    if (Options.ffprobePath) {
        ffprobeExe = Options.ffprobePath;
    }

    if (Options.backgroundType === "video") {
        let backgroundResized = path.join(Options.images, "bgResized" + Options.backgroundVideoUrl.replace(/^[^.]*./, "."));
        let backgroundLooped = path.join(Options.images, "bgLooped" + Options.backgroundVideoUrl.replace(/^[^.]*./, "."));
        let videoAlpha = path.join(Options.images, "videoAlpha.avi");
        let loopFile = path.join(Options.images, "list.txt");
        let videoLayered = path.join(Options.images, "videoLayered" + Options.output.replace(/^[^.]*./, "."));
        
        
        
        new Promise((resolve, reject) => {
        
            console.log("step 1");
            const cropResize = new FFMpegProgress(["-i", Options.backgroundVideoUrl, "-vf", "crop=in_h*3/2:in_h,scale=-2:480", "-c:a", "copy", backgroundResized], {
                cmd: ffmpegExe
            });
            cropResize.on('progress', (data) => {
                console.log(JSON.stringify(data));

                const percent = Math.floor(data.progress * 100);
                let remainingTime = Math.round(data.eta);
                let message = `Step 2 of 6: Resizing background video... ${percent}% (Approximately ${remainingTime}s remaining)`;
                console.log(message, data.progress);
                Options.onProgress(
                    message,
                    percent,
                );
            });
            
            cropResize.once('end', (data) => {
                resolve();
            });

        }).then(() => {
            return new Promise((resolve, reject) => {
                
                console.log("step 2");
                shell.exec(
                    `"${ffprobeExe}" -i "${Options.audioInput}" -v error -select_streams a:0 -show_format -show_streams`,
                    (code, stdout, stderr) => {
                        if (code !== 0) {
                            reject(new Error(stderr || stdout));
                        }
                        var matched = stdout.match(/duration="?(\d*\.\d*)"?/);
                        if (matched && matched[1]) {
                            totalLength = parseFloat(matched[1]);
                            console.log("---------------------> totalLength: ", totalLength);
                            resolve();
                        } else {
                            reject(new Error('No duration found!'));
                        }
                    });
                
            });
        }).then(() => {
            return new Promise((resolve, reject) => {
                
                console.log("step 3");
                shell.exec(
                    `"${ffprobeExe}" -i "${backgroundResized}" -v error -select_streams a:0 -show_format -show_streams`,
                    (code, stdout, stderr) => {
                        if (code !== 0) {
                            reject(new Error(stderr || stdout));
                            return;
                        }
                        var matched = stdout.match(/duration="?(\d*\.\d*)"?/);
                        if (matched && matched[1]) {
                            backgroundLength = parseFloat(matched[1]);
                            console.log("---------------------> backgroundLength: ", backgroundLength);
                            if (backgroundLength < totalLength) {
                                loopsNeeded = Math.ceil(totalLength/backgroundLength);
                            }
                        } else {
                            reject(new Error('No duration found!'));
                            return;
                        }
                        let loopText = '';
                        if (process.platform === 'win32') {
                            backgroundResized = backgroundResized.replace(/\\/g, '\\\\');
                        }
                        for (let i = 0; i < loopsNeeded; i++) {
                            loopText += `file ${backgroundResized}\n`;
                        }
                        console.log("loopText: ", loopText);
                        fs.writeFileSync(loopFile, loopText);
                        resolve();
                    });
                
            });
        }).then(() => {
            return new Promise((resolve, reject) => {
                
                console.log("step 4");
                let message = `Step 3 of 6: Adjusting background video time to match animation...`;
                const adjustTime = new FFMpegProgress(["-f", "concat", "-safe", 0, "-i", loopFile, "-c", "copy", backgroundLooped], {
                    cmd: ffmpegExe
                });
                adjustTime.on('progress', (data) => {
                    console.log(JSON.stringify(data));

                    const percent = Math.floor(data.progress * 100);
                    let remainingTime = Math.round(data.eta);
                    ;
                    console.log(message, data.progress);
                    Options.onProgress(
                        `${message} ${percent}% (Approximately ${remainingTime}s remaining)`,
                        percent,
                    );
                });
                
                adjustTime.once('end', (data) => {
                    Options.onProgress(
                        `${message} 100%`,
                        100,
                    );
                    resolve();
                });
                
            });
        }).then(() => {
            return new Promise((resolve, reject) => {
            
                console.log("step 5");
                let message = `Step 4 of 6: Combining animation frames...`;
                const combinePNGs = new FFMpegProgress(["-framerate", Options.framerateIn, "-i", path.join(Options.images,"frame_%06d.png"), "-vcodec", "ffvhuff", videoAlpha], {
                    cmd: ffmpegExe
                });
                combinePNGs.on('progress', (data) => {
                    console.log(JSON.stringify(data));

                    const percent = Math.floor(data.progress * 100);
                    let remainingTime = Math.round(data.eta);
                    console.log(message, data.progress);
                    Options.onProgress(
                        `${message} ${percent}% (Approximately ${remainingTime}s remaining)`,
                        percent,
                    );
                });
                
                combinePNGs.once('end', (data) => {
                    Options.onProgress(
                        `${message}... 100%`,
                        100,
                    );
                    resolve();
                });
            });
        }).then(() => {
            return new Promise((resolve, reject) => {
            
                console.log("step 6");
                let message = `Step 5 of 6: Combining background video and animation...`;
                const combinePNGs = new FFMpegProgress(["-i", backgroundLooped, "-i", videoAlpha, "-filter_complex", "[0:0][1:0]overlay[out]", "-shortest", "-map", "[out]", "-map", "1:0", "-pix_fmt", "yuv420p", "-c:a", "copy", "-c:v", "libx264", "-crf", 18, videoLayered], {
                    cmd: ffmpegExe
                });
                combinePNGs.on('progress', (data) => {
                    console.log(JSON.stringify(data));

                    const percent = Math.floor(data.progress * 100);
                    let remainingTime = Math.round(data.eta);
                    console.log(message, data.progress);
                    Options.onProgress(
                        `${message} ${percent}% (Approximately ${remainingTime}s remaining)`,
                        percent,
                    );
                });
                
                combinePNGs.once('end', (data) => {
                    Options.onProgress(
                        `${message}... 100%`,
                        100,
                    );
                    resolve();
                });
            });
        }).then(() => {
            return new Promise((resolve, reject) => {
            
                console.log("step 7");
                let message = `Step 6 of 6: Adding audio to video...`;
                const combinePNGs = new FFMpegProgress(["-i", videoLayered, "-i", Options.audioInput, "-pix_fmt", "yuv420p", Options.output], {
                    cmd: ffmpegExe
                });
                combinePNGs.on('progress', (data) => {
                    console.log(JSON.stringify(data));

                    const percent = Math.floor(data.progress * 100);
                    let remainingTime = Math.round(data.eta);
                    console.log(message, data.progress);
                    Options.onProgress(
                        `${message} ${percent}% (Approximately ${remainingTime}s remaining)`,
                        percent,
                    );
                });
                
                combinePNGs.once('end', (data) => {
                    Options.onProgress(
                        `${message}... 100%`,
                        100,
                    );
                    done();
                });
            });
        }).catch((err) => {
            done(err);
        });

    } else {
        
        Options.onProgress("Step 6 of 6: Combining audio and frames into video...", 100);
        shell.exec(
            `"${ffmpegExe}" -framerate ${Options.framerateIn} -i "${path.join(
                Options.images,
                "frame_%06d.png"
            )}" -i "${Options.audioInput}" ${
                Options.framerateOut ? `${Options.framerateOut} ` : ""
            } -pix_fmt yuv420p "${Options.output}"`,
            (code, stdout, stderr) => {
                if (code !== 0) {
                    var error = new Error(stderr || stdout);
                    done(error);
                    return;
                }
                done();
            }
        );
    }

}