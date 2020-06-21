const {
  Project,
  Book,
  Chapter,
  getDirectories
} = require('./util')

const PROJECT_TYPE = 'scriptureAppBuilder'

function getDefaultDataDirectory() {
  switch (process.platform) {
    case 'win32':
      return '%UserProfile%/Documents/App Builder/Scripture Apps/App Projects/';
    case 'darwin':
    default:
      return `${os.homedir()}/App Builder/Scripture Apps/App Projects/`;
  }
}

function getProjectStructure() {
  return []
}

module.exports = {
  PROJECT_TYPE,
  getProjectStructure,
};