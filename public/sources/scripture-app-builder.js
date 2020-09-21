const fs = require('fs');
const { JSDOM } = require('jsdom');
const _ = require('lodash/core');
const path = require('path');
const grammar = require('usfm-grammar');
const { Project, Book, Chapter, getDirectories, bibleNames } = require('./util');

const PROJECT_TYPE = 'scriptureAppBuilder';

function getProjectStructure(rootDirectories = []) {
  try {
    return _.flatten(
      rootDirectories.map((directory) => {
        return getDirectories(directory).map((name) => makeProject(name, directory));
      })
    );
  } catch (error) {
    console.error(error);
    return [];
  }
}

function makeProject(name, directory) {
  const fileName = path.join(directory, name, name) + '.appDef';
  const contents = fs.readFileSync(fileName, 'utf8');
  const dom = new JSDOM(contents, { contentType: 'text/xml' });

  return new Project(PROJECT_TYPE, name, makeBooks(dom.window.document));
}

function makeBooks(xmlDoc) {
  const books = [];
  const booksIdElement = xmlDoc.querySelector('books[id]');
  const collectionId = booksIdElement ? booksIdElement.id : '';
  const bookIdSelector = 'book[id]';
  const bookIds = _.map(xmlDoc.querySelectorAll(bookIdSelector), (n) => (n.id ? n.id : undefined)).filter(
    (id) => id != null && id !== ''
  );
  for (const bookId of bookIds) {
    const bookNameSelector = "book[id='" + bookId + "'] > name";
    const bookName = xmlDoc.querySelector(bookNameSelector).textContent;
    if (bookName != null && bookName !== '') {
      const book = new Book(bookName, makeChapters(collectionId, bookId, xmlDoc));

      if (book.chapters.length > 0) {
        books.push(book);
      }
    }
  }

  return books;
}

function makeChapters(collectionId, bookId, xmlDoc) {
  const chapters = [];
  // find all chapters with audio
  let isPageSchema = true;
  let chapterNumbers = _.map(xmlDoc.querySelectorAll("book[id='" + bookId + "'] > page[num] > audio"), (n) =>
    n.parentElement.hasAttributes() ? n.parentElement.attributes.getNamedItem('num').value : undefined
  ).filter((cn) => cn != null && cn !== '');
  if (chapterNumbers.length === 0) {
    // attempt to use old schema
    isPageSchema = false;
    chapterNumbers = _.map(xmlDoc.querySelectorAll("book[id='" + bookId + "'] > audio[chapter]"), (n) =>
      n.hasAttributes() ? n.attributes.getNamedItem('chapter').value : undefined
    ).filter((cn) => cn != null && cn !== '');
  }

  for (const chapterNumber of chapterNumbers) {
    const chapterName = chapterNumber === '0' ? 'Intro' : '' + chapterNumber;
    const fileSelector = isPageSchema
      ? "book[id='" + bookId + "'] > page[num='" + chapterNumber + "'] > audio > filename"
      : "book[id='" + bookId + "'] > audio[chapter='" + chapterNumber + "'] > filename";
    const fileNames = _.map(xmlDoc.querySelectorAll(fileSelector), (n) => n.textContent).filter(
      (fn) => fn != null && fn !== ''
    );
    chapters.push(new Chapter(chapterName, '', fileNames));
  }

  return chapters;
}

// eslint-disable-next-line no-unused-vars
function makeTextXMLFile(project, book, chapter, dest, directory) {
  const fileName = path.join(directory, project, project + '.appDef');
  const contents = fs.readFileSync(fileName, 'utf8');
  const dom = new JSDOM(contents, { contentType: 'text/xml' });
  const xmlDoc = dom.window.document;

  const SABBookName = _.find(bibleNames, 'BibleName', book).SAB; //this converts the passed in regular bible book name into SAB abbreviation
  const filename = xmlDoc.querySelector('book[id="' + SABBookName + '"] > filename').textContent;
  console.log('SFM filename:', filename);
  const sfmFileName = path.join(directory, project, project + '_data', 'books', 'C01', filename);

  let xmlString = '<?xml version="1.0" encoding="utf-8"?>';
  xmlString += '<ChapterInfo Number="' + chapter + '"><Recordings>';

  fs.readFile(sfmFileName, 'utf8', function (_err, fileContents) {
    //TODO prefix sfmFileName with path where SFM is located
    fileContents = fileContents.concat('\\EOF'); //end of file does not have chapter tag, add this tag manually so can match in one regex

    const firstLinePattern = /\\id (.*?)\n/gs;
    const firstLine = fileContents.match(firstLinePattern);

    const regexpChapter = /\\c ([0-9]+)(.*?)(?=(\\c|\\EOF))/gs;
    const chapterArray = fileContents.match(regexpChapter);

    const chapterText = firstLine + chapterArray[chapter - 1];
    const jsonCleanOutput = new grammar.USFMParser(chapterText, grammar.SCRIPTURE);

    const regexpVerse = /"verseText":"(.*?)"/gs;
    const verseArray = JSON.stringify(jsonCleanOutput).match(regexpVerse);

    const regReplace = /<|<<|>|>>/gi;
    for (let i = 0; i < verseArray.length; i++) {
      xmlString += '<ScriptLine><LineNumber>' + (i + 1) + '</LineNumber><Text>';
      xmlString += verseArray[i].replace(regReplace, '');
      // console.log(xmlString);
      xmlString += '</Text><RecordingTime>2020-02-27T03:41:28.3487045Z</RecordingTime><Verse>' + (i + 1);
      xmlString += '</Verse><Heading>false</Heading></ScriptLine>';
      // console.log('verse ' + i+1 + xmlString);
    }
    xmlString += '  </Recordings><Source /></ChapterInfo>';
    // console.log(xmlString);
    fs.appendFileSync(dest + '/' + book + '-' + chapter + '.xml', xmlString);
  });
}

// test case 1, just to output result of the function, need to look out for projects with on audio files, they will be returned but the project.books array will be empty by design
// console.log(JSON.stringify(getProjectStructure(['C:/Users/Ira/Documents/App Builder/Scripture Apps/App Projects/']), null, 2));

// test case 2: make xml file by passing (project, book, chapter, destination, directory)
// makeTextXMLFile('ShanBiblePublish latest-Chant', 'Leviticus', '2', '/Users/ray/Downloads', '/Users/ray/Documents/AppBuilder/Scripture Apps/App Projects/');
// makeTextXMLFile('World English Bible Sample', 'Genesis', '2', 'C:/Users/Ira/Downloads', 'C:/Users/Ira/Documents/App Builder/Scripture Apps/App Projects/');

module.exports = {
  PROJECT_TYPE,
  getProjectStructure,
};
