import path from 'path';
import { testPaths } from '../../../../test/test-path-constants';

// only 1 ScriptLine element
export const scenario2 = {
  input: {
    project: {
      name: 'ExampleHearThisProject',
      fullPath: testPaths.exampleHearThisProject,
      books: [
        {
          name: 'Book1',
          chapters: [
            {
              name: '3',
            },
          ],
        },
      ],
    },
  },
  output: {
    dirName: 'ExampleHearThisProject',
    books: [
      {
        name: 'Book1',
        chapters: [
          {
            book: 'Book1',
            chapter: '3',
            audio: {
              filename: path.join(testPaths.exampleHearThisProject, 'Book1', '3', '0.wav'),
              length: 1400,
            },
            segments: [
              {
                segmentId: 1,
                text:
                  'Khǐ rwǎn ma cwaǐdò nathû̌ thá ka nî̌ba tamamo, ka aòbloncǔ dò tabathá, ka aòbábwaǐ dò tanāpau byan raò́ cwaǐdò ka theingǎ byan Bweca ta-aòhu aòbî mè mwaǐ Khrī.',
                verse: '2',
                startTime: 0,
                length: 1400,
                isHeading: false,
              },
            ],
          },
        ],
      },
    ],
  },
};
