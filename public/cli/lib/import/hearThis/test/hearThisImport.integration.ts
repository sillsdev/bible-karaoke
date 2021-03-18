import test, { ExecutionContext } from 'ava';
import fs from 'fs';
import { map } from 'lodash';
import path from 'path';
import { scenarios } from './scenarios';
import { convert } from '../hearThisConvert';
import { BKProject } from '../../../../../models/projectFormat.model';
import { ConvertProject } from '../../../../../models/convertFormat.model';
import { paths } from '../../../path-constants';

interface Scenario {
  input: { project: ConvertProject };
  output: BKProject;
}

const testScenario = async (scenario: Scenario, t: ExecutionContext<unknown>): Promise<void> => {
  const { input, output } = scenario;
  const projectDir = await convert(input.project, paths.ffprobe);
  if (typeof projectDir == 'string') {
    output.books.forEach((book) => {
      book.chapters.forEach((chapter) => {
        const outputJsonContents = fs.readFileSync(path.join(projectDir, book.name, chapter.chapter, 'chapter.json'), {
          encoding: 'utf-8',
        });
        const outputJson = JSON.parse(outputJsonContents);
        t.deepEqual(outputJson, chapter);
      });
    });
  }
};

test('hearThisImport converts test folders as expected', async (t) => {
  t.plan(scenarios.length);
  await Promise.all(map(scenarios, (scenario: Scenario) => testScenario(scenario, t)));
});
