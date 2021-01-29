import test from 'ava';
import tempy from 'tempy';
import fs from 'fs';
import { record } from './recordFrames';
// TODO: Add a pupteer mock model
test('recordFrames: render 5 mock frames', async (t) => {
  let htmlContent = createMockHtml();
  const numberOfFrames = 5;
  await tempy.directory.task(async (outputLocation) => {
    let files = fs.readdirSync(outputLocation);
    t.is(files.length, 0);
    await record(htmlContent, numberOfFrames, outputLocation);
    files = fs.readdirSync(outputLocation);
    t.is(files.length, numberOfFrames);
  });
});

function createMockHtml(): string {
  return `
  <html>
  <script>
  function renderNextFrame() {}
  </script>
  <body>
  </body>
  </html>
  `;
}
