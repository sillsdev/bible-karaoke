import fs from 'fs';
import path from 'path';
import { xml2json } from 'xml-js';
import { getIntermediateRootDir, mkDir } from '../import-util';
import shell from 'shelljs';
import { BKChapter } from '../../../../models/projectFormat.model';
import { ConvertProject, ConvertBook, ConvertChapter } from '../../../../models/convertFormat.model';

//Defines a ScriptLine as expected after parsing the hearthis xml
interface ScriptLine {
  LineNumber: { _text: string };
  Text: { _text: string };
  RecordingTime: { _text: string };
  Verse: { _text: string };
  Heading: { _text: string };
  HeadingType?: { _text: string };
}

async function convertChapter(
  chapter: ConvertChapter,
  book: ConvertBook,
  project: ConvertProject,
  projectDir: string,
  ffprobePath: string
): Promise<string | Error> {
  const chapterDir = path.join(projectDir, book.name, chapter.name);
  mkDir(chapterDir);
  const chapterDetails: BKChapter = {
    book: book.name,
    chapter: chapter.name,
    audio: {
      files: [],
      length: 0,
    },
    segments: [],
  };
  const sourceChapterDir = path.join(project.fullPath, book.name, chapter.name);
  const infoXmlPath = path.join(sourceChapterDir, 'info.xml');
  try {
    const infoXmlFileContents = fs.readFileSync(infoXmlPath, { encoding: 'utf-8' });
    const chapterInfo = JSON.parse(xml2json(infoXmlFileContents, { compact: true }));
    // make sure ScriptLine is an array
    if (!Array.isArray(chapterInfo.ChapterInfo.Recordings.ScriptLine)) {
      chapterInfo.ChapterInfo.Recordings.ScriptLine = [chapterInfo.ChapterInfo.Recordings.ScriptLine];
    }

    let chapterAudioLength = 0;
    for await (const scriptLine of chapterInfo.ChapterInfo.Recordings.ScriptLine as ScriptLine[]) {
      // Fix #20 : ignore Chapter Headings
      if (scriptLine.HeadingType != null && scriptLine.HeadingType._text == 'c') {
        continue;
      }

      const segmentId = parseInt(scriptLine.LineNumber._text, 10);
      const audioPath: string = path.join(sourceChapterDir, `${segmentId - 1}.wav`);
      const duration = await getAudioDurationInMilliseconds(audioPath, ffprobePath);
      // if only one audio file then simplify audio property
      if (chapterInfo.ChapterInfo.Recordings.ScriptLine.length === 1) {
        chapterDetails.audio = { filename: audioPath, length: duration };
      } else if ('files' in chapterDetails.audio) {
        chapterDetails.audio.files.push({ filename: audioPath, length: duration });
      }
      chapterDetails.segments.push({
        segmentId,
        text: scriptLine.Text._text,
        verse: scriptLine.Verse._text,
        startTime: chapterAudioLength,
        length: duration,
        isHeading: scriptLine.Heading._text === 'true',
      });
      chapterAudioLength += duration;
      chapterDetails.audio.length = chapterAudioLength;
    }
    const jsonFilename = path.join(chapterDir, 'chapter.json');
    const jsonFileContents = JSON.stringify(chapterDetails, null, 2);
    try {
      fs.writeFileSync(jsonFilename, jsonFileContents);
    } catch (e) {
      return e;
    }
    return jsonFilename;
  } catch (e) {
    return e;
  }
}

export async function convert(project: ConvertProject, ffprobePath: string): Promise<string | Error> {
  const projectDir = path.join(getIntermediateRootDir(), project.name);
  mkDir(projectDir);
  for await (const book of project.books) {
    const bookDir = path.join(projectDir, book.name);
    mkDir(bookDir);
    for await (const chapter of book.chapters) {
      const result = await convertChapter(chapter, book, project, projectDir, ffprobePath);
      if (result instanceof Error) {
        throw result;
      }
    }
  }
  return projectDir;
}

// Adapted from https://github.com/caffco/get-audio-duration:
async function getAudioDurationInMilliseconds(filePath: string, ffprobePath: string): Promise<number> {
  const command = `${ffprobePath} -v error -select_streams a:0 -show_format -show_streams ${filePath}`;
  const { stdout } = shell.exec(command, { silent: true });
  const matched = stdout.match(/duration="?(\d*\.\d*)"?/);
  if (matched && matched[1]) {
    return parseFloat(matched[1]) * 1000;
  } else {
    throw new Error('No duration found!');
  }
}
