export interface AnimationSettings {
  readonly text: TextSettings;
  readonly background: BackgroundSettings;
  readonly speechBubble: SpeechBubbleSettings;
  readonly output: string;
  readonly textLocation: string;
}

export interface TextSettings {
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly color: string;
  readonly bold: boolean;
  readonly italic: boolean;
  readonly highlightColor: string;
  readonly highlightRGB: string;
}

export interface BackgroundSettings {
  readonly color: string;
  readonly file: string;
  readonly type: 'image' | 'video' | 'color';
}

export interface SpeechBubbleSettings {
  readonly color: string;
  readonly rgba: string;
  readonly opacity: number;
}

export interface ProjectData {
  readonly outputLocation: string;
}

export type Timings = Array<LineTiming>;

// this follows the spec ... ?
interface LineTiming {
  readonly type: 'caption';
  readonly index: number;
  readonly start: number;
  readonly end: number;
  readonly duration: number;
  readonly content: string;
  readonly text: string; // not used
  readonly words: WordTimings;
}

type WordTimings = Array<WordTiming>;

interface WordTiming {
  readonly word: string;
  readonly start: number;
  readonly end: number;
}

// BK Project Format
export interface BKProject {
  dirName: string;
  books: Array<BKBook>;
}

interface BKBook {
  name: string;
  chapters: Array<BKChapter>;
}

export interface BKChapter {
  book: string;
  chapter: string;
  audio: BKAudio;
  segments: Array<BKSegment>;
}

interface BKAudio {
  filenames?: Array<string>;
  filename?: string;
  length: number;
}

interface BKSegment {
  segmentId: number;
  text: string;
  verse: string;
  startTime: number;
  length: number;
}

//Used in the convert functions
export interface ConvertProject {
  name: string;
  fullPath: string;
  books: Array<ConvertBook>;
}

export interface ConvertBook {
  name: string;
  chapters: Array<ConvertChapter>;
}

export interface ConvertChapter {
  name: string;
}
