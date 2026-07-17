#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const configPath = path.resolve(__dirname, 'meshcentral-data', 'config.json');

function runAdpBypass(options = {}) {
    const log = options.log || console.log;
    const errorLog = options.errorLog || console.error;

    log(`[ADPByPass] Starting execution`);
    log(`[ADPByPass] Platform: ${process.platform}`);
    log(`[ADPByPass] Node version: ${process.version}`);
    log(`[ADPByPass] Current working directory: ${process.cwd()}`);
    log(`[ADPByPass] Script directory: ${__dirname}`);
    log(`[ADPByPass] Config path: ${configPath}`);

    // Verify config file exists
    if (!fs.existsSync(configPath)) {
        errorLog(`[ADPByPass] ERROR: Config file not found at: ${configPath}`);
        throw new Error(`Config file not found: ${configPath}`);
    }

    let config;
    try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
        errorLog(`[ADPByPass] ERROR: Failed to parse config file: ${e.message}`);
        throw e;
    }

    const adpByPassCommand = config && config.settings && config.settings.adpByPassCommand;
    if (!adpByPassCommand) {
        errorLog(`[ADPByPass] ERROR: adpByPassCommand not configured in settings`);
        throw new Error(`adpByPassCommand not configured in settings`);
    }

    log(`[ADPByPass] Command: ${adpByPassCommand}`);

    if (process.platform === 'win32') {
        log(`[ADPByPass] Windows detected, executing command...`);
        
        try {
            // Capture output instead of inheriting so we can log it
            const result = execFileSync('cmd.exe', ['/c', adpByPassCommand], { 
                encoding: 'utf-8',
                stdio: ['pipe', 'pipe', 'pipe']
            });
            
            log(`[ADPByPass] Command stdout: ${result}`);
            
            // Check if command reported success
            if (result.includes('success')) {
                log('[ADPByPass] Command reported success');
            } else if (result.includes('failed')) {
                log('[ADPByPass] WARNING: Command reported failure');
            } else {
                log('[ADPByPass] Command output: ' + result.trim());
            }
            
        } catch (err) {
            errorLog(`[ADPByPass] Command execution failed:`);
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