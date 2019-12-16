//
// Utils.js
//
// A common set of reusable fn's for our resource generators.
//

var path = require("path");

var checkDependencies = require(path.join(__dirname, "checkDependencies"));
var Resource = require(path.join(__dirname, "resource"));
var stringPad = require(path.join(__dirname, "stringPad"));

const throttle = (func, limit = 1000) => {
    let inThrottle
    return function() {
        const args = arguments
        const context = this
        if (!inThrottle) {
            func.apply(context, args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
};

module.exports = {
    throttle,
    checkDependencies,
    Resource,
    stringPad
};
