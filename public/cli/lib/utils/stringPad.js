//
// stringPad
// return a string padded with spaces at the end.
//

/**
 * stringPad
 * add spaces to the end of a string to make it $length
 * @param {string} str  the string to pad
 * @param {length} length how long to make the string
 * @return {string}
 */
module.exports = function stringPad(str, length) {
    while (str.length < length) {
        str += " ";
    }
    return str;
};
