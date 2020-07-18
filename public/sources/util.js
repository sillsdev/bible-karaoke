const fs = require('fs');
const path = require('path');
const xml2json = require('xml-js');
var bibleNames=[{BibleName:"Genesis",SAB:"GEN",FCBH:"Gen"},{BibleName:"Exodus",SAB:"EXO",FCBH:"Exod"},{BibleName:"Leviticus",SAB:"LEV",FCBH:"Lev"},{BibleName:"Numbers",SAB:"NUM",FCBH:"Num"},{BibleName:"Deuteronomy",SAB:"DEU",FCBH:"Deut"},{BibleName:"Joshua",SAB:"JOS",FCBH:"Josh"},{BibleName:"Judges",SAB:"JDG",FCBH:"Judg"},{BibleName:"Ruth",SAB:"RUT",FCBH:"Ruth"},{BibleName:"1 Samuel",SAB:"1SA",FCBH:"1Sam"},{BibleName:"2 Samuel",SAB:"2SA",FCBH:"2Sam"},{BibleName:"1 Kings",SAB:"1KI",FCBH:"1Kgs"},{BibleName:"2 Kings",SAB:"2KI",FCBH:"2Kgs"},{BibleName:"1 Chronicles",SAB:"1CH",FCBH:"1Chr"},{BibleName:"2 Chronicles",SAB:"2CH",FCBH:"2Chr"},{BibleName:"Ezra",SAB:"EZR",FCBH:"Ezra"},{BibleName:"Nehemiah",SAB:"NEH",FCBH:"Neh"},{BibleName:"Esther",SAB:"EST",FCBH:"Esth"},{BibleName:"Job",SAB:"JOB",FCBH:"Job"},{BibleName:"Psalms",SAB:"PSA",FCBH:"Ps"},{BibleName:"Proverbs",SAB:"PRO",FCBH:"Prov"},{BibleName:"Ecclesiastes",SAB:"ECC",FCBH:"Eccl"},{BibleName:"Song of Solomon",SAB:"SNG",FCBH:"Song"},{BibleName:"Isaiah",SAB:"ISA",FCBH:"Isa"},{BibleName:"Jeremiah",SAB:"JER",FCBH:"Jer"},{BibleName:"Lamentations",SAB:"LAM",FCBH:"Lam"},{BibleName:"Ezekiel",SAB:"EZK",FCBH:"Ezek"},{BibleName:"Daniel",SAB:"DAN",FCBH:"Dan"},{BibleName:"Hosea",SAB:"HOS",FCBH:"Hos"},{BibleName:"Joel",SAB:"JOL",FCBH:"Joel"},{BibleName:"Amos",SAB:"AMO",FCBH:"Amos"},{BibleName:"Obadiah",SAB:"OBA",FCBH:"Obad"},{BibleName:"Jonah",SAB:"JON",FCBH:"Jonah"},{BibleName:"Micah",SAB:"MIC",FCBH:"Mic"},{BibleName:"Nahum",SAB:"NAM",FCBH:"Nah"},{BibleName:"Habakkuk",SAB:"HAB",FCBH:"Hab"},{BibleName:"Zephaniah",SAB:"ZEP",FCBH:"Zeph"},{BibleName:"Haggai",SAB:"HAG",FCBH:"Hag"},{BibleName:"Zechariah",SAB:"ZEC",FCBH:"Zech"},{BibleName:"Malachi",SAB:"MAL",FCBH:"Mal"},{BibleName:"Matthew",SAB:"MAT",FCBH:"Matt"},{BibleName:"Mark",SAB:"MRK",FCBH:"Mark"},{BibleName:"Luke",SAB:"LUK",FCBH:"Luke"},{BibleName:"John",SAB:"JHN",FCBH:"John"},{BibleName:"Acts",SAB:"ACT",FCBH:"Acts"},{BibleName:"Romams",SAB:"ROM",FCBH:"Rom"},{BibleName:"1 Corinthians",SAB:"1CO",FCBH:"1Cor"},{BibleName:"2 Corinthians",SAB:"2CO",FCBH:"2Cor"},{BibleName:"Galatians",SAB:"GAL",FCBH:"Gal"},{BibleName:"Ephesians",SAB:"EPH",FCBH:"Eph"},{BibleName:"Philippians",SAB:"PHP",FCBH:"Phil"},{BibleName:"Colossians",SAB:"COL",FCBH:"Col"},{BibleName:"1 Thessalonians",SAB:"1TH",FCBH:"1Thess"},{BibleName:"2 Thessalonians",SAB:"2TH",FCBH:"2Thess"},{BibleName:"1 Timoth",SAB:"1TI",FCBH:"1Tim"},{BibleName:"2 Timothy",SAB:"2TI",FCBH:"2Tim"},{BibleName:"Titus",SAB:"TIT",FCBH:"Titus"},{BibleName:"Philemon",SAB:"PHM",FCBH:"Phlm"},{BibleName:"Hebrews",SAB:"HEB",FCBH:"Heb"},{BibleName:"James",SAB:"JAS",FCBH:"Jas"},{BibleName:"1 Peter",SAB:"1PE",FCBH:"1Pet"},{BibleName:"2 Peter",SAB:"2PE",FCBH:"2Pet"},{BibleName:"1 John",SAB:"1JN",FCBH:"1John"},{BibleName:"2 John",SAB:"2JN",FCBH:"2John"},{BibleName:"3 John",SAB:"3JN",FCBH:"3John"},{BibleName:"Jude",SAB:"JUD",FCBH:"Jude"},{BibleName:"Revelation",SAB:"REV",FCBH:"Rev"}];

const isDirectory = (source) => fs.lstatSync(source).isDirectory();

const getDirectories = (source) => fs.readdirSync(source).filter((name) => isDirectory(path.join(source, name)));

class Project {
  constructor(projectType) {
    this.projectType = projectType;
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
    var verses = jsonInfo.ChapterInfo.Recordings.ScriptLine.slice(0, 4).map((line) => {
      // Fix #20 : ignore Chapter Headings
      if (line.HeadingType && line.HeadingType._text == 'c') {
        return;
      }
      let text = line.Text._text;
      if (line.Heading._text === 'true') {
        text = '<strong>' + text + '</strong>';
      }
      return text;
    });
    // use .filter() to remove any undefined elements
    verses = verses.filter((v) => {
      return v;
    });
    // only return 3
    if (verses.length > 3) verses.pop();
    return verses;
  } catch (err) {
    console.error('Failed to get sample verses', err);
    return 'Failed to get sample verses';
  }
}

function findObjectByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return array[i];
        }
    }
    return null;
}

function getMatches(string, regex, index) {
  index || (index = 1); // default to the first capturing group
  var matches = [];
  var match;
  while (match = regex.exec(string)) {
    matches.push(match[index]);
  }
  return matches;
}

module.exports = {
  getSampleVerses,
  getDirectories,
  Project,
  Book,
  Chapter,
  bibleNames,
  findObjectByKey,
  getMatches
};
