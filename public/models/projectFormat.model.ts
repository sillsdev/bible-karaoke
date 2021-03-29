// BK Project Format
export interface BKProject {
  readonly dirName: string;
  readonly books: BKBook[];
}

interface BKBook {
  readonly name: string;
  readonly chapters: BKChapter[];
}

export interface BKChapter {
  readonly book: string;
  readonly chapter: string;
  audio: BKAudio | BKAudioMultipleFiles;
  readonly segments: BKSegment[];
}

interface BKAudio {
  filename: string;
  length: number;
}

interface BKAudioMultipleFiles {
  files: BKAudio[];
  length?: number;
}

interface BKSegment {
  readonly segmentId: number;
  readonly text: string;
  readonly verse: string;
  readonly startTime: number;
  readonly length: number;
  readonly isHeading: boolean;
}
