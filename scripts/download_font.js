const fs = require('fs');
const path = require('path');
const https = require('https');

const FONT_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosansdevanagari/NotoSansDevanagari%5Bwdth%2Cwght%5D.ttf';
const DIR_PATH = path.join(process.cwd(), 'lib', 'fonts');
const FILE_PATH = path.join(DIR_PATH, 'hindifont.js');

if (!fs.existsSync(DIR_PATH)) {
    fs.mkdirSync(DIR_PATH, { recursive: true });
}

console.log('Downloading font from:', FONT_URL);

function download(url) {
    https.get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
            console.log('Redirecting to:', res.headers.location);
            download(res.headers.location);
            return;
        }

        if (res.statusCode !== 200) {
            console.error('Failed to download font. Status Code:', res.statusCode);
            process.exit(1);
        }

        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
            const buffer = Buffer.concat(chunks);
            console.log('Downloaded buffer size:', buffer.length);
            if (buffer.length === 0) {
                console.error('Downloaded buffer is empty!');
                process.exit(1);
            }
            const base64 = buffer.toString('base64');
            const fileContent = `// Auto-generated. Do not edit.\nexport const hindiFontBase64 = '${base64}';\n`;
            fs.writeFileSync(FILE_PATH, fileContent);
            console.log('Successfully wrote base64 string to', FILE_PATH);
            console.log('File size:', fs.statSync(FILE_PATH).size);
        });
    }).on('error', (err) => {
        console.error('Error downloading font:', err);
        process.exit(1);
    });
}

download(FONT_URL);
