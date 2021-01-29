const fs = require('fs');
const { JSDOM } = require('jsdom');
const _ = require('lodash/core');
const path = require('path');
const grammar = require('usfm-grammar');
const { Project, Book, Chapter, getDirectories, Chapter_SAB, bibleNames, audio, segments } = require('./util');


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

  return new Project(PROJECT_TYPE, name, makeBooks(dom.window.document, name, directory));
}

function makeBooks(xmlDoc, projectName, directory) {
  const books = [];
  const booksIdElement = xmlDoc.querySelector('books[id]');
  const collectionId = booksIdElement ? booksIdElement.id : '';
  const bookIdSelector = 'book[id]';
  const bookIds = _.map(xmlDoc.querySelectorAll(bookIdSelector), (n) => (n.id ? n.id : undefined)).filter(
    (id) => id != null && id !== ''
  );
  for (const bookId of bookIds) {
    const bookNameSelector = "book[id='" + bookId + "'] > name";
    const bookFileNameSelector = "book[id='" + bookId + "'] > filename";

    const bookName = xmlDoc.querySelector(bookNameSelector).textContent;
    const bookFileName = xmlDoc.querySelector(bookFileNameSelector).textContent;

    if (bookName != null && bookName !== '') {
      //TODO: need to make directory for book
      const book = new Book(bookName, makeChapters(collectionId, bookId, bookName, bookFileName, xmlDoc, projectName, directory));

      if (book.chapters.length > 0) {
        books.push(book);
      }
    }
  }
  // console.log(books);
  return books;
}

function makeChapters(collectionId, bookId, bookName, bookFileName, xmlDoc, projectName, directory) {
  const chapters = [];

  // console.log(BookName);
  // console.log(BookName);
  // find all chapters with audio
  let isPageSchema = true;

  //need have timing-filename, otherwise skip
  let chapterNumbers = _.map(xmlDoc.querySelectorAll("book[id='" + bookId + "'] > page[num] > audio > timing-filename"), (n) =>
    n.parentElement.parentElement.hasAttributes() ? n.parentElement.parentElement.attributes.getNamedItem('num').value : undefined
  ).filter((cn) => cn != null && cn !== '');
  if (chapterNumbers.length === 0) {
    // console.log(collectionId + ' ' + bookName + ' has no chapter numbers');
    // attempt to use old schema
    isPageSchema = false;
    chapterNumbers = _.map(xmlDoc.querySelectorAll("book[id='" + bookId + "'] > audio[chapter] > timing-filename"), (n) =>
      n.hasAttributes() ? n.attributes.parentElement.getNamedItem('chapter').value : undefined
    ).filter((cn) => cn != null && cn !== '');
  }

  for (const chapterNumber of chapterNumbers) {
    const chapterName = chapterNumber === '0' ? 'Intro' : '' + chapterNumber;
    const fileSelector = isPageSchema
      ? "book[id='" + bookId + "'] > page[num='" + chapterNumber + "'] > audio > filename"
      : "book[id='" + bookId + "'] > audio[chapter='" + chapterNumber + "'] > filename";

    const timingFileSelector = isPageSchema
      ? "book[id='" + bookId + "'] > page[num='" + chapterNumber + "'] > audio > timing-filename"
      : "book[id='" + bookId + "'] > audio[chapter='" + chapterNumber + "'] > timing-filename";
    // const fileNames = _.map(xmlDoc.querySelectorAll(fileSelector), (n) => n.textContent).filter(
    //   (fn) => fn != null && fn !== ''
    // );

    // const fileLengths = _.map(xmlDoc.querySelector(fileSelector).getAttribute('len'), (n) => n.textContent).filter(
    //   (fn) => fn != null && fn !== ''
    // );

    const audioFileName = xmlDoc.querySelector(fileSelector).textContent;
    const audoFileLength = xmlDoc.querySelector(fileSelector).getAttribute('len');
    const timingFileName = xmlDoc.querySelector(timingFileSelector).textContent;

    //TODO: need to make directory for chapter
    chapters.push(new Chapter_SAB(bookName, chapterName, new audio(audioFileName, audoFileLength), makeSegments(bookName, bookFileName, chapterNumber, audioFileName, timingFileName, projectName, directory, xmlDoc)));
  }

  return chapters;
}

// eslint-disable-next-line no-unused-vars
function makeSegments(bookName, bookFileName, chapterNumber, fileName, timingFileName, projectName, directory, xmlDoc) {
//TODO hard coding these two values here, need to change
  const dest = '/Users/ray/Downloads';

  //TODO this line below is not working, not sure why, works in an online lodash tester, here it returns undefined, spent a lot of time on this,
  //hardcoding in the call for now, need to revisit if input is the abbreviation instead of full book name
  // const SABBookName = _.find(bibleNames, ['SAB', ]); //this converts the passed SAB abbreviation into full book names

  // console.log(bookFileName);
  // const filename = xmlDoc.querySelector('book[id="' + bookName + '"] > filename').textContent;
  // console.log('SFM filename:', filename);
  const sfmFileName = path.join(directory, projectName, projectName + '_data', 'books', 'C01', bookFileName);
  const timingFileFullName = path.join(directory, projectName, projectName + '_data', 'timings', timingFileName);
  // console.log(sfmFileName);
  var jsonString = '';

  fs.readFile(sfmFileName, 'utf8', function (_err, fileContents) {
    fileContents = fileContents.concat('\\EOF'); //end of file does not have chapter tag, add this tag manually so can match in one regex

    const timingFileContent = fs.readFileSync(timingFileFullName, 'utf8');
    const timingPattern = /([0-9]+.[0-9]+)\t([0-9]+.[0-9]+)\t([0-9]+)/gs;

    const firstLinePattern = /\\id (.*?)\n/gs;
    const firstLine = fileContents.match(firstLinePattern);

    const regexpChapter = /\\c ([0-9]+)(.*?)(?=(\\c|\\EOF))/gs;
    const chapterArray = fileContents.match(regexpChapter);

    const chapterText = firstLine + chapterArray[chapterNumber - 1];
    const jsonCleanOutput = new grammar.USFMParser(chapterText, grammar.SCRIPTURE);
    console.log(JSON.stringify(jsonCleanOutput));
    const regexpVerse = /"verseNumber":"([0-9]+)","verseText":"(.*?)"/gs;

    var timingMatches, timingOutput=[];
    // eslint-disable-next-line no-cond-assign
    while (timingMatches = timingPattern.exec(timingFileContent)){
      // console.log(timingMatches[1] + '..' + timingMatches[2] + '...' + timingMatches[3]);
      //this is where get the start time, duration, and verse number from the timing file
      timingOutput.push(parseFloat(timingMatches[1])*1000, parseFloat(timingMatches[2])*1000 - parseFloat(timingMatches[1])*1000, timingMatches[3]);
    }
    console.log(timingOutput.toString());
    var matches, output=[];
    // eslint-disable-next-line no-cond-assign
    while (matches = regexpVerse.exec(JSON.stringify(jsonCleanOutput))){
      console.log(matches[1] + '..' + matches[2]);
      // output.push(matches[1], matches[2])
    }

    // const regReplace = /<|<<|>|>>/gi;
    // if (matches){
    //   for (let i = 0; i < matches.length; i++) {
    //     // jsonString += '<ScriptLine><LineNumber>' + (i + 1) + '</LineNumber><Text>';
    //     jsonString = matches[i].replace(regReplace, '');
    //     // // console.log(xmlString);
    //     // jsonString += '</Text><RecordingTime>2020-02-27T03:41:28.3487045Z</RecordingTime><Verse>' + (i + 1);
    //     // jsonString += '</Verse><Heading>false</Heading></ScriptLine>';
    //     console.log(jsonString);
    //     // console.log('verse ' + i+1 + xmlString);
    //   }
    //   // console.log(xmlString);
    //   fs.appendFileSync(dest + '/' + bookName + '-' + chapterNumber + '.json', jsonString);
    // }
  });
}

// test case 1, just to output result of the function, need to look out for projects with on audio files, they will be returned but the project.books array will be empty by design
// console.log(JSON.stringify(getProjectStructure(['C:/Users/Ira/Documents/App Builder/Scripture Apps/App Projects/']), null, 2));
console.log(JSON.stringify(getProjectStructure(['/Users/ray/Documents/AppBuilder/Scripture Apps/App Projects/']), null, 2));

// test case 2: make xml file by passing (project, book, chapter, destination, directory)
// makeTextXMLFile('BK Test', 'MAT', '2', '/Users/ray/Downloads', '/Users/ray/Documents/AppBuilder/Scripture Apps/App Projects/');

module.exports = {
  PROJECT_TYPE,
  getProjectStructure,
};
