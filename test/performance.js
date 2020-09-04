//script for testing performance, maybe we can convert these to unit tests later on
const fs = require("fs-extra");
const Timings = require("../public/cli/lib/commands/timing").run;
const Frames = require("../public/cli/lib/commands/frames").run;

function executeGenerateTimings() {
    return Timings({
        input: '../archive/sampledata/info.xml',
        Log: function (msg) {
        },
        ffprobePath: __dirname + '/../binaries/ffprobe.exe'
    });
}

function executeGenerateFrames() {
    return Frames({
        inputJSON: __dirname + '/bbkFormat.js',
        Log: function (msg) {        },
    });
}

/**
 * pass in a function to measure the performance of
 * function must return a promise
 * @param actionToMeasure
 * @returns Promise
 */
async function measurePerformance(actionToMeasure) {
    let startTime = Date.now();
    let result = await actionToMeasure();
    let endTime = Date.now();
    return [endTime - startTime, result];
}

let actionsToTest = {
    timing: executeGenerateTimings,
    render: executeGenerateFrames,
    postrender: function (renderLocation) {
        console.log('output location: ', renderLocation);
        fs.removeSync(renderLocation);
    }
};

let numberFormatter = new Intl.NumberFormat();

async function executeTests() {
    for (let key of Object.keys(actionsToTest)) {
        if (key.startsWith('post')) continue;

        let [executionTime, result] = await measurePerformance(actionsToTest[key]);
        let postExecute = actionsToTest['post' + key];
        if (postExecute)
            postExecute(result);

        console.info(`${key}: ${numberFormatter.format(executionTime)} ms`);
    }
}

executeTests().catch(e => {
    console.error(e);
})
