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

/**
 * timing options
 * @typedef {{output: string, input: string, ffprobePath: string, Log: function}} TimingOptions
 */
var Options = {
    output: undefined,
    input: undefined,
    ffprobePath: undefined,
    Log: function (){}
}; // the running options for this command.

var inputData = null;
var finalFormat = [];

/**
 * @type {string[]}
 */
var skipFiles = [];
var allFiles = [];

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
    --input      : path to the HearThis recording .xml ( AND audio files )
    --output     : (optional) path to the timing file
    --ffprobePath: (optional) path to your ffprobe executable

  examples:

    $ bbk timing --input=/path/to/info.xml  --output=/path/to/formatted.js
        - reads in /path/to/info.xml
        - outputs json timing to /path/to/formatted.js

`);
};

var Log = null;

/**
 *
 * @param {TimingOptions} options
 * @returns {Promise<string[]>}
 */
Command.run = function(options) {
    return new Promise((resolve, reject) => {
        async.series(
            [
                // copy our passed in options to our Options
                (done) => {
                    for (var o in options) {
                        Options[o] = options[o];
                    }

                    if (options.Log) {
                        Log = options.Log;
                    } else {
                        var logError = new Error("Missing Log utility in timing.js")
                        console.error(logError);
                        done(logError);
                        return;
                    }

                    // check to see if input file exists

                    // check for valid params:
                    if (!Options.input) {
                        Log("missing required param: [input]");
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

                    // #50: prevent ghosting of previous bbk runs.
                    // originally this was designed to be a command run on the
                    // cli each time we generate a video. But now that we are 
                    // require()d into the Electron app, we need to be intentional
                    // on resetting these variables on each run.
                    finalFormat = [];
                    skipFiles = [];

                    done();
                },
                checkDependencies,
                checkInputExists,
                grabAudioFiles,
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
                resolve(skipFiles);
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
            var msg = `Invalid path to input file [${Options.input}]`
            Log(msg);
            var error = new Error(msg);
            error.err = err;
            done(error);
            return;
        }
        inputData = contents;

        done();
    });
}

/**
 * @function grabAudioFiles
 * scan the input directory for the audio files
 * @param {function} done  node style callback(err)
 */
function grabAudioFiles(done) {
    // scan the .input dir for all audio files
    var dirName = path.dirname(Options.input);
    allFiles = fs.readdirSync(dirName);
    done();
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
              var error = new Error(`Error trying to read audio length [${fileName}]. ` + err);
              cb(error);
            });
        } catch (e) {
            var error = new Error(`Error trying to open file [${fileName}]. ` + e);
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

        // make sure lines is an array
        if (!Array.isArray(lines)) {
            lines = [lines];
        }

        // if we have processed all the lines, return
        if (lines.length == 0) {
            cb();
        } else {
            var line = lines.shift();

            // Fix #20 : ignore Chapter Headings
            if (line.HeadingType && line.HeadingType._text == "c") {
                // try to find the corresponding audio file for the Header
                // add mark it for skipping
                var audioPartial = `${parseInt(line.LineNumber._text)-1}.`;
                var audioFile = allFiles.find((f)=>{ return f.indexOf(audioPartial) == 0;})
                if (audioFile) {
                    console.log(`skipping audio file: ${audioFile}`);
                    
                    // add full path to file
                    skipFiles.push(path.join(path.dirname(Options.input),audioFile));
                }

                processLine(lines, startTime, cb);
                return;
            }
            
            // get the text
            var text = line.Text._text;
            
            // check if the text is a heading and make it bold if so
            if (line.Heading._text === "true") {
                text = "<strong>"+text+"</strong>";
            }

            // convert to initial timingObj
            var timingObj = {
                type: "caption",
                index: parseInt(line.LineNumber._text) - 1,
                start: startTime,
                end: 0,
                duration: 0,
                content: text,
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
