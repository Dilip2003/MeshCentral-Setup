# MeshCentral Setup

This repository contains a customized MeshCentral server setup.

## Current Configuration
- **Server**: MeshCentral v1.1.57
- **Mode**: LAN Mode
- **Ports**: 443 (HTTPS), 80 (HTTP Redirection)

## Running the Server
To start the server, navigate to the root directory and run:
```powershell
node node_modules/meshcentral/meshcentral.js
```

## Maintenance
- Sensitive data in `meshcentral-data/` is excluded by `.gitignore`.
- Temporary scratch files and logs are regularly cleaned up.
