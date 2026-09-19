const puppeteer = require('puppeteer-core');

async function testClick() {
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

  await page.waitForSelector('.ops-summary-panel', { timeout: 10000 });
  console.log('Logged in as Dispatcher, current panel visible');

  // Let's find the nav link
  const links = await page.$$('.nav-link');
  console.log('Nav links found:', links.length);
  for (let i = 0; i < links.length; i++) {
    const txt = await page.evaluate(el => el.textContent, links[i]);
    const box = await links[i].boundingBox();
    console.log(`Link ${i}: "${txt.trim()}", box:`, box);
  }

  console.log('\n--- Checking elementFromPoint ---');
  const elInfo = await page.evaluate(() => {
    const el = document.elementFromPoint(114, 169);
    return {
      tagName: el.tagName,
      className: el.className,
      text: el.textContent,
      outerHTML: el.outerHTML.substring(0, 150)
    };
  });
  console.log('Element at point (114, 169):', elInfo);

  // If we click it directly with el.click()
  await page.evaluate(() => {
    const el = document.elementFromPoint(114, 169);
    el.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  const h2After = await page.evaluate(() => document.querySelector('h2')?.textContent);
  console.log('H2 after click:', h2After);

  await browser.close();
}

testClick().catch(console.error);
