const path = require('path');

const sourceRoot = path.join(__dirname, '..', 'fixtures', 'ExampleHearThisProject');

module.exports = {
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
            name: '0',
            json: {
              book: 'Book1',
              chapter: '0',
              audio: {
                filenames: [
                  path.join(sourceRoot, 'Book1', '0', '0.wav'),
                  path.join(sourceRoot, 'Book1', '0', '1.wav'),
                  path.join(sourceRoot, 'Book1', '0', '2.wav'),
                ],
                length: null,
              },
              segments: [
                {
                  segmentId: 1,
                  text: 'Li Kalòcè̌ tatai theingǎ',
                  verse: '0',
                  startTime: null,
                  length: null,
                },
                {
                  segmentId: 2,
                  text: 'Li Kalòcè̌ mè mwaǐ Pò̌lu tyanba Wein Kalòcè̌ ta-aòblonphao.',
                  verse: '1',
                  startTime: null,
                  length: null,
                },
                {
                  segmentId: 3,
                  text: 'Wein Kalòcè̌ ǔ mè aò bǎ Kǎn Asǐyǎ, Wein Ěphěsu amô̌nhtan dò aò dô̌ Rǒme tapain kalǎ.',
                  verse: '2',
                  startTime: null,
                  length: null,
                },
              ],
            },
          },
        ],
      },
    ],
  },
};
