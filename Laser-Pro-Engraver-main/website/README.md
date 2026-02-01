# LaserTrace Pro - Product Recommendation Website

This directory contains the static website for product recommendations and affiliate links.

## Deployment

### GitHub Pages
1. Push this directory to your repository
2. Go to repository Settings → Pages
3. Set source to `main` branch, `/website` folder
4. Your site will be available at: `https://[username].github.io/Laser-Pro-Engraver/`

### Update the App
After deploying, update `gearAds.ts` with your actual URL:
```typescript
export const EXTERNAL_HUB_URL = "https://[username].github.io/Laser-Pro-Engraver";
```

## Adding Affiliate Links

Edit `index.html` and replace the product links with your actual affiliate URLs:

```javascript
const affiliateLinks = {
  'air-assist-basic': 'https://your-affiliate-link-here',
  'camera-usb': 'https://your-affiliate-link-here',
  // ... add more products
};
```

## Product Categories

The website includes:
- Air Assist Systems
- Camera Systems  
- Materials (wood, acrylic, etc.)
- Safety Equipment
- Accessories
- Maintenance supplies

Add your affiliate links for each product to monetize recommendations from the app.

## Testing Locally

Open `index.html` in a browser to test the site before deployment.

## Copyright

© 2026 Shane Foster
