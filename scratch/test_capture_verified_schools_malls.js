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

  const propUrl = 'http://localhost:3000/property/prop_chi_01_lincoln_cleveland/index.html';
  console.log('Navigating to ' + propUrl);
  await page.goto(propUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Full view screenshot
  await page.screenshot({ path: path.join(artifactDir, 'verified_property_top.png') });
  console.log('Saved verified_property_top.png');

  // 2. Scroll to Schools & Malls section
  await page.evaluate(() => {
    window.scrollBy(0, 950);
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'verified_schools_malls_section.png') });
  console.log('Saved verified_schools_malls_section.png');

  // 3. Open ROI Calculator modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const roiBtn = btns.find(b => b.textContent.includes('ROI Calculator'));
    if (roiBtn) roiBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'verified_roi_calculator_modal.png') });
  console.log('Saved verified_roi_calculator_modal.png');

  await browser.close();
  console.log('All verification screenshots captured!');
})();
