export interface FfmpegSettings {
  ffmpegPath?: string;
  readonly audioFileOrFolderPath: string;
  readonly skipAudioFiles: string[];
  readonly imagesPath: string;
  readonly framerateIn: number;
  readonly framerateOut: number;
  readonly outputName: string;
}
