const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const artifactDir = path.join('C:', 'Users', 'tarun', '.gemini', 'antigravity', 'brain', '1ea36d88-73a8-4968-95c6-6de9568f0d51');
  const liveUrl = 'https://tarun1790.github.io/rental-platform-/';

  // 1. Desktop Test (1440x900) - View Map UP
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1440, height: 900 });
  await desktopPage.goto(liveUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Scroll to dashboard section showing Map UP
  await desktopPage.evaluate(() => {
    const el = document.getElementById('dashboard-section');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1500));
  await desktopPage.screenshot({ path: path.join(artifactDir, 'test_map_up_view.png') });
  console.log('Saved test_map_up_view.png');

  // Scroll down to Houses Grid section
  await desktopPage.evaluate(() => {
    const el = document.getElementById('houses-section');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1500));
  await desktopPage.screenshot({ path: path.join(artifactDir, 'test_houses_down_grid.png') });
  console.log('Saved test_houses_down_grid.png');

  await browser.close();
  console.log('All verification screenshots saved successfully!');
})();
