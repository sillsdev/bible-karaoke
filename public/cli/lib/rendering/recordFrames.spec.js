const test = require('ava');
const tempy = require('tempy');
const { promises: fs } = require('fs');
const { record } = require('./recordFrames');

test('recordFrames: render 5 mock frames', async (t) => {
  let htmlContent = createMockHtml();
  const numberOfFrames = 5;
  await tempy.directory.task(async (outputLocation) => {
    let files = await fs.readdir(outputLocation);
    t.is(files.length, 0);
    await record(htmlContent, numberOfFrames, outputLocation);
    files = await fs.readdir(outputLocation);
    t.is(files.length, numberOfFrames);
  });
});

/**
 * @returns {string}
 */
function createMockHtml() {
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
