const puppeteer = require('puppeteer-core');

async function testNav() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--window-size=1440,900', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:5173/?autologin=manager@keystone.demo&view=dashboard', { waitUntil: 'networkidle0' });
  console.log('Current URL:', page.url());

  // Click Work Orders via real mouse click
  const navLinks = await page.$$('.nav-link');
  let clicked = false;
  for (const link of navLinks) {
    const text = await page.evaluate(el => el.textContent, link);
    if (text.includes('Work Orders')) {
      const box = await link.boundingBox();
      console.log('Found Work Orders link at:', box);
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      clicked = true;
      break;
    }
  }

  if (clicked) {
    await page.waitForSelector('.table', { visible: true, timeout: 10000 });
    console.log('SUCCESS: Navigated to Work Orders, table is visible!');
  } else {
    console.error('Work Orders link not found');
  }

  await browser.close();
}

testNav();
