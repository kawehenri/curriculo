const puppeteer = require('puppeteer');
const path = require('path');
const { pathToFileURL } = require('url');

async function main() {
  const base = path.join(__dirname, 'ELMA');
  const pairs = [
    ['curriculobr.html', 'curriculobr.pdf'],
    ['curriculoen.html', 'curriculoen.pdf'],
  ];
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    for (const [html, pdf] of pairs) {
      const htmlPath = path.join(base, html);
      const pdfPath = path.join(base, pdf);
      await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0' });
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' },
        printBackground: true,
      });
      console.log('OK', pdfPath);
    }
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
