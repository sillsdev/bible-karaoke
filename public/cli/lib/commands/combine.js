//
// combine
// merge multiple chapter video files together
//
// options:
//
const fs = require("fs");
const path = require("path");
const shell = require("shelljs");
const tempy = require("tempy");
const utils = require(path.join(__dirname, "..", "utils", "utils"));

var Options = {}; // the running options for this command.

//
// Build the Install Command
//
var Command = new utils.Resource({
    command: "combine",
    params: "",
    descriptionShort:
        "merge multiple chapter video files together",
    descriptionLong: ``
});

module.exports = Command;

Command.help = function () {
    console.log(`

  usage: $ bbk combine --list=[filename] --output=[filename]


  [options] :
    --list       : path to the list video files .txt
    --output     : path to the output file

  examples:

    $ bbk combine --list=/path/to/mylist.txt  --output=/path/to/output.mp4

`);
};


Command.run = async (options) => {

    // copy our passed in options to our Options
    for (var o in options) {
        Options[o] = options[o];
    }

    if (!Options.output) {
        Log("missing required param: [output]");
        Command.help();
        process.exit(1);
    }
    else {
        // if this isn't an absolute path, then convert to one:
        if (!path.isAbsolute(Options.output)) {
            Options.output = path.join(process.cwd(), Options.output);
        }
    }

    return await Promise.resolve()
        .then(() => new Promise((resolve, reject) => {
            if (Options.list)
                return resolve();

            Options.list = path.join(tempy.directory(), "outputList.txt");

            fs.writeFile(
                Options.list,
                Options.fileList.map((f) => `file '${f}'`).join("\n"),
                (err) => {
                    return err ? reject(err): resolve();
                });
        }))
        .then(() => new Promise((resolve, reject) => {
            let ffmpegExe = Options.ffmpegPath || "ffmpeg";

            shell.exec(
                `"${ffmpegExe}" -f concat -safe 0 -i "${Options.list}" -c copy "${Options.output}"`,
                (err) => {
                    err ? reject(err) : resolve();
                }
            );

        }));

};