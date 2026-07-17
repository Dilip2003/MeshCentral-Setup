#!/usr/bin/env node
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const batchPath = path.resolve(__dirname, 'adp_bypass.bat');

console.log(`ADPByPass invoked on ${process.platform}`);

if (process.platform === 'win32' && fs.existsSync(batchPath)) {
    try {
        execFileSync('cmd.exe', ['/c', batchPath], { stdio: 'inherit' });
        console.log('ADPByPass batch file completed.');
    } catch (err) {
        console.log(`ADPByPass batch file failed: ${err.message}`);
    }
} else {
    console.log('No Windows shell available or batch file missing; skipping Windows-only execution.');
}

console.log('ADPByPass completed successfully.');
