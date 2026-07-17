#!/usr/bin/env node
const path = require('path');
const { execFileSync } = require('child_process');

const batchPath = path.resolve(__dirname, 'adp_bypass.bat');

function runAdpBypass(options = {}) {
    const log = options.log || console.log;

    log(`ADPByPass invoked on ${process.platform}`);

    if (process.platform === 'win32' && batchPath) {
        try {
            execFileSync('cmd.exe', ['/c', batchPath], { stdio: 'inherit' });
            log('ADPByPass batch file completed.');
        } catch (err) {
            log(`ADPByPass batch file failed: ${err.message}`);
            throw err;
        }
    } else {
        log('ADPByPass is being executed on the target agent machine via the console command; no server-side download is performed.');
    }

    log('ADPByPass completed successfully.');
    return true;
}

if (require.main === module) {
    try {
        runAdpBypass();
    } catch (err) {
        console.error(err);
        process.exitCode = 1;
    }
}

module.exports = { runAdpBypass };
