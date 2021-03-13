import path from 'path';

export const paths = {
  ffprobe: path.resolve(process.cwd(), 'binaries', 'ffprobe.exe'),
  ffmpeg: path.resolve(process.cwd(), 'binaries', 'ffmpeg.exe'),
};
