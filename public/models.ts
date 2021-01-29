export interface AnimationSettings {
  text: TextSettings;
  background: BackgroundSettings;
  speechBubble: SpeechBubbleSettings;
  output: string;
  textLocation: string;
}

export interface TextSettings {
  fontFamily: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  highlightColor: string;
  highlightRGB: string;
}

export interface BackgroundSettings {
  color: string;
  file: string;
  type: string; // returns 'image' | 'video' | 'color'
}

export interface SpeechBubbleSettings {
  color: string;
  rgba: string;
  opacity: number;
}

export interface ProjectData {}

export interface NotifyEvent {
  emit(state: string, options: object): void;
}

export interface Timings extends Array<LineTiming> {}

// this follows the spec ... ?
interface LineTiming {
  type: string; // not used
  index: number;
  start: number;
  end: number;
  duration: number;
  content: string;
  text: string; // not used
  words: WordTimings;
}

interface WordTimings extends Array<WordTiming> {}

interface WordTiming {
  word: string;
  start: number;
  end: number;
}
