import React from 'react';

import TextAndAudioCard from './TextAndAudioCard';
// import TimingCard from './TimingCard';
import DisplayCard from './DisplayCard';
import OutputCard from './OutputCard';

export {
  TextAndAudioCard,
  // TimingCard,
  DisplayCard,
  OutputCard,
};

export const cards = [
  {
    title: 'Input',
    description:
      'This first step is where you select the HearThis or Scripture App Builder project, book and chapter.' +
      ' This folder should contain the text and audio files that will be used in the video.',
    content: <TextAndAudioCard />,
  },
  // {
  //   title: 'Timing',
  //   description:
  //     'Now select the VTT file that will be used to display the text on the screen.',
  //   content: <TimingCard />,
  // },
  {
    title: 'Display',
    description:
      'Now configure what the video will look like.',
    content: <DisplayCard />,
  },
  {
    title: 'Output',
    description: "Finally, select where you'll save the generated video.",
    content: <OutputCard />,
  },
];
