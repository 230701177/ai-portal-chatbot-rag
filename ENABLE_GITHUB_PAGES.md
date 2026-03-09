# Enable GitHub Pages - Quick Guide

## Step-by-Step Instructions

### 1. Go to Repository Settings

1. Open your repository: https://github.com/230701177/ai-portal-chatbot-rag
2. Click the **Settings** tab (top right)

### 2. Navigate to Pages Settings

1. In the left sidebar, scroll down to **Pages**
2. Click on **Pages**

### 3. Configure Source

1. Under **Build and deployment**
2. Under **Source**, select **GitHub Actions** from the dropdown
3. The page will auto-save

### 4. Wait for Deployment

1. Go to the **Actions** tab in your repository
2. You should see a workflow running: "Deploy to GitHub Pages"
3. Wait for it to complete (~2-5 minutes)
4. Green checkmark = successful deployment

### 5. Access Your Site

Once deployed, your site will be available at:

**https://230701177.github.io/ai-portal-chatbot-rag/**

## Verification Steps

### Check Deployment Status

1. Go to **Settings** → **Pages**
2. You should see: "Your site is live at https://230701177.github.io/ai-portal-chatbot-rag/"

### Check Actions

1. Go to **Actions** tab
2. Latest workflow should show green checkmark
3. Click on it to see deployment details

### Test the Site

1. Open: https://230701177.github.io/ai-portal-chatbot-rag/
2. You should see the landing page
3. Click "Get Started" or "View Admin Dashboard"
4. Test the chat: Ask "What are the admission requirements?"

## Troubleshooting

### "Deploy to GitHub Pages" workflow not running

**Solution:**
1. Make sure you pushed the latest changes
2. Check if GitHub Actions is enabled in Settings → Actions
3. Manually trigger: Go to Actions → Deploy to GitHub Pages → Run workflow

### 404 Error on site

**Solution:**
1. Wait 5 minutes after first deployment
2. Clear browser cache (Ctrl+Shift+R)
3. Check that Source is set to "GitHub Actions"

### Build fails in Actions

**Solution:**
1. Click on the failed workflow
2. Check the error logs
3. Most common issue: Missing dependencies
4. Fix locally, commit, and push again

## Manual Trigger

If you want to manually trigger deployment:

1. Go to **Actions** tab
2. Click **Deploy to GitHub Pages** workflow
3. Click **Run workflow** button
4. Select branch: `main`
5. Click **Run workflow**

## What Happens During Deployment

1. **Checkout**: Gets latest code from main branch
2. **Setup Node.js**: Installs Node.js 18
3. **Install dependencies**: Runs `npm ci` in frontend folder
4. **Build**: Runs `npm run build` (creates static export)
5. **Upload**: Uploads the `out` folder as artifact
6. **Deploy**: Deploys to GitHub Pages

## Expected Output

After successful deployment:

- ✅ Site accessible at GitHub Pages URL
- ✅ All pages load correctly
- ✅ Mock backend works in browser
- ✅ Chat interface functional
- ✅ Admin dashboard accessible
- ✅ Document viewer works
- ✅ Download functionality works

## Configuration Files

The following files enable GitHub Pages:

1. `.github/workflows/deploy.yml` - GitHub Actions workflow
2. `frontend/next.config.js` - Next.js static export config
3. `frontend/.env.production` - Production environment variables
4. `frontend/public/.nojekyll` - Prevents Jekyll processing

## Updating the Site

Every time you push to `main` branch:

1. GitHub Actions automatically triggers
2. Builds the latest version
3. Deploys to GitHub Pages
4. Site updates in ~2-5 minutes

## Custom Domain (Optional)

To use a custom domain:

1. Add `CNAME` file in `frontend/public/`:
   ```
   yourdomain.com
   ```

2. In GitHub Settings → Pages:
   - Enter your custom domain
   - Enable "Enforce HTTPS"

3. Configure DNS at your domain provider:
   - Add CNAME record: `230701177.github.io`

## Support

If you encounter issues:

1. Check Actions tab for error logs
2. Review GITHUB_PAGES_SETUP.md for detailed guide
3. Open an issue on GitHub

---

**Your site will be live at**: https://230701177.github.io/ai-portal-chatbot-rag/

**Time to deploy**: ~2-5 minutes after enabling

**Status**: Check Actions tab for deployment progress
