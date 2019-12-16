/**
 * @function checkDependencies
 *
 * check if the system understands the provided commands.
 *
 * @param {array} requiredCommands
 *        An array of commands that need to be available on the host system
 *        for this command to function.
 *
 * @param {fn} done
 *        A node style callback for when the checks complete.
 */
var shell = require("shelljs");

module.exports = function(requiredCommands, done) {
    requiredCommands = requiredCommands || [];

    var err;

    // verify we have 'git'
    var missingCommands = [];
    requiredCommands.forEach((c) => {
        if (!shell.which(c)) {
            missingCommands.push(c);
        }
    });

    if (missingCommands.length) {
        console.error(`
Install:  missing dependencies: ${missingCommands.join(", ")}
`);
        console.log(
            "Make sure these packages are installed before trying to run this command:"
        );
        missingCommands.forEach((c) => {
            console.log("  - " + c);
        });
        console.log();
        err = new Error(
            `Install:  missing dependencies: ${missingCommands.join(", ")}`
        );
        err._handled = true;
    }

    done(err);
};
