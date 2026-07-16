# Deploy MeshCentral to Render

## Quick Setup (5 minutes)

### Step 1: Push to GitHub
```powershell
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize repository access

### Step 3: Deploy
1. Click **"New +"** → **"Web Service"**
2. Select your **MeshCentral-Setup** repository
3. Configure:
   - **Name**: `meshcentral-adp`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node node_modules/meshcentral/meshcentral.js`
   - **Plan**: Free (or paid for better uptime)

### Step 4: Set Environment Variables
In Render dashboard → **Environment**:

```
MESHCENTRAL_DOMAIN=meshcentral-adp.onrender.com
MESHCENTRAL_EMAIL=ajayajay142018@gmail.com
```

(Replace with your actual Render domain once deployed)

### Step 5: Add Persistent Disk
1. **Environment** tab → **Disk**
2. Create disk:
   - **Name**: `meshcentral-data`
   - **Mount Path**: `/var/data/meshcentral`
   - **Size**: 10 GB
3. This persists certificates, database, backups

### Step 6: Deploy
Click **"Deploy"** and wait 2-3 minutes

---

## After Deployment

### Access Your Server
- **URL**: `https://meshcentral-adp.onrender.com`
- First account created = site admin

### Use Your Own Domain
1. Update DuckDNS to point to Render:
   - Go to https://www.duckdns.org
   - Set IP to: `35.208.119.234` (Render's load balancer - check actual IP in Render dashboard)
   - Or use CNAME: `meshcentral-adp.onrender.com`

2. Update Render environment:
   ```
   MESHCENTRAL_DOMAIN=testadpagent.duckdns.org
   ```

3. Restart service (Render will auto-restart)

### Update Config
The deployment uses `meshcentral-render-config.json` which is similar to your local config but:
- ✅ No Windows-specific commands
- ✅ Data persists in `/var/data/meshcentral`
- ✅ Let's Encrypt works automatically
- ✅ All patches applied via `patch_mesh.js`

---

## File Changes Made for Deployment

| File | Purpose |
|------|---------|
| `render.yaml` | Render deployment specification |
| `Dockerfile` | Container build configuration |
| `meshcentral-render-config.json` | Cloud-friendly config (use instead of local config.json) |
| `package.json` | Postinstall patches still work |
| `patch_mesh.js` | Custom patches still applied |

---

## Zero Downtime Updates

To update your deployment:
```powershell
# Make changes locally
git add .
git commit -m "Update MeshCentral"
git push origin main
```

Render auto-deploys and restarts the service while preserving data on persistent disk.

---

## Troubleshooting

### Check Logs
```
Render Dashboard → meshcentral-adp → Logs
```

### Verify Data Persistence
- Check `/var/data/meshcentral` in Render shell
- Should contain: `NeDB.db`, `letsencrypt-certs/`, etc.

### Let's Encrypt Issues
If certificate doesn't generate:
1. Verify domain is accessible from internet
2. Check Render logs for Let's Encrypt errors
3. Use staging cert first: `"production": false` in config

---

## Cost

- **Free Plan**: 750 hrs/month (covers ~1 service continuously)
- **Pro Plan**: $7/month for always-on + better performance
- **Disk**: $0.25/GB-month (10GB = $2.50/month)

**Total**: ~$10/month for always-on with 10GB storage

---

## Rollback

If something breaks:
1. Render Dashboard → **Deploys**
2. Click previous deployment → **Rollback**
3. Service restarts with previous version
4. Data is always preserved

---

## Advanced: Use Custom Domain

1. Buy domain (e.g., from Namecheap, Route 53, etc.)
2. Point DNS to Render (CNAME or A record)
3. Update `MESHCENTRAL_DOMAIN` to your custom domain
4. Render auto-generates SSL cert for it

Example DNS record:
```
Type: CNAME
Name: meshcentral
Value: meshcentral-adp.onrender.com
```

Then access: `https://meshcentral.yourdomain.com`

---

## Next Steps

1. Commit and push to GitHub
2. Go to https://render.com and deploy
3. Set `MESHCENTRAL_DOMAIN` to your Render subdomain
4. Access https://meshcentral-adp.onrender.com

Your MeshCentral server will be live! 🚀
