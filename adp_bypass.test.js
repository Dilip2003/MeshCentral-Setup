const test = require('node:test');
const assert = require('node:assert/strict');
const { runAdpBypass } = require('./adp_bypass');

test('runAdpBypass reports success without doing any server-side download', () => {
  const result = runAdpBypass({ log: () => {} });
  assert.equal(result, true);
});
