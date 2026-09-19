const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function testRecord() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--window-size=1440,900',
      '--enable-usermedia-screen-capturing',
      '--auto-select-desktop-capture-source="Entire screen"',
      '--use-fake-ui-for-media-stream',
      '--allow-http-screen-capture',
      '--no-sandbox'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/?autologin=dispatcher@keystone.demo&view=dashboard', { waitUntil: 'networkidle0' });

  // Start in-browser MediaRecorder
  await page.evaluate(() => {
    return new Promise(async (resolve, reject) => {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1440 },
            height: { ideal: 900 },
            frameRate: { ideal: 30 }
          },
          audio: false
        });

        window._recordedChunks = [];
        window._mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9'
        });

        window._mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            window._recordedChunks.push(e.data);
          }
        };

        window._mediaRecorder.start(250); // Slice every 250ms
        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
  });

  console.log('Recording started! Interacting for 3 seconds...');
  await new Promise(r => setTimeout(r, 3000));

  // Stop recording and get base64 data
  const base64Data = await page.evaluate(async () => {
    return new Promise((resolve) => {
      window._mediaRecorder.onstop = async () => {
        const blob = new Blob(window._recordedChunks, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(blob);
      };
      window._mediaRecorder.stop();
      // stop stream tracks
      window._mediaRecorder.stream.getTracks().forEach(t => t.stop());
    });
  });

  const outputPath = path.join(__dirname, 'test_output.webm');
  fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
  console.log('Recorded video saved to:', outputPath, 'Size:', fs.statSync(outputPath).size, 'bytes');

  await browser.close();
}

testRecord();
