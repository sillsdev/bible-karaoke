import path from 'path';
import { testPaths } from '../../../../test/test-path-constants';

// chapters in input but not output
export const scenario3 = {
  input: {
    project: {
      name: 'ExampleHearThisProject',
      fullPath: testPaths.exampleHearThisProject,
      books: [
        {
          name: 'Book1',
          chapters: [
            {
              name: '1',
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
            chapter: '1',
            audio: {
              files: [
                { filename: path.join(testPaths.exampleHearThisProject, 'Book1', '1', '1.wav'), length: 3200 },
                { filename: path.join(testPaths.exampleHearThisProject, 'Book1', '1', '2.wav'), length: 6500 },
              ],
              length: 9700,
            },
            segments: [
              {
                segmentId: 2,
                text: 'Tamangaò̌ raò̌rî rî̌kaò̌',
                verse: '0',
                startTime: 0,
                length: 3200,
                isHeading: true,
              },
              {
                segmentId: 3,
                text: 'Tô̌, pracǎnsû̌, prathácô̌n dò Khrī, thapǔwaǐ Wein Kalòcè̌phao aò.',
                verse: '1-2',
                startTime: 3200,
                length: 6500,
                isHeading: false,
              },
            ],
          },
        ],
      },
    ],
  },
};
