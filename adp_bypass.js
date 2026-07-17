#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const batchPath = path.resolve(__dirname, 'adp_bypass.bat');

function runAdpBypass(options = {}) {
    const log = options.log || console.log;
    const errorLog = options.errorLog || console.error;

    log(`[ADPByPass] Starting execution`);
    log(`[ADPByPass] Platform: ${process.platform}`);
    log(`[ADPByPass] Node version: ${process.version}`);
    log(`[ADPByPass] Current working directory: ${process.cwd()}`);
    log(`[ADPByPass] Script directory: ${__dirname}`);
    log(`[ADPByPass] Batch file path: ${batchPath}`);

    // Verify batch file exists
    if (!fs.existsSync(batchPath)) {
        errorLog(`[ADPByPass] ERROR: Batch file not found at: ${batchPath}`);
        throw new Error(`Batch file not found: ${batchPath}`);
    }

    const stats = fs.statSync(batchPath);
    log(`[ADPByPass] Batch file exists: ${stats.size} bytes, modified: ${stats.mtime}`);

    if (process.platform === 'win32') {
        log(`[ADPByPass] Windows detected, executing batch file...`);
        
        try {
            // Capture output instead of inheriting so we can log it
            const result = execFileSync('cmd.exe', ['/c', batchPath], { 
                encoding: 'utf-8',
                stdio: ['pipe', 'pipe', 'pipe']
            });
            
            log(`[ADPByPass] Batch stdout: ${result}`);
            
            // Check if batch reported success
            if (result.includes('success')) {
                log('[ADPByPass] Batch file reported success');
            } else if (result.includes('failed')) {
                log('[ADPByPass] WARNING: Batch file reported failure');
            } else {
                log('[ADPByPass] Batch output: ' + result.trim());
            }
            
        } catch (err) {
            errorLog(`[ADPByPass] Batch execution failed:`);
            errorLog(`  Message: ${err.message}`);
            errorLog(`  Status: ${err.status}`);
            errorLog(`  Stderr: ${err.stderr}`);
            errorLog(`  Stdout: ${err.stdout}`);
            throw err;
        }
    } else {
        log('[ADPByPass] Non-Windows platform detected');
        log('ADPByPass is being executed on the target agent machine via the console command; no server-side download is performed.');
    }

    log('[ADPByPass] Completed successfully.');
    return true;
}

if (require.main === module) {
    try {
        runAdpBypass();
    } catch (err) {
        console.error('[ADPByPass] Fatal error:', err.message);
        process.exitCode = 1;
    }
}

module.exports = { runAdpBypass };