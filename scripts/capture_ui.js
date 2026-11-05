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

  console.log('Navigating to http://localhost:3005 ...');
  await page.goto('http://localhost:3005', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  const shot1 = path.join(artifactDir, 'spatial_coverflow_verification.png');
  await page.screenshot({ path: shot1, fullPage: false });
  console.log('Saved spatial screenshot:', shot1);

  // Click on "Split" view button
  try {
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await (await b.getProperty('innerText')).jsonValue();
      if (text && text.includes('Split')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1500));
    const shot2 = path.join(artifactDir, 'split_workspace_verification.png');
    await page.screenshot({ path: shot2, fullPage: false });
    console.log('Saved split screenshot:', shot2);
  } catch (e) {
    console.error('Failed to click split:', e);
  }

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
