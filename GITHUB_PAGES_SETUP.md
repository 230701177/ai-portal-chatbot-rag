# GitHub Pages Deployment Guide

## Automatic Deployment Setup

The project is configured for automatic deployment to GitHub Pages using GitHub Actions.

## Prerequisites

- GitHub repository: https://github.com/230701177/ai-portal-chatbot-rag
- GitHub Pages enabled in repository settings

## Setup Steps

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Save the settings

### 2. Push Changes

The deployment workflow is already configured. Just push your changes:

```bash
git add -A
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

### 3. Wait for Deployment

- GitHub Actions will automatically build and deploy
- Check the **Actions** tab to monitor progress
- Deployment takes ~2-5 minutes

### 4. Access Your Site

Once deployed, your site will be available at:

**https://230701177.github.io/ai-portal-chatbot-rag/**

## Configuration Details

### Next.js Configuration (`frontend/next.config.js`)

```javascript
{
  output: 'export',              // Static export
  images: { unoptimized: true }, // Disable image optimization
  basePath: '/ai-portal-chatbot-rag',
  assetPrefix: '/ai-portal-chatbot-rag/',
}
```

### GitHub Actions Workflow (`.github/workflows/deploy.yml`)

- Triggers on push to `main` branch
- Builds Next.js app with static export
- Deploys to GitHub Pages
- Uses mock backend (no AWS required)

### Environment Variables

Production environment (`.env.production`):
```env
NEXT_PUBLIC_USE_MOCK=true
```

This ensures the mock backend is used on GitHub Pages.

## Features on GitHub Pages

✅ **Working Features:**
- Complete UI functionality
- Mock backend (runs in browser)
- Chat interface with AI responses
- Document management
- Admin dashboard
- Analytics page
- Settings page
- View and download PDF content
- All interactions work offline

❌ **Not Available:**
- Real AWS backend
- Actual PDF processing
- Real AI inference
- Multi-user functionality

## Testing Locally

Before deploying, test the static export locally:

```bash
cd frontend

# Build static export
npm run build

# The output will be in frontend/out/
# You can serve it with any static server

# Using Python
cd out
python -m http.server 8000

# Or using npx
npx serve out
```

Open http://localhost:8000/ai-portal-chatbot-rag/

## Troubleshooting

### Build Fails

**Issue**: Build fails in GitHub Actions

**Solution**:
1. Check the Actions tab for error logs
2. Ensure all dependencies are in package.json
3. Test build locally: `cd frontend && npm run build`

### 404 Errors

**Issue**: Pages show 404 errors

**Solution**:
1. Ensure basePath is set correctly in next.config.js
2. Check that .nojekyll file exists in frontend/public/
3. Verify GitHub Pages source is set to "GitHub Actions"

### Assets Not Loading

**Issue**: CSS/JS files not loading

**Solution**:
1. Check assetPrefix in next.config.js
2. Ensure it matches your repository name
3. Clear browser cache and reload

### Mock Backend Not Working

**Issue**: Chat or admin features not working

**Solution**:
1. Check browser console for errors
2. Verify NEXT_PUBLIC_USE_MOCK=true in .env.production
3. Clear localStorage: `localStorage.clear()`
4. Refresh the page

## Manual Deployment

If you prefer manual deployment:

```bash
# Build the app
cd frontend
npm run build

# The static files are in frontend/out/
# Upload these to any static hosting service
```

## Updating the Site

To update the deployed site:

1. Make your changes locally
2. Test locally: `npm run dev`
3. Commit and push:
   ```bash
   git add -A
   git commit -m "Your update message"
   git push origin main
   ```
4. GitHub Actions will automatically rebuild and deploy

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file in `frontend/public/`:
   ```
   yourdomain.com
   ```

2. Configure DNS:
   - Add CNAME record pointing to: `230701177.github.io`

3. Update next.config.js:
   ```javascript
   {
     basePath: '',  // Remove basePath for custom domain
     assetPrefix: '',
   }
   ```

## Performance

- **Load Time**: ~1-2 seconds
- **Size**: ~500KB (gzipped)
- **Caching**: Enabled by GitHub Pages
- **CDN**: Served via GitHub's CDN

## Monitoring

- **Build Status**: Check Actions tab
- **Deployment Status**: Check Pages settings
- **Analytics**: Add Google Analytics if needed

## Security

- ✅ HTTPS enabled by default
- ✅ No server-side code (static site)
- ✅ No API keys exposed
- ✅ Mock backend runs client-side only

## Limitations

- Static site only (no server-side rendering)
- No real-time updates
- No server-side API calls
- Mock backend only (no real AWS)

## Support

For issues:
1. Check GitHub Actions logs
2. Review browser console
3. Open issue on GitHub repository

---

**Your site will be live at**: https://230701177.github.io/ai-portal-chatbot-rag/

Enjoy your deployed AI Portal Assistant! 🚀
