# GitHub Pages Setup Guide

## Overview

This guide explains how to deploy the LaserTrace Pro product recommendation website to GitHub Pages using the `gh-pages` branch.

## Prerequisites

- Repository: `Op-era/Laser-Pro-Engraver`
- GitHub account with push access to the repository
- Website files located in `/website` directory

## Setup Steps

### 1. Create and Configure gh-pages Branch

The `gh-pages` branch has been created with the website content. To deploy it:

```bash
# The branch is already created locally with commit: 087cde4
# To push it (requires repository permissions):
git push origin gh-pages
```

### 2. Configure GitHub Pages

1. Go to your GitHub repository: `https://github.com/Op-era/Laser-Pro-Engraver`
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source**: Deploy from a branch
   - **Branch**: Select `gh-pages` and `/root`
   - Click **Save**

### 3. Verify Deployment

After saving, GitHub will automatically deploy your site. You can check the deployment status:

1. Go to the **Actions** tab in your repository
2. Look for "pages build and deployment" workflow
3. Once completed, your site will be live at:
   ```
   https://op-era.github.io/Laser-Pro-Engraver/
   ```

### 4. Update Main Application

After the website is deployed, update the main application to point to the live URL:

1. Edit `gearAds.ts` in the main branch
2. Update the URL:
   ```typescript
   export const EXTERNAL_HUB_URL = "https://op-era.github.io/Laser-Pro-Engraver";
   ```
3. Commit and push the change

## Website Structure

The gh-pages branch contains:
- `index.html` - Main website file
- `README.md` - Website documentation

## Updating the Website

To update the website content:

```bash
# 1. Switch to gh-pages branch
git checkout gh-pages

# 2. Make your changes to index.html

# 3. Commit and push
git add index.html
git commit -m "Update website content"
git push origin gh-pages

# 4. GitHub will automatically redeploy
```

## Adding Affiliate Links

To add affiliate links to products:

1. Checkout the `gh-pages` branch
2. Edit `index.html`
3. Find the product links (e.g., `<a href="?item=air-assist-basic"...`)
4. Replace with your affiliate URLs:
   ```html
   <a href="https://amazon.com/your-affiliate-link?tag=yourcode">
   ```
5. Commit and push changes

## Branch Management

### Main Branch (`main` or `copilot/complete-feature-and-bug-testing`)
- Contains the full LaserTrace Pro application
- TypeScript, React, Tauri code
- Build scripts and configuration

### Website Branch (`gh-pages`)
- Contains only the static website
- Pure HTML/CSS/JavaScript
- Used for GitHub Pages deployment

## Troubleshooting

### Site Not Deploying
- Check the Actions tab for deployment errors
- Verify the branch name is exactly `gh-pages`
- Ensure GitHub Pages is enabled in repository settings

### 404 Error
- Wait a few minutes after first deployment
- Check that the root directory is selected (not `/docs`)
- Verify `index.html` exists in the root of gh-pages branch

### Changes Not Showing
- Clear your browser cache
- Wait 5-10 minutes for GitHub's CDN to update
- Check the deployment timestamp in Actions tab

## Security Notes

- Keep affiliate links secure and track them properly
- Don't commit sensitive API keys or tokens
- Use HTTPS for all external links
- Validate user input if adding dynamic features

## Maintenance

### Regular Updates
- Update product information quarterly
- Test all affiliate links monthly
- Monitor analytics to track effectiveness
- Keep copyright year current

### Performance
- Optimize images if adding product photos
- Minimize external dependencies
- Use CDN for frameworks (already using Tailwind CDN)

## Support

For issues with:
- **GitHub Pages**: Check GitHub's status page
- **Website content**: Edit `index.html` in gh-pages branch
- **App integration**: Edit `gearAds.ts` in main branch

## Next Steps

After deployment:
1. ✅ Verify site is accessible
2. ✅ Test all navigation
3. ✅ Update gearAds.ts with live URL
4. ✅ Add real affiliate links
5. ✅ Test app → website integration
6. ✅ Monitor analytics

---

**Note**: The gh-pages branch has been created locally but needs to be pushed to GitHub. This requires repository push permissions.

**Current Status**: Branch ready for deployment ✅
