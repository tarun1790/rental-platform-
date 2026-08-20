const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const artifactDir = path.join('C:', 'Users', 'tarun', '.gemini', 'antigravity', 'brain', '1ea36d88-73a8-4968-95c6-6de9568f0d51');
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Open property page on GitHub Pages live deployment
  const testUrl = 'https://tarun1790.github.io/rental-platform-/property/prop_chi_01_lincoln_cleveland/';
  console.log('Navigating to ' + testUrl);
  await page.goto(testUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Top Hero view
  await page.screenshot({ path: path.join(artifactDir, 'test_property_top_hero.png') });
  console.log('Saved test_property_top_hero.png');

  // Scroll down to middle dashboards
  await page.evaluate(() => {
    window.scrollBy(0, 1000);
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'test_property_middle_dashboards.png') });
  console.log('Saved test_property_middle_dashboards.png');

  // Scroll down to lower dashboards & application
  await page.evaluate(() => {
    window.scrollBy(0, 1200);
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'test_property_lower_dashboards.png') });
  console.log('Saved test_property_lower_dashboards.png');

  await browser.close();
  console.log('All property vertical scrolling screenshots saved!');
})();
