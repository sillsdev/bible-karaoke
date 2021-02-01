import test from 'ava';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const map = require('lodash/map');
import fs from 'fs';
import { scenarios } from './scenarios';
import { convert } from '../hearThisConvert';
import { BKProject } from '../../../../../models';
const ffprobePath = '';

interface Scenario {
  input: any;
  output: BKProject;
}

const testScenario = async (scenario: Scenario, t) => {
  const { input, output } = scenario;
  const projectDir = await convert(input.project, ffprobePath);
  output.books.forEach((book) => {
    book.chapters.forEach((chapter) => {
      const outputJsonContents = fs.readFileSync(path.join(projectDir, book.name, chapter.chapter, 'chapter.json'));
      const outputJson = JSON.parse(outputJsonContents);
      console.log(outputJson);
      t.deepEqual(outputJson, chapter);
    });
  });
};

test('hearThisImport converts test folders as expected', async (t) => {
  t.plan(scenarios.length);
  await Promise.all(map(scenarios, (scenario: Scenario) => testScenario(scenario, t)));
});
