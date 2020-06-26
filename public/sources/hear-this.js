const fs = require('fs');
const path = require('path');
const flatten = require('lodash/flatten');
const {
  Project,
  Book,
  Chapter,
  getDirectories
} = require('./util');

const PROJECT_TYPE = 'hearThis'

const DEFAULT_XML_NAME = 'info.xml';

function getProjectStructure(rootDirectories = []) {
  try {
    return flatten(
      rootDirectories.map(directory => {
        return getDirectories(directory).map(name => makeProject(name, directory));
      })
    )
  } catch(error) {
    console.error(error)
    return [];
  }
}

function makeProject(name, directory) {
  let project = new Project(PROJECT_TYPE);
  project.name = name;
  const bookNames = getDirectories(path.join(directory, name));
  project.books = bookNames
    .map(bookName => makeBook(name, bookName, directory))
    .filter(book => book.chapters.length);
  return project;
}

function makeBook(projectName, name, directory) {
  let book = new Book();
  book.name = name;
  let chapterNames = getDirectories(
    path.join(directory, projectName, name),
  );

  let naturalSortChapterNames = chapterNames
    .sort(new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'}).compare);

  book.chapters = naturalSortChapterNames
    .map(chapterName => makeChapter(projectName, name, chapterName, directory))
    .filter(chapter => chapter.audioFiles.length > 0);
  return book;
}

function makeChapter(projectName, bookName, name, directory) {
  let chapter = new Chapter();
  chapter.name = name === '0' ? 'Intro' : parseInt(name).toString();
  let chapterFiles = fs.readdirSync(
    path.join(directory, projectName, bookName, name),
  );
  chapter.audioFiles = chapterFiles
    .filter(file => file !== DEFAULT_XML_NAME)
    .map(fileName =>
      path.join(directory, projectName, bookName, name, fileName),
    );

  chapter.textXmlFile = chapterFiles.find(file => file === DEFAULT_XML_NAME);
  if (chapter.textXmlFile)
    chapter.textXmlFile = path.join(
      directory,
      projectName,
      bookName,
      name,
      chapter.textXmlFile,
    );
  chapter.fullPath = path.join(directory, projectName, bookName, name);
  return chapter;
}

module.exports = {
  PROJECT_TYPE,
  getProjectStructure,
};