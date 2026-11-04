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

    await new Promise(r => setTimeout(r, 3000));

    console.log('Capturing main spacious grid view...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'snap_spacious_clean_grid.png'),
      fullPage: false
    });

    // Switch to Split Map view by clicking button with text 'Split Map'
    console.log('Looking for Split Map button...');
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Split Map')) {
        console.log('Found Split Map button, clicking...');
        await btn.click();
        await new Promise(r => setTimeout(r, 2500));
        await page.screenshot({
          path: path.join(ARTIFACT_DIR, 'snap_spacious_split_map.png'),
          fullPage: false
        });
        break;
      }
    }

    // Switch to Local DB
    console.log('Looking for Local DB button...');
    const buttons2 = await page.$$('button');
    for (const btn of buttons2) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && (text.includes('Local DB') || text.includes('Database Explorer'))) {
        console.log('Found Local DB button, clicking...');
        await btn.click();
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({
          path: path.join(ARTIFACT_DIR, 'snap_spacious_db_modal.png'),
          fullPage: false
        });
        break;
      }
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
