const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const artifactDir = path.join('C:', 'Users', 'tarun', '.gemini', 'antigravity', 'brain', '1ea36d88-73a8-4968-95c6-6de9568f0d51');
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const propUrl = 'http://localhost:3000/property/prop_chi_01_lincoln_cleveland/index.html';
  console.log('Navigating to ' + propUrl);
  await page.goto(propUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Scroll to 5 Schools section
  await page.evaluate(() => {
    window.scrollBy(0, 900);
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'test_5_ranked_schools.png') });
  console.log('Saved test_5_ranked_schools.png');

  // 2. Scroll to 5 Malls section
  await page.evaluate(() => {
    window.scrollBy(0, 600);
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'test_5_ranked_malls.png') });
  console.log('Saved test_5_ranked_malls.png');

  // 3. Scroll to Events, Parties, Roads, Lights, Community
  await page.evaluate(() => {
    window.scrollBy(0, 650);
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'test_events_nightlife_roads_lights_community.png') });
  console.log('Saved test_events_nightlife_roads_lights_community.png');

  await browser.close();
  console.log('All verification checks completed!');
})();
