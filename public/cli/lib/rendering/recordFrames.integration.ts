import test from 'ava';
import tempy from 'tempy';
import fs from 'fs';
import { record } from './recordFrames';

test('recordFrames: render 5 mock frames', async (t) => {
  const htmlContent = createMockHtml();
  const numberOfFrames = 5;
  await tempy.directory.task(async (outputLocation) => {
    const emptyDirectory = fs.readdirSync(outputLocation);
    t.is(emptyDirectory.length, 0);
    await record(htmlContent, numberOfFrames, outputLocation);
    const directoryOfFrameFiles = fs.readdirSync(outputLocation);
    t.is(directoryOfFrameFiles.length, numberOfFrames);
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
