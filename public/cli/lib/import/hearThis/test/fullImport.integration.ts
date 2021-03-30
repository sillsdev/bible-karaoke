import test from 'ava';
import { getProjectStructure } from '../readStructure';
import { bkImport } from '../hearThisImport';
import { testPaths } from '../../../test/test-path-constants';
import { paths } from '../../../path-constants';
import { expected } from './expectedBKFormat';

test('read-and-import-ht-project', async (t) => {
  const structure = getProjectStructure([testPaths.fixtures]);
  const actual = await bkImport(structure[0], paths.ffprobe);
  t.deepEqual(actual, expected);
});
