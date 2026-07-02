const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

function resolveBrowserExecutable() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate));
}

async function gerarPDF(page, htmlPath, pdfPath) {
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0' });
  await page.emulateMediaType('print');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' },
    printBackground: true,
  });
  console.log('OK', pdfPath);
}

async function main() {
  const base = path.join(__dirname, 'falcao');
  const pairs = [
    ['curriculobr.html', 'curriculobr.pdf'],
    ['curriculoen.html', 'curriculoen.pdf'],
  ];

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: resolveBrowserExecutable(),
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    for (const [html, pdf] of pairs) {
      const htmlPath = path.join(base, html);
      const pdfPath = path.join(base, pdf);
      await gerarPDF(page, htmlPath, pdfPath);
    }
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
