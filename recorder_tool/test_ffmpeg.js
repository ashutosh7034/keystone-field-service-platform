const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const { execSync } = require('child_process');

console.log('FFMPEG PATH:', ffmpeg.path);
console.log('VERSION:', execSync(`"${ffmpeg.path}" -version`).toString().split('\n')[0]);
