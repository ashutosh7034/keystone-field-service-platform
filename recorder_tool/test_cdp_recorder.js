const puppeteer = require('puppeteer-core');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function testCDPRecorder() {
  const outputPath = path.join(__dirname, 'test_cdp.webm');
  console.log('Target output:', outputPath);
  console.log('FFmpeg binary:', ffmpegInstaller.path);

  const ffmpeg = spawn(ffmpegInstaller.path, [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', '15',
    '-i', '-',
    '-c:v', 'libvpx-vp9',
    '-crf', '32',
    '-b:v', '0',
    '-pix_fmt', 'yuv420p',
    outputPath
  ]);

  ffmpeg.stderr.on('data', (d) => {
    // console.log('FFmpeg:', d.toString());
  });

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--window-size=1440,900', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const cdp = await page.createCDPSession();
  let frameCount = 0;
  cdp.on('Page.screencastFrame', async ({ data, sessionId }) => {
    try {
      const buffer = Buffer.from(data, 'base64');
      if (ffmpeg.stdin.writable) {
        ffmpeg.stdin.write(buffer);
        frameCount++;
      }
      await cdp.send('Page.screencastFrameAck', { sessionId });
    } catch (e) {}
  });

  await cdp.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 85,
    maxWidth: 1440,
    maxHeight: 900,
    everyNthFrame: 1
  });

  console.log('Recording started...');
  await page.goto('http://localhost:5173/?autologin=dispatcher@keystone.demo&view=dashboard', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3000));

  console.log('Stopping screencast... Total frames captured:', frameCount);
  await cdp.send('Page.stopScreencast');
  await browser.close();

  ffmpeg.stdin.end();
  await new Promise(resolve => ffmpeg.on('close', resolve));

  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    console.log('SUCCESS! Video file generated. Size:', stats.size, 'bytes');
  } else {
    console.error('ERROR: Video file was not created!');
  }
}

testCDPRecorder();
