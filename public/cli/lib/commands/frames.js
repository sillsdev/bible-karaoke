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

  usage: $ bbk frames --inputJSON=[bbkFormat.js] --bgImage=[path/to/image.png] --fontFamily=[name of font family] --output=[path/to/output/folder]


  [options] :
    --inputJSON  : path to the converted timing file (bbkFormat.js)
    --bgImage    : (optional) path to a background image 
    --fontFamily    : (optional) Name of font family defaults to "Helvetica Neue, Helvetica, Arial, sans-serif"

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

                    // check to see if input file exists

                    // check for valid params:
                    if (!Options.inputJSON) {
                        console.log("missing required param: [inputJSON]");
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

                    if (Options.bgImage) {
                        // if this isn't an absolute path, then convert to one:
                        if (!path.isAbsolute(Options.bgImage)) {
                            Options.bgImage = path.join(
                                process.cwd(),
                                Options.bgImage
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
    render(Options.inputJSON, Options.bgImage, Options.fontFamily, notify)
        .then((location) => {
            // console.log("frames location:", location);
            pathFramesFolder = location;
            done();
        })
        .catch(done);
}

const onProgress = utils.throttle(data => {
    const percent = (data.curr / data.total) * 100;
    Options.onProgress(
        `Rendering video frames... ${Math.floor(percent)}%`,
        percent,
    );
}, 1000);
