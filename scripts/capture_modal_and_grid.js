const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function capture() {
  const artifactDir = path.resolve('C:/Users/tarun/.gemini/antigravity/brain/1ea36d88-73a8-4968-95c6-6de9568f0d51');
  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });

  await page.goto('http://localhost:3005', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  // 1. Open Search Modal via Cmd+K / Ctrl+K
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyK');
  await page.keyboard.up('Control');
  await new Promise(r => setTimeout(r, 1000));

  const shotModal = path.join(artifactDir, 'search_modal_verification.png');
  await page.screenshot({ path: shotModal, fullPage: false });
  console.log('Saved search modal screenshot:', shotModal);

  // Close modal via Escape
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));

  // 2. Click Grid View
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await (await b.getProperty('innerText')).jsonValue();
    if (text && text.includes('Grid')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  const shotGrid = path.join(artifactDir, 'grid_view_verification.png');
  await page.screenshot({ path: shotGrid, fullPage: false });
  console.log('Saved grid screenshot:', shotGrid);

  // 3. Click Details button on first card
  const detailBtns = await page.$$('button');
  for (const b of detailBtns) {
    const text = await (await b.getProperty('innerText')).jsonValue();
    if (text && text.includes('Details')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  const shotDetail = path.join(artifactDir, 'detail_modal_verification.png');
  await page.screenshot({ path: shotDetail, fullPage: false });
  console.log('Saved detail modal screenshot:', shotDetail);

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
