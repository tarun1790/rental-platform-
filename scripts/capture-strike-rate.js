const puppeteer = require('puppeteer');
const path = require('path');
const os = require('os');
const fs = require('fs');

const ARTIFACT_DIR = 'C:/Users/tarun/.gemini/antigravity/brain/1ea36d88-73a8-4968-95c6-6de9568f0d51';
const tempDir = path.join(os.tmpdir(), 'puppeteer_sr_' + Date.now());

async function run() {
  console.log('Launching browser to capture 100% strike rate verification...');
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

    // 1. Landing screenshot with 4815 residences & 100% Strike Rate button
    const snap1 = path.join(ARTIFACT_DIR, 'snap_strike_rate_landing_4815.png');
    await page.screenshot({ path: snap1 });
    console.log('Saved snap1:', snap1);

    // 2. Click 100% Strike Rate button in header
    console.log('Clicking 100% Strike Rate button in header...');
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('100% Strike Rate')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2500));

    // 3. Strike Rate Audit Modal screenshot
    const snap2 = path.join(ARTIFACT_DIR, 'snap_strike_rate_audit_modal.png');
    await page.screenshot({ path: snap2 });
    console.log('Saved snap2:', snap2);

  } catch (err) {
    console.error('Capture error:', err);
  } finally {
    await browser.close();
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
  }
}

run();
