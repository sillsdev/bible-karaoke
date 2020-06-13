//
// frames
// generate the initial set of images from the provided timing file.
//
// options:
//
var async = require("async");
var EventEmitter = require("events");
var fs = require("fs");
var path = require("path");
var ProgressBar = require("progress");
var { render } = require("../rendering/render-frames.js");
var shell = require("shelljs");
var utils = require(path.join(__dirname, "..", "utils", "utils"));

var Options = {}; // the running options for this command.
var pathFramesFolder = null; // the path to the folder where the frames are generated.
var lastCurrentFrame = 0;
var lastUpdateFrameDate = null;

var Log = null;

//
// Build the Install Command
//
var Command = new utils.Resource({
    command: "frames",
    params: "",
    descriptionShort:
        "generate the initial set of images from the provided timing file.",
    descriptionLong: `
`
});

module.exports = Command;

Command.help = function() {
    console.log(`

  usage: $ bbk frames --inputJSON=[bbkFormat.js] --bgFile=[path/to/image.png] --fontFamily=[name of font family] --output=[path/to/output/folder]


  [options] :
    --inputJSON         : path to the converted timing file (bbkFormat.js)
    --bgFile            : (optional) path to a background image 
    --bgColor           : (optional) color of background defaults to ""#CCC"
    --fontFamily        : (optional) Name of font family defaults to "Helvetica Neue, Helvetica, Arial, sans-serif"
    --fontSize          : (optional) Font size defaults to "20" (pt).
    --fontColor         : (optional) Font color defaults to "#555".
    --fontItalic        : (optional) Style font with italics defaults to "false".
    --fontBold          : (optional) Style font with bold defaults to "false".
    --highlightColor    : (optional) Color of highlight defaults to a yellow color.
    --speechBubbleColor : (optional) Color of speech bubble defaults to transparent.

  examples:

    $ bbk frames --inputJSON=./bbkFormat.js
        - reads in ./bbkFormat.js
        - outputs frames to ./_frames (by default)

`);
};

Command.run = function(options) {
    return new Promise((resolve, reject) => {
        async.series(
            [
                // copy our passed in options to our Options
                (done) => {
                    for (var o in options) {
                        Options[o] = options[o];
                    }

                    if (!options.Log) {
                        var logError = new Error("missing Log parameter to frames.js");
                        done(logError);
                        return;
                    } else {
                        Log = options.Log;
                    }

                    // check to see if input file exists

                    // check for valid params:
                    if (!Options.inputJSON) {
                        Log("missing required param: [inputJSON]");
                        Command.help();
                        process.exit(1);
                    } else {
                        // if this isn't an absolute path, then convert to one:
                        if (!path.isAbsolute(Options.inputJSON)) {
                            Options.inputJSON = path.join(
                                process.cwd(),
                                Options.inputJSON
                            );
                        }
                    }

                    if (Options.bgFile) {
                        // if this isn't an absolute path, then convert to one:
                        if (!path.isAbsolute(Options.bgFile)) {
                            Options.bgFile = path.join(
                                process.cwd(),
                                Options.bgFile
                            );
                        }
                    }

                    if (!Options.output) {
                        Options.output = path.join(process.cwd(), "_frames");
                    }
                    done();
                },
                checkDependencies,
                callRender
            ],
            (err) => {
                // shell.popd("-q");
                // if there was an error that wasn't an ESKIP error:
                if (err && (!err.code || err.code != "ESKIP")) {
                    reject(err);
                    return;
                }
                resolve(pathFramesFolder);
            }
        );
    });
};

/**
 * @function checkDependencies
 * verify the system has any required dependencies for generating ssl certs.
 * @param {function} done  node style callback(err)
 */
function checkDependencies(done) {
    // verify we have 'git'
    utils.checkDependencies([], done);
}

/**
 * @function callRender
 * call the render-frames.js code to generate the frames.
 * @param {function} done  node style callback(err)
 */
function callRender(done) {
    var notify = new EventEmitter();
    var bar;
    notify.on("rendered", (data) => {
        if (Options.onProgress) {
            onProgress(data);
        }
        // console.log(`rendered: ${data.curr}/${data.total}`);
        if (!bar) {
            bar = new ProgressBar("creating frames: [:bar] :current/:total ", {
                curr: data.curr,
                total: data.total,
                incomplete: " "
            });
        } else {
            bar.tick();
        }
    });
    Log("calling render with Options:", Options);
    render(Options.inputJSON, Options.textLocation, Options.bgType, Options.bgFile, Options.bgColor, Options.fontFamily, Options.fontColor, Options.fontSize, Options.fontItalic, Options.fontBold, Options.highlightColor, Options.speechBubbleColor, Options.speechBubbleOpacity, notify)
        .then((location) => {
            // console.log("frames location:", location);
            pathFramesFolder = location;
            done();
        })
        .catch(done);
}

/**
 * @function calculateRemainTime
 * 
 * @param {number} currFrame
 * @param {number} totalFrame
 * @return {string}
 */
function calculateRemainTime(currFrame, totalFrame) {

    let result = "";
    let currentDate = new Date();

    // Skip calculating if it is the first run
    if (lastUpdateFrameDate != null) {

        // ((currentDate - lastUpdateFrameDate) / (currFrame - lastCurrentFrame)) * (totalFrame - currFrame)

        let spendTime = currentDate - lastUpdateFrameDate; // milliseconds
        let progressFrame = currFrame - lastCurrentFrame;
        let spendTimePerFrame = spendTime / progressFrame;
        let remainingFrames = totalFrame - currFrame;

        let estimateTime = remainingFrames * spendTimePerFrame; // milliseconds

        // Convert milliseconds to a readable string
        let days = (estimateTime / 86400000).toFixed(0);
        let hours = (estimateTime / 3600000).toFixed(0);
        let minutes = (estimateTime / 60000).toFixed(0);
        let seconds = (estimateTime / 1000).toFixed(0);

        if (seconds < 1)
            result = "";
        else if (seconds < 60) 
            result = `${seconds} second${seconds > 1 ? 's' : ''}`;
        else if (minutes == 1)
            result = `1 minute ${seconds - 60} seconds`;
        else if (minutes < 60)
            result = `${minutes} minutes`;
        else if (hours < 24)
            result = `${hours} hour${hours > 1 ? 's' : ''}`;
        else
            result = `${days} day${days > 1 ? 's' : ''}`;

        if (result)
            result = `(Approximately ${result} remaining)`;
    }

    lastUpdateFrameDate = currentDate;
    lastCurrentFrame = currFrame;

    // clear when it done
    if (currFrame >= totalFrame) {
        lastUpdateFrameDate = null;
        lastCurrentFrame = 0;
    }

    return result;
}

const onProgress = utils.throttle(data => {
    const percent = (data.curr / data.total) * 100;
    let remainingTime = calculateRemainTime(data.curr, data.total);
    Options.onProgress(
        `Rendering video frames... ${Math.floor(percent)}% ${remainingTime}`,
        percent,
    );
}, 1000);
