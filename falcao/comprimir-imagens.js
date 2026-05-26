const fs = require('fs');
const path = require('path');

const IMGS_DIR = path.join(__dirname, 'IMGS');
const MAX_WIDTH = 1200;
const QUALITY = 82;

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('Instale sharp: npm install sharp --save-dev');
    process.exit(1);
  }

  const files = fs.readdirSync(IMGS_DIR).filter((f) => /\.(jpe?g|png)$/i.test(f));

  for (const file of files) {
    const filePath = path.join(IMGS_DIR, file);
    const tmpPath = filePath + '.tmp';
    const meta = await sharp(filePath).metadata();
    const pipeline = sharp(filePath).rotate();

    if (meta.width > MAX_WIDTH) {
      pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    }

    await pipeline.jpeg({ quality: QUALITY, mozjpeg: true }).toFile(tmpPath);
    fs.renameSync(tmpPath, filePath);
    const stat = fs.statSync(filePath);
    console.log(`OK ${file} (${Math.round(stat.size / 1024)} KB)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
