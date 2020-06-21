const fs = require('fs');
const process = require('process');
const os = require('os');
const path = require('path');
const {
  Project,
  Book,
  Chapter,
  getDirectories
} = require('./util');

const PROJECT_TYPE = 'hearThis'

function getDefaultDataDirectory() {
  switch (process.platform) {
    case 'win32':
      return 'C:/ProgramData/SIL/HearThis/';
    case 'darwin':
    default:
      return `${os.homedir()}/hearThisProjects/`;
  }
}

const DEFAULT_XML_NAME = 'info.xml';
const DEFAULT_DATA_DIR = getDefaultDataDirectory();

function getProjectStructure() {
  try {
    let projectNames = getDirectories(DEFAULT_DATA_DIR);
    let projects = projectNames.map(name => makeProject(name));

    return projects;
  } catch {
    return [];
  }
}

function makeProject(name) {
  let project = new Project(PROJECT_TYPE);
  project.name = name;
  const bookNames = getDirectories(path.join(DEFAULT_DATA_DIR, name));
  project.books = bookNames
    .map(bookName => makeBook(name, bookName))
    .filter(book => book.chapters.length);
  return project;
}

function makeBook(projectName, name) {
  let book = new Book();
  book.name = name;
  let chapterNames = getDirectories(
    path.join(DEFAULT_DATA_DIR, projectName, name),
  );

  let naturalSortChapterNames = chapterNames
    .sort(new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'}).compare);

  book.chapters = naturalSortChapterNames
    .map(chapterName => makeChapter(projectName, name, chapterName))
    .filter(chapter => chapter.audioFiles.length > 0);
  return book;
}

function makeChapter(projectName, bookName, name) {
  let chapter = new Chapter();
  chapter.name = name === '0' ? 'Intro' : parseInt(name).toString();
  let chapterFiles = fs.readdirSync(
    path.join(DEFAULT_DATA_DIR, projectName, bookName, name),
  );
  chapter.audioFiles = chapterFiles
    .filter(file => file !== DEFAULT_XML_NAME)
    .map(fileName =>
      path.join(DEFAULT_DATA_DIR, projectName, bookName, name, fileName),
    );

  chapter.textXmlFile = chapterFiles.find(file => file === DEFAULT_XML_NAME);
  if (chapter.textXmlFile)
    chapter.textXmlFile = path.join(
      DEFAULT_DATA_DIR,
      projectName,
      bookName,
      name,
      chapter.textXmlFile,
    );
  chapter.fullPath = path.join(DEFAULT_DATA_DIR, projectName, bookName, name);
  return chapter;
}

module.exports = {
  PROJECT_TYPE,
  getProjectStructure,
};