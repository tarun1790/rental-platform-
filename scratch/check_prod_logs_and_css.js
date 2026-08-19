const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

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

  console.log('Navigating to https://tarun1790.github.io/rental-platform-/ ...');
  await page.goto('https://tarun1790.github.io/rental-platform-/', { waitUntil: 'networkidle2' });

  console.log('\n--- NETWORK REQUEST AUDIT ---');
  console.log(`Total Successful Requests: ${successfulRequests.length}`);
  console.log(`Total Failed (>= 400 or failed): ${failedRequests.length}`);

  if (failedRequests.length > 0) {
    console.log('\nFAILED REQUESTS:');
    console.log(JSON.stringify(failedRequests, null, 2));
  } else {
    console.log('\nALL ASSETS LOADED WITH 200 OK! Zero 404s.');
  }

  // Filter for CSS files
  const cssRequests = successfulRequests.filter(r => r.url.includes('.css'));
  console.log('\n--- CSS FILES LOADED ---');
  console.log(JSON.stringify(cssRequests, null, 2));

  if (consoleErrors.length > 0) {
    console.log('\n--- CONSOLE ERRORS ---');
    console.log(JSON.stringify(consoleErrors, null, 2));
  } else {
    console.log('\nZERO console errors detected.');
  }

  await browser.close();
})();
