const allFiles = {
  name: 'All files',
  extensions: ['*']
};

export const fileFilters = {
  text: [
    {
      name: "Text files",
      extensions: ['txt'],
    },
    allFiles
  ],
  audio: [
    {
      name: "Audio files",
      extensions: ['mp3', 'wav'],
    },
    allFiles
  ],
  timing: [
    {
      name: "Timing files",
      extensions: ['txt'],
    },
    allFiles
  ],
  background: [
    {
      name: "Image files",
      extensions: ['jpg', 'png'],
    },
    {
      name: "Video files",
      extensions: ['mpeg4', 'webm'],
    },
    allFiles
  ],
  output: [
    {
      name: "Video files",
      extensions: ['mp4'],
    }
  ],
};