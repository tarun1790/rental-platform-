const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ARTIFACT_DIR = 'C:/Users/tarun/.gemini/antigravity/brain/1ea36d88-73a8-4968-95c6-6de9568f0d51';
const tempDir = path.join(os.tmpdir(), 'puppeteer_verify_' + Date.now());

async function run() {
  console.log('Launching browser to capture visual verification...');
  const browser = await puppeteer.launch({
    headless: 'new',
    userDataDir: tempDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('Navigating to http://localhost:3005 ...');
    await page.goto('http://localhost:3005', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    // 1. Direct landing page screenshot
    const snap1 = path.join(ARTIFACT_DIR, 'snap_direct_executive_landing.png');
    await page.screenshot({ path: snap1 });
    console.log('Saved snap1:', snap1);

    // 2. Click Zillow portal tab
    console.log('Clicking Zillow portal tab...');
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Zillow')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2000));
    const snap2 = path.join(ARTIFACT_DIR, 'snap_zillow_filtered_split.png');
    await page.screenshot({ path: snap2 });
    console.log('Saved snap2:', snap2);

    // 3. Click OKF button on first card or header OKF Studio
    console.log('Clicking OKF Studio in header...');
    const okfButtons = await page.$$('button');
    for (const b of okfButtons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('OKF Studio')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2000));
    const snap3 = path.join(ARTIFACT_DIR, 'snap_okf_studio_modal.png');
    await page.screenshot({ path: snap3 });
    console.log('Saved snap3:', snap3);

    // Close OKF modal
    const closeBtns = await page.$$('button');
    for (const b of closeBtns) {
      const title = await page.evaluate(el => el.getAttribute('title'), b);
      if (title && title.includes('Close')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));

    // 4. Click Inspect / Detail on first listing
    console.log('Clicking Inspect on first residence card...');
    const inspectButtons = await page.$$('button');
    for (const b of inspectButtons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.trim() === 'Inspect') {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2000));
    const snap4 = path.join(ARTIFACT_DIR, 'snap_property_detail_modal.png');
    await page.screenshot({ path: snap4 });
    console.log('Saved snap4:', snap4);

  } catch (err) {
    console.error('Capture error:', err);
  } finally {
    await browser.close();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

run();
