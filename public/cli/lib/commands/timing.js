//
// timing
// convert the text & timing files into a usable format
//
// options:
//
var async = require("async");
var execa = require('execa');
var fs = require("fs");
var path = require("path");
var shell = require("shelljs");
var utils = require(path.join(__dirname, "..", "utils", "utils"));
var xml2json = require("xml-js");

var Options = {}; // the running options for this command.

var inputData = null;
var finalFormat = [];

//
// Build the Install Command
//
var Command = new utils.Resource({
    command: "timing",
    params: "",
    descriptionShort:
        "convert the text and timing files into an intermediate format.",
    descriptionLong: `
`
});

module.exports = Command;

Command.help = function() {
    console.log(`

  usage: $ bbk timing --input=[text] --output=[filename]


  [options] :
    --input      : path to the hearthis recording .xml ( AND audio files )
    --output     : (optional) path to the timing file
    --ffprobePath: (optional) path to your ffprobe executable

  examples:

    $ bbk timing --input=/path/to/info.xml  --output=/path/to/formatted.js
        - reads in /path/to/info.xml
        - outputs json timing to /path/to/formatted.js

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
                    if (!Options.input) {
                        console.log("missing required param: [input]");
                        Command.help();
                        process.exit(1);
                    } else {
                        // if this isn't an absolute path, then convert to one:
                        if (!path.isAbsolute(Options.input)) {
                            Options.input = path.join(
                                process.cwd(),
                                Options.input
                            );
                        }
                    }
                    if (!Options.ffprobePath) {
                      Options.ffprobePath = 'ffprobe';
                    }

                    if (!Options.output) {
                        Options.output = path.join(
                            process.cwd(),
                            "bbkFormat.js"
                        );
                    }
                    done();
                },
                checkDependencies,
                checkInputExists,
                convertIt,
                saveOutput
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
    utils.checkDependencies([], done);
}

/**
 * @function checkInputExists
 * verify the path to the input file is correct
 * @param {function} done  node style callback(err)
 */
function checkInputExists(done) {
    fs.readFile(Options.input, "utf8", (err, contents) => {
        if (err) {
            var error = new Error("Invalid path to input file");
            error.err = err;
            done(error);
            return;
        }
        inputData = contents;
        done();
    });
}

/**
 * @function convertIt
 * convert our input data to our output format
 * @param {function} done  node style callback(err)
 */
function convertIt(done) {
    var jsonInput = JSON.parse(xml2json.xml2json(inputData, { compact: true }));
    // console.log(JSON.stringify(jsonInput, null, 4));
    // process.exit();

    var getDuration = (tObj, cb) => {
        // getDuration()
        // fn to find the duration of the related audio file for a timingObject

        var fileName = path.join(
            path.dirname(Options.input),
            `${tObj.index}.wav`
        );

        try {
            getAudioDurationInSeconds(fileName, Options.ffprobePath).then((duration) => {
                tObj.duration = duration * 1000; // convert to ms
                tObj.end = tObj.start + tObj.duration;
                // console.log(`${tObj.content} : ${tObj.duration}`);
                cb();
            }).catch(err => {
              var error = new Error(`Error trying to read audio length [${fileName}]`);
              cb(error);
            });
        } catch (e) {
            var error = new Error(`Error trying to open file [${fileName}]`);
            cb(error);
        }
    };

    var formatWords = (words, tObj, start, cb) => {
        if (words.length == 0) {
            cb();
        } else {
            var word = words.shift();

            // totalChars = total characters
            var totalChars = tObj.content.length;

            // percent duration = wordLengh/totalChars
            //// NOTE: look at this if animation looks off.
            //// +1 to account for an additional space after the word
            //// problem might be last word in phrase...
            var percent = (word.length + 1) / totalChars;

            // wordDuration = percentDuration * tObj.duration

            // add wordEntry to tObj.words
            var entry = {
                word: word,
                start: start,
                end: start + Math.round(percent * tObj.duration)
            };

            // make sure end never goes beyond tObj.start + tObj.duration
            if (entry.end > tObj.start + tObj.duration) {
                entry.end = tObj.start + tObj.duration;
            }
            tObj.words.push(entry);
            formatWords(words, tObj, entry.end, cb);
        }
    };

    var processLine = (lines, startTime, cb) => {
        // process a single line of the input data at a time

        // if we have processed all the lines, return
        if (lines.length == 0) {
            cb();
        } else {
            // get next line
            var line = lines.shift();

            // convert to initial timingObj
            var timingObj = {
                type: "caption",
                index: parseInt(line.LineNumber._text) - 1,
                start: startTime,
                end: 0,
                duration: 0,
                content: line.Text._text,
                text: "",
                words: []
            };

            getDuration(timingObj, (err) => {
                if (err) {
                    cb(err);
                    return;
                } else {
                    // break down the words into durations
                    formatWords(
                        timingObj.content.split(" "),
                        timingObj,
                        timingObj.start,
                        (err) => {
                            if (err) {
                                cb(err);
                                return;
                            }

                            // store timingObj
                            finalFormat.push(timingObj);

                            // next line
                            processLine(
                                lines,
                                timingObj.start + timingObj.duration,
                                cb
                            );
                        }
                    );
                }
            });
        }
    };
    processLine(jsonInput.ChapterInfo.Recordings.ScriptLine, 0, (err) => {
        done(err);
    });
}

/**
 * @function saveOutput
 * save the output to our output file
 * @param {function} done  node style callback(err)
 */
function saveOutput(done) {
    fs.writeFile(
        Options.output,
        `module.exports = ${JSON.stringify(finalFormat, null, 4)}`,
        (err) => {
            if (err) {
                var error = new Error("error saving output file");
                error.err = err;
                done(error);
                return;
            }
            done();
        }
    );
}

// Adapted from https://github.com/caffco/get-audio-duration:

function getFFprobeWrappedExecution(input, ffprobePath) {
  const params = ['-v', 'error', '-select_streams', 'a:0', '-show_format', '-show_streams']

  if (typeof input === 'string') {
    return execa(ffprobePath, [...params, input])
  }

  throw new Error('Given input was not a string')
}

/**
 * Returns a promise that will be resolved with the duration of given audio in
 * seconds.
 *
 * @param  {String} input path to file to be used as input for `ffprobe`.
 *
 * @return {Promise} Promise that will be resolved with given audio duration in
 * seconds.
 */
async function getAudioDurationInSeconds(input, ffprobePath) {
  const { stdout } = await getFFprobeWrappedExecution(input, ffprobePath)
  const matched = stdout.match(/duration="?(\d*\.\d*)"?/)
  if (matched && matched[1]) return parseFloat(matched[1])
  throw new Error('No duration found!')
}
