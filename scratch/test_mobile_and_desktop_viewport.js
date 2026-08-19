const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const artifactDir = path.join('C:', 'Users', 'tarun', '.gemini', 'antigravity', 'brain', '1ea36d88-73a8-4968-95c6-6de9568f0d51');
  const liveUrl = 'https://tarun1790.github.io/rental-platform-/';

  // 1. Desktop Test (1440x900) - Fit Max Viewport & Independent Scrollable Rectangle
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1440, height: 900 });
  await desktopPage.goto(liveUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Scroll to dashboard section
  await desktopPage.evaluate(() => {
    const el = document.getElementById('dashboard-section');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 2000));
  await desktopPage.screenshot({ path: path.join(artifactDir, 'test_desktop_fitted_workspace.png') });
  console.log('Saved test_desktop_fitted_workspace.png from live site');

  // 2. Mobile Test (390x844 - iPhone / Mobile Size)
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await mobilePage.goto(liveUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Scroll to dashboard on mobile
  await mobilePage.evaluate(() => {
    const el = document.getElementById('dashboard-section');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1500));
  await mobilePage.screenshot({ path: path.join(artifactDir, 'test_mobile_split_view.png') });
  console.log('Saved test_mobile_split_view.png from live site');

  // Test Mobile Map View with bottom house preview card
  await mobilePage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const mapBtn = btns.find(b => b.textContent && b.textContent.trim() === 'Map');
    if (mapBtn) mapBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await mobilePage.screenshot({ path: path.join(artifactDir, 'test_mobile_map_view.png') });
  console.log('Saved test_mobile_map_view.png from live site');

  // Test Mobile List View
  await mobilePage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const listBtn = btns.find(b => b.textContent && b.textContent.includes('Houses'));
    if (listBtn) listBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await mobilePage.screenshot({ path: path.join(artifactDir, 'test_mobile_list_view.png') });
  console.log('Saved test_mobile_list_view.png from live site');

  await browser.close();
  console.log('All live responsive viewport tests completed successfully!');
})();
