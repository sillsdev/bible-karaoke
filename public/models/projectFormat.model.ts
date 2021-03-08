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
  readonly audio: BKAudio | BKAudioMultipleFiles;
  readonly segments: BKSegment[];
}

interface BKAudio {
  readonly filename: string;
  length: number;
}

interface BKAudioMultipleFiles {
  readonly files: BKAudio[];
  length?: number;
}

interface BKSegment {
  readonly segmentId: number;
  readonly text: string;
  readonly verse: string;
  readonly startTime: number;
  readonly length: number;
}
