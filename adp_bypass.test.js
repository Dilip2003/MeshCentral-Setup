const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { runAdpBypass } = require('./adp_bypass');

test('runAdpBypass downloads a file into the target OnVUE directory', async () => {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
    res.end(Buffer.from('test-payload'));
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'adp-bypass-test-'));

  try {
    const wrote = await runAdpBypass({
      downloadUrl: `http://127.0.0.1:${port}/blnative.dll`,
      baseDirectories: [tempRoot],
      log: () => {}
    });

    assert.equal(wrote, true);
    const targetPath = path.join(tempRoot, 'AppData', 'Roaming', 'OnVUE', 'BLNative.dll');
    assert.ok(fs.existsSync(targetPath));
    assert.equal(fs.readFileSync(targetPath, 'utf8'), 'test-payload');
  } finally {
    server.close();
  }
});
