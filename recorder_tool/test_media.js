const puppeteer = require('puppeteer-core');

async function testDisplayMedia() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false, // Or test headless
    args: [
      '--window-size=1440,900',
      '--enable-usermedia-screen-capturing',
      '--auto-select-desktop-capture-source="Entire screen"',
      '--use-fake-ui-for-media-stream',
      '--allow-http-screen-capture',
      '--no-sandbox'
    ]
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  const result = await page.evaluate(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const tracks = stream.getVideoTracks();
      return { success: true, trackCount: tracks.length, label: tracks[0]?.label };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });
  console.log('getDisplayMedia result:', result);
  await browser.close();
}
testDisplayMedia();
