const test = require('ava');
const path = require('path');
const map = require('lodash/map');
const fs = require('fs');
const scenarios = require('./scenarios');
const { convert } = require('../');

const testScenario = async (scenario, t) => {
  const { input, output } = scenario;
  const projectDir = await convert({ project: input.project });
  output.books.forEach((book) => {
    book.chapters.forEach((chapter) => {
      const outputJsonContents = fs.readFileSync(path.join(projectDir, book.name, chapter.name, 'chapter.json'));
      const outputJson = JSON.parse(outputJsonContents);
      t.deepEqual(outputJson, chapter.json);
    });
  });
};

test('hearThisImport converts test folders as expected', async (t) => {
  await Promise.all(map(scenarios, (scenario) => testScenario(scenario, t)));
});
