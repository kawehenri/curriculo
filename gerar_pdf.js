const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function gerarPDF(htmlPath, pdfPath) {
    let browser;
    try {
        console.log(`Gerando PDF de: ${htmlPath}`);
        console.log(`Salvando em: ${pdfPath}`);

        // Inicia o navegador
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Converte o caminho HTML para URL de arquivo
        const htmlAbsolutePath = path.resolve(htmlPath);
        const fileUrl = `file://${htmlAbsolutePath}`;

        // Carrega a página HTML
        await page.goto(fileUrl, {
            waitUntil: 'networkidle0'
        });

        // Usa CSS de impressão (@media print) — quebras de página e margens coerentes
        await page.emulateMediaType('print');

        // Gera o PDF
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            margin: {
                top: '2cm',
                right: '2cm',
                bottom: '2cm',
                left: '2cm'
            },
            printBackground: true
        });

        console.log(`✓ PDF gerado com sucesso: ${pdfPath}\n`);
        return true;
    } catch (error) {
        console.error(`✗ Erro ao gerar PDF: ${error.message}\n`);
        return false;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function main() {
    const baseDir = __dirname;

    // Currículo em português
    const htmlBr = path.join(baseDir, 'curriculo', 'curriculobr.html');
    const pdfBr = path.join(baseDir, 'curriculo', 'curriculobr.pdf');

    // Currículo em inglês
    const htmlEn = path.join(baseDir, 'curriculoen', 'curriculoen.html');
    const pdfEn = path.join(baseDir, 'curriculoen', 'curriculoen.pdf');

    console.log('='.repeat(50));
    console.log('Gerador de PDFs dos Currículos');
    console.log('='.repeat(50));
    console.log();

    // Verifica se os arquivos HTML existem
    if (!fs.existsSync(htmlBr)) {
        console.error(`✗ Arquivo não encontrado: ${htmlBr}`);
        return;
    }
    if (!fs.existsSync(htmlEn)) {
        console.error(`✗ Arquivo não encontrado: ${htmlEn}`);
        return;
    }

    // Gera os PDFs
    const sucessoBr = await gerarPDF(htmlBr, pdfBr);
    const sucessoEn = await gerarPDF(htmlEn, pdfEn);

    // Resumo
    console.log('='.repeat(50));
    console.log('Resumo:');
    console.log('='.repeat(50));
    if (sucessoBr) {
        console.log(`✓ Currículo PT-BR: ${pdfBr}`);
    } else {
        console.log(`✗ Currículo PT-BR: Falhou`);
    }

    if (sucessoEn) {
        console.log(`✓ Currículo EN: ${pdfEn}`);
    } else {
        console.log(`✗ Currículo EN: Falhou`);
    }
    console.log('='.repeat(50));
}

main().catch(console.error);
