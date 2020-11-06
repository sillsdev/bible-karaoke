const path = require('path');
const fs = require('fs');
const xml2json = require('xml-js');
const { getIntermediateRootDir, mkDir } = require('../import-util');

async function convertChapter({ chapter, book, project, projectDir }) {
  return new Promise((resolve, reject) => {
    const chapterDir = path.join(projectDir, book.name, chapter.name);
    mkDir(chapterDir);
    const chapterDetails = {
      book: book.name,
      chapter: chapter.name,
      audio: {
        filenames: [],
        length: null,
      },
      segments: [],
    };
    const sourceChapterDir = path.join(project.fullPath, book.name, chapter.name);
    const infoXmlPath = path.join(sourceChapterDir, 'info.xml');
    fs.readFile(infoXmlPath, (err, infoXmlFileContents) => {
      if (err) {
        reject(err);
        return;
      }
      const chapterInfo = JSON.parse(xml2json.xml2json(infoXmlFileContents, { compact: true }));
      chapterInfo.ChapterInfo.Recordings.ScriptLine.forEach((scriptLine) => {
        const verse = parseInt(scriptLine.LineNumber._text, 10) - 1;
        chapterDetails.audio.filenames.push(path.join(sourceChapterDir, `${verse}.wav`));
        chapterDetails.segments.push({
          segmentId: chapterDetails.segments.length + 1,
          text: scriptLine.Text._text,
          verse: verse.toString(),
          startTime: null,
          length: null,
        });
      });
      const jsonFilename = path.join(chapterDir, 'chapter.json');
      const jsonFileContents = JSON.stringify(chapterDetails, null, 2);
      fs.writeFile(jsonFilename, jsonFileContents, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(jsonFilename);
        }
      });
    });
  });
}

async function convert({ project }) {
  const projectDir = path.join(getIntermediateRootDir(), project.name);
  mkDir(projectDir);
  await Promise.all(
    project.books.map((book) => {
      const bookDir = path.join(projectDir, book.name);
      mkDir(bookDir);
      return Promise.all(book.chapters.map((chapter) => convertChapter({ chapter, book, project, projectDir })));
    })
  );
  return projectDir;
}

module.exports = {
  convert,
};
