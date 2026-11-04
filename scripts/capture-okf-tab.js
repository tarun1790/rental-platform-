const puppeteer = require('puppeteer');
const path = require('path');
const os = require('os');
const fs = require('fs');

const ARTIFACT_DIR = 'C:/Users/tarun/.gemini/antigravity/brain/1ea36d88-73a8-4968-95c6-6de9568f0d51';
const tempDir = path.join(os.tmpdir(), 'puppeteer_tab_' + Date.now());

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    userDataDir: tempDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3005', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Click Inspect on first listing
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.trim() === 'Inspect') {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2000));

    // Click OKF Dossier tab
    const modalButtons = await page.$$('button');
    for (const b of modalButtons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('OKF Dossier')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2000));

    const snap = path.join(ARTIFACT_DIR, 'snap_property_detail_okf_tab.png');
    await page.screenshot({ path: snap });
    console.log('Saved snap_property_detail_okf_tab.png successfully');
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
  }
}
run();
