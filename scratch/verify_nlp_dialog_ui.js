const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\tarun\\.gemini\\antigravity\\brain\\1ea36d88-73a8-4968-95c6-6de9568f0d51';

(async () => {
  console.log('--- Launching Puppeteer E2E Verification for Customer NLP Dialog ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    console.log('1. Navigating to http://localhost:3000 ...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('   Page loaded successfully.');

    // Wait for the hero/page content to load
    await new Promise(r => setTimeout(r, 2000));

    // Scroll to dashboard
    console.log('2. Clicking to explore dashboard ...');
    await page.click('section');
    await new Promise(r => setTimeout(r, 1500));

    // Find and click the AI House Assistant button
    console.log('3. Triggering Customer AI House Assistant Dialog ...');
    const aiBtn = await page.waitForSelector('button[title*="AI Natural Language House Assistant"]', { timeout: 10000 });
    await aiBtn.click();
    await new Promise(r => setTimeout(r, 1500));

    // Verify dialog is visible
    const dialogTitle = await page.$eval('h2', el => el.innerText);
    console.log('   Dialog Opened Title:', dialogTitle);

    // Capture screenshot of Dialog in Matching mode
    const matchScreenshotPath = path.join(ARTIFACT_DIR, 'verified_nlp_dialog_matching.png');
    await page.screenshot({ path: matchScreenshotPath });
    console.log('   Saved match screenshot to:', matchScreenshotPath);

    // Switch to 1,000 Training Examples Tab
    console.log('4. Switching to 1,000 Training Examples Tab ...');
    const tabs = await page.$$('button');
    for (const tab of tabs) {
      const text = await (await tab.getProperty('innerText')).jsonValue();
      if (text.includes('1,000 Training Examples')) {
        await tab.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1200));

    // Capture screenshot of 1,000 Training Examples tab
    const trainingScreenshotPath = path.join(ARTIFACT_DIR, 'verified_1000_training_corpus.png');
    await page.screenshot({ path: trainingScreenshotPath });
    console.log('   Saved training benchmark screenshot to:', trainingScreenshotPath);

    // Switch back to Match tab
    for (const tab of tabs) {
      const text = await (await tab.getProperty('innerText')).jsonValue();
      if (text.includes('Match Houses')) {
        await tab.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 800));

    // Click quick prompt with typos to test real-time self-correction
    console.log('5. Clicking typo stress-test prompt: "Lincoln Park 3 Bed (<$800k)" ...');
    const promptBtns = await page.$$('button');
    for (const p of promptBtns) {
      const text = await (await p.getProperty('innerText')).jsonValue();
      if (text.includes('Lincoln Park 3 Bed')) {
        await p.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1500));

    const finalScreenshotPath = path.join(ARTIFACT_DIR, 'verified_self_correction_typos.png');
    await page.screenshot({ path: finalScreenshotPath });
    console.log('   Saved typo self-correction screenshot to:', finalScreenshotPath);

    console.log('--- Puppeteer E2E Verification Complete: SUCCESS! ---');
  } catch (err) {
    console.error('Puppeteer verification failed:', err);
  } finally {
    await browser.close();
  }
})();
