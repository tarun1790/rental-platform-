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

  // 1. Check house detail page width fit and non-glowing light red
  const propUrl = 'https://tarun1790.github.io/rental-platform-/property/prop_chi_01_lincoln_cleveland/';
  console.log('Navigating to ' + propUrl);
  await page.goto(propUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactDir, 'test_fitted_house_page.png') });
  console.log('Saved test_fitted_house_page.png');

  // 2. Check main dashboard
  const homeUrl = 'https://tarun1790.github.io/rental-platform-/';
  console.log('Navigating to ' + homeUrl);
  await page.goto(homeUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const el = document.getElementById('dashboard-section');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'test_fitted_home_dashboard.png') });
  console.log('Saved test_fitted_home_dashboard.png');

  await browser.close();
  console.log('All verification checks completed!');
})();
