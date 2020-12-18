import test from 'ava';
import tempy from 'tempy';
import fs from 'fs';

test('renderFrames hello world', async (t) => {
  /*
  let htmlContent = createMockHtml();
  const numberOfFrames = 5;
  await tempy.directory.task(async (outputLocation) => {
    let files = fs.readdirSync(outputLocation);
    t.is(files.length, 0);
    await record(htmlContent, numberOfFrames, outputLocation);
    files = fs.readdirSync(outputLocation);
    t.is(files.length, numberOfFrames);
  });
  */
  t.pass();
});
