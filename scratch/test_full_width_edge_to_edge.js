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

  // 1. House detail page full width
  const propUrl = 'https://tarun1790.github.io/rental-platform-/property/prop_chi_01_lincoln_cleveland/?v=' + Date.now();
  console.log('Navigating to ' + propUrl);
  await page.goto(propUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactDir, 'test_fullwidth_house_page.png') });
  console.log('Saved test_fullwidth_house_page.png');

  // 2. Home dashboard full width
  const homeUrl = 'https://tarun1790.github.io/rental-platform-/?v=' + Date.now();
  console.log('Navigating to ' + homeUrl);
  await page.goto(homeUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const el = document.getElementById('dashboard-section');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'test_fullwidth_home_dashboard.png') });
  console.log('Saved test_fullwidth_home_dashboard.png');

  await browser.close();
  console.log('All full-width edge-to-edge verification checks completed!');
})();
