const hearThis = require('./hear-this');
const scriptureAppBuilder = require('./scripture-app-builder');

module.exports = {
  [hearThis.PROJECT_TYPE]: hearThis,
  [scriptureAppBuilder.PROJECT_TYPE]: scriptureAppBuilder
}
