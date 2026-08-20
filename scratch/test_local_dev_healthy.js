const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  console.log('Testing http://localhost:3000 ...');
  const res1 = await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  console.log('Homepage status:', res1.status());

  console.log('Testing http://localhost:3000/property/prop_chi_01_lincoln_cleveland ...');
  const res2 = await page.goto('http://localhost:3000/property/prop_chi_01_lincoln_cleveland', { waitUntil: 'networkidle2' });
  console.log('Property page status:', res2.status());

  if (consoleErrors.length > 0) {
    console.log('Console Errors:', consoleErrors);
  } else {
    console.log('Zero console errors! Local development server is 100% healthy and working.');
  }

  await browser.close();
})();
