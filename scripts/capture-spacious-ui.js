const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ARTIFACT_DIR = 'C:/Users/tarun/.gemini/antigravity/brain/1ea36d88-73a8-4968-95c6-6de9568f0d51';
const tempDir = path.join(os.tmpdir(), 'puppeteer_tmp_' + Date.now());

async function capture() {
  console.log('Launching browser for visual verification on port 3005...');
  const browser = await puppeteer.launch({
    headless: 'new',
    userDataDir: tempDir,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1920,1080'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('Navigating to http://localhost:3005 ...');
    await page.goto('http://localhost:3005', { waitUntil: 'networkidle2', timeout: 35000 });

    await new Promise(r => setTimeout(r, 2000));

    // Scroll to Dashboard Section
    console.log('Scrolling down to Dashboard...');
    await page.evaluate(() => {
      const el = document.getElementById('dashboard-section');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 2000));

    // Click Zillow portal tab
    console.log('Clicking Zillow Portal tab...');
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Zillow')) {
        await b.click();
        console.log('Clicked Zillow tab:', text);
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2000));

    console.log('Capturing Zillow Filtered Dashboard...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'snap_zillow_filtered_dashboard.png'),
      fullPage: false
    });

    // Scroll down to show Zillow property cards
    console.log('Scrolling to Zillow Property Cards...');
    await page.evaluate(() => {
      window.scrollBy(0, 600);
    });
    await new Promise(r => setTimeout(r, 1500));

    console.log('Capturing Zillow Property Cards Grid...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'snap_zillow_property_grid.png'),
      fullPage: false
    });

    // Open Local SQLite Database Modal
    console.log('Opening Local SQLite Database Modal...');
    const dbBtn = await page.$('button[title*="SQLite"]');
    if (dbBtn) {
      await dbBtn.click();
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'snap_zillow_db_modal_1317.png'),
        fullPage: false
      });
    }

    console.log('All screenshots captured successfully!');
  } finally {
    await browser.close();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
