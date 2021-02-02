import path from 'path';

const sourceRoot: string = path.join(__dirname, '..', 'fixtures', 'ExampleHearThisProject');

export const scenario1 = {
  input: {
    project: {
      name: 'ExampleHearThisProject',
      fullPath: sourceRoot,
      books: [
        {
          name: 'Book1',
          chapters: [
            {
              name: '0',
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
            chapter: '0',
            audio: {
              filenames: [
                path.join(sourceRoot, 'Book1', '0', '0.wav'),
                path.join(sourceRoot, 'Book1', '0', '1.wav'),
                path.join(sourceRoot, 'Book1', '0', '2.wav'),
              ],
              length: 17300,
            },
            segments: [
              {
                segmentId: 1,
                text: 'Li Kalòcè̌ tatai theingǎ',
                verse: '0',
                startTime: 0,
                length: 2300,
              },
              {
                segmentId: 2,
                text: 'Li Kalòcè̌ mè mwaǐ Pò̌lu tyanba Wein Kalòcè̌ ta-aòblonphao.',
                verse: '1',
                startTime: 2300,
                length: 5500,
              },
              {
                segmentId: 3,
                text: 'Wein Kalòcè̌ ǔ mè aò bǎ Kǎn Asǐyǎ, Wein Ěphěsu amô̌nhtan dò aò dô̌ Rǒme tapain kalǎ.',
                verse: '2',
                startTime: 7800,
                length: 9500,
              },
            ],
          },
        ],
      },
    ],
  },
};
