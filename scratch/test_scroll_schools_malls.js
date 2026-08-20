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

  const propUrl = 'http://localhost:3000/property/prop_chi_01_lincoln_cleveland';
  console.log('Navigating to ' + propUrl);
  await page.goto(propUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Scroll down to Schools & Malls section
  await page.evaluate(() => {
    window.scrollBy(0, 950);
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'test_schools_malls_scrolled.png') });
  console.log('Saved test_schools_malls_scrolled.png');

  // Click the ROI Calculator button in header to open modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const roiBtn = btns.find(b => b.textContent.includes('ROI Calculator'));
    if (roiBtn) roiBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'test_roi_modal_open.png') });
  console.log('Saved test_roi_modal_open.png');

  await browser.close();
  console.log('Done!');
})();
