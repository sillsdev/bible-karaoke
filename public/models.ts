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

export interface Timings {}
