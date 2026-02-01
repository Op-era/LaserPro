
// Set this to your actual GitHub Pages URL:
// After deploying the gh-pages branch, this will be:
export const EXTERNAL_HUB_URL = "https://op-era.github.io/Laser-Pro-Engraver";

export interface GearAd {
  id: string;
  name: string;
  brand: string;
  targetBrand: string;
  desc: string;
}

export function getRedirectUrl(itemId: string, brand: string): string {
  // Redirect to GitHub Pages website with product query parameters
  // The website's index.html handles these parameters and shows/redirects to products
  return `${EXTERNAL_HUB_URL}?item=${itemId}&machine=${encodeURIComponent(brand)}&ref=lasertrace_app`;
}
