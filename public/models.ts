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

export interface Timings extends Array<LineTiming> {}

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

interface WordTimings extends Array<WordTiming> {}

interface WordTiming {
  readonly word: string;
  readonly start: number;
  readonly end: number;
}
