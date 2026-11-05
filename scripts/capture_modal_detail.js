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
  await new Promise(r => setTimeout(r, 2000));

  // In 3D Coverflow view, find and click the "Details" button or card
  const btn = await page.$('button[title="View Full Architectural Dossier"]');
  if (btn) {
    await btn.click();
    console.log('Clicked details button directly');
  } else {
    // Try schedule tour or card click
    const tourBtn = await page.$('button[title*="Tour"]');
    if (tourBtn) await tourBtn.click();
    console.log('Fallback clicked');
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
