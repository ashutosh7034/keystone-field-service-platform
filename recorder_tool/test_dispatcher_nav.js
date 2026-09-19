const puppeteer = require('puppeteer-core');

async function testDispatcherNav() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--window-size=1440,900', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  // Login as Dispatcher
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'dispatcher@keystone.demo');
  await page.type('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Evaluating click on Work Orders...');
  const clicked = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('.nav-link'));
    const wo = links.find(l => l.textContent.includes('Work Orders'));
    if (wo) {
      wo.click();
      return true;
    }
    return false;
  });
  console.log('Clicked result:', clicked);
  await new Promise(r => setTimeout(r, 2000));
  const heading = await page.evaluate(() => {
    const h2 = document.querySelector('h2');
    return h2 ? h2.textContent : 'none';
  });
  console.log('H2 on page:', heading);
  const searchInput = await page.$('input[placeholder*="Search by WO Code"]');
  console.log('Search input found:', !!searchInput);

  await browser.close();
}

testDispatcherNav();
