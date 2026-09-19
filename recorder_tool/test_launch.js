const puppeteer = require('puppeteer-core');

async function test() {
  try {
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: 'new',
      args: ['--window-size=1440,900', '--no-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    const title = await page.title();
    console.log('SUCCESS: Page loaded with title:', title);
    await browser.close();
  } catch (err) {
    console.error('ERROR launching Chrome:', err);
  }
}
test();
