const fs = require('fs');
const process = require('process');
const os = require('os');
const path = require('path');
const xml2json = require('xml-js');

module.exports = {
  getProjectStructure,
  getSampleVerses,
};

const isDirectory = source => fs.lstatSync(source).isDirectory();

const getDirectories = source =>
  fs.readdirSync(source).filter(name => isDirectory(path.join(source, name)));

class Project {
  constructor() {
    this.name = '';
    this.books = [];
  }
}

class Book {
  constructor() {
    this.name = '';
    this.chapters = [];
  }
}

class Chapter {
  constructor() {
    this.name = '';
    this.fullPath = '';
    this.audioFiles = [];
    this.textXmlFile = '';
  }
}

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
  let project = new Project();
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

function getSampleVerses(sourceDirectory) {
  try {
    const info = fs.readFileSync(path.join(sourceDirectory, 'info.xml'), 'utf8');
    var jsonInfo = JSON.parse(xml2json.xml2json(info, { compact: true }));
    var verses = jsonInfo.ChapterInfo.Recordings.ScriptLine.slice(0, 4).map( line => {
      // Fix #20 : ignore Chapter Headings
      if (line.HeadingType && line.HeadingType._text == "c") {
          return;
      }
      let text = line.Text._text;
      if (line.Heading._text === "true") {
          text = "<strong>"+text+"</strong>";
      }
      return text;
    });
    // use .filter() to remove any undefined elements
    verses = verses.filter((v)=>{ return v;});
    // only return 3
    if (verses.length > 3) verses.pop();    
    return verses;
  } catch (err) {
    console.error('Failed to get sample verses', err);
    return 'Failed to get sample verses';
  }
}
