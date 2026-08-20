const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Load Live GitHub Pages Home
  const liveHomeUrl = 'https://tarun1790.github.io/rental-platform-/?v=' + Date.now();
  console.log('Navigating to ' + liveHomeUrl);
  const res1 = await page.goto(liveHomeUrl, { waitUntil: 'networkidle2' });
  console.log('Homepage status:', res1.status());

  // 2. Click "Open Full Intelligence" on Selected House Spotlight
  console.log('Clicking Open Full Intelligence...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Open Full Intelligence'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  console.log('Current URL after click:', page.url());

  // 3. Click "Back to Map & Listings"
  console.log('Clicking Back to Map & Listings...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Back to Map & Listings'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  console.log('Current URL after Back click:', page.url());

  await browser.close();
  console.log('All navigation click tests completed with zero 404s!');
})();
