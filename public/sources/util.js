const fs = require('fs');
const path = require('path');
const xml2json = require('xml-js');

const isDirectory = source => fs.lstatSync(source).isDirectory();

const getDirectories = source =>
  fs.readdirSync(source).filter(name => isDirectory(path.join(source, name)));

class Project {
  constructor(projectType) {
    this.projectType = projectType
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

module.exports = {
  getSampleVerses,
  getDirectories,
  Project,
  Book,
  Chapter
};
