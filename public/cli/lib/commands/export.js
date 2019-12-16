//
// export
// convert the text & export files into a usable format
//
// options:
//
var async = require("async");
var path = require("path");
var shell = require("shelljs");
var utils = require(path.join(__dirname, "..", "utils", "utils"));
// var Setup = require(path.join(__dirname, "setup.js"));

var Options = {}; // the running options for this command.

shell.config.execPath = shell.which('node');

//
// Build the Install Command
//
var Command = new utils.Resource({
    command: "export",
    params: "",
    descriptionShort:
        "convert the text and export files into an intermediate format.",
    descriptionLong: `
`
});

module.exports = Command;

Command.help = function() {
    console.log(`

  usage: $ bbk export --images=[images] --audio=[audio] --output=[output]

  [name] : the name of the directory to install the AppBuilder Runtime into.

  [options] :
    --images        : path to the image folder
    --audio         : path to the audio file
    --output        : output name

  examples:

    $ bbk export --images=/path/to/image  --audio=/path/to/audio --output=file
        - reads in /path/to/image
        - reads in /path/to/audio
        - output format to console

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

                    let requiredParams = ["images", "audio", "output"];
                    let isValid = true;

                    // check for valid params:
                    requiredParams.forEach((p) => {
                        if (!Options[p]) {
                            console.log(`missing required param: [${p}]`);
                            isValid = false;
                        }
                    });

                    if (!isValid) {
                        Command.help();
                        process.exit(1);
                    }

                    done();
                },
                checkDependencies,
                execute
            ],
            (err) => {
                // shell.popd("-q");
                // if there was an error that wasn't an ESKIP error:
                if (err && (!err.code || err.code != "ESKIP")) {
                    reject(err);
                    return;
                }

                resolve();
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
    utils.checkDependencies(["docker"], done);
}

function execute(done) {
    let getSource = (path) => {
        let bracket;
        let source;

        if ("win32" == process.platform) {
            bracket = "";
            source = "%cd%";
        } else {
            bracket = '"';
            source = "$(pwd)";
        }

        if (path) source += `/${path}`;

        return `${bracket}${source}${bracket}`;
    };

    shell.exec(`docker run \
--mount type=bind,source=${getSource(Options.images)},target=/app/images \
--mount type=bind,source=${getSource(Options.audio)},target=/app/sound.mp3 \
--mount type=bind,source=${getSource()},target=/app/output skipdaddy/bbkcli:develop \
bbk ffmpeg --images=images --audio=sound.mp3 --output=output/${
        Options.output
    }`);
    done();
}
