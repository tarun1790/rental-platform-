const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const failedRequests = [];
  const successfulRequests = [];
  const consoleErrors = [];

  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure()?.errorText || 'Unknown failure'
    });
  });

  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    if (status >= 400) {
      failedRequests.push({ url, status, statusText: response.statusText() });
    } else {
      successfulRequests.push({ url, status });
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  console.log('\n--- LOCAL NETWORK AUDIT ---');
  console.log(`Total Successful Requests: ${successfulRequests.length}`);
  console.log(`Total Failed (>= 400 or failed): ${failedRequests.length}`);

  const cssRequests = successfulRequests.filter(r => r.url.includes('.css'));
  console.log('\n--- CSS FILES LOADED LOCALLY ---');
  console.log(JSON.stringify(cssRequests, null, 2));

  if (failedRequests.length > 0) {
    console.log('\nFAILED REQUESTS:');
    console.log(JSON.stringify(failedRequests, null, 2));
  } else {
    console.log('\nALL ASSETS LOADED WITH 200 OK LOCALLY! ZERO 404s.');
  }

  // Take screenshot of local site
  const path = require('path');
  const artifactDir = path.join('C:', 'Users', 'tarun', '.gemini', 'antigravity', 'brain', '1ea36d88-73a8-4968-95c6-6de9568f0d51');
  
  // Scroll to dashboard
  await page.evaluate(() => {
    const el = document.getElementById('dashboard-section');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactDir, 'test_localhost_3000_verified.png') });
  console.log('Saved test_localhost_3000_verified.png');

  await browser.close();
})();
