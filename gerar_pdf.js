const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const MIME_BY_EXT = {
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
};

function mimeFor(filePath) {
    return MIME_BY_EXT[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

async function inlineImages(page, htmlDir) {
    const srcList = await page.$$eval('img[src]', (imgs) =>
        imgs
            .map((img) => img.getAttribute('src'))
            .filter((src) => src && !src.startsWith('data:') && !/^https?:/i.test(src))
    );

    const unique = [...new Set(srcList)];

    for (const src of unique) {
        const imgPath = path.resolve(htmlDir, src);
        if (!fs.existsSync(imgPath)) {
            console.warn(`  Aviso: imagem não encontrada: ${imgPath}`);
            continue;
        }
        const buffer = fs.readFileSync(imgPath);
        const dataUri = `data:${mimeFor(imgPath)};base64,${buffer.toString('base64')}`;
        await page.evaluate(
            (oldSrc, newSrc) => {
                document.querySelectorAll(`img[src="${oldSrc}"]`).forEach((img) => {
                    img.setAttribute('src', newSrc);
                });
            },
            src,
            dataUri
        );
    }
}

function gerarAtsMd(baseDir) {
    const certPath = path.join(baseDir, 'certificados.json');
    const outPath = path.join(baseDir, 'curriculo', 'curriculo-ats.md');
    const certs = JSON.parse(fs.readFileSync(certPath, 'utf8'));

    const certLines = certs.map((c) => {
        const data = c.data ? ` | Conclusão: ${c.data}` : '';
        const id = c.credentialId ? ` | ID: ${c.credentialId}` : '';
        const tags = c.competencias.join(', ');
        return `- **${c.titulo}** — ${c.emissor}${data}${id} | Competências: ${tags}`;
    });

    const md = `# Kawê Henrique — Currículo (texto ATS)

Desenvolvedor Full-Stack | Mobile (Flutter, React Native) | Laravel · React · MySQL

**E-mail:** kawehenri@gmail.com | **Telefone:** (61) 9 8627-9308 | **Local:** Samambaia Norte – DF / Águas Lindas de Goiás - GO
**GitHub:** https://github.com/kawehenri | **LinkedIn:** https://www.linkedin.com/in/kaw%C3%AA-henrique-67308630a/ | **Portfólio:** https://kawehenri.site

## Objetivo

Desenvolvimento web full-stack com ênfase em Laravel e React, comunicação com usuários e boas práticas de engenharia de software.

## Competências técnicas

- Back-end: Python, PHP, Laravel | Front-end: HTML, CSS, JavaScript, React
- Mobile: Flutter, React Native | Publicação: Google Play Console, Apple App Store Connect
- APIs REST; integrações: Mercado Pago, Cielo, Asaas, WhatsApp API
- Banco de dados: MySQL | Git/GitHub | Low-code: Lovable | UI/UX | Excel

## Experiência — DF Informática (Estagiário, 2025 – Presente)

- Sistemas web PHP, Laravel, HTML, CSS, JavaScript; MySQL; Git; UI/UX; atendimento a clientes
- Participação em projetos de clientes da empresa (não autoria pessoal): integrações de APIs, pagamentos e publicação em lojas

### Entregas profissionais — clientes (DF Informática)

| Cliente / sistema | URL | Minha atuação |
|-----------------|-----|---------------|
| iDucali | https://sistema.iducali.com.br | WhatsApp API, Hotmart, Mercado Pago, leads |
| Calheiro Orça Fácil | https://app.calheiroorcafacil.com.br | Play/App Store, Asaas, Flutter/RN, Laravel |
| Psykhedh | https://psykhedh.com.br | Site clínica, integração IA |
| Autentica by Silvia | https://autenticabysilvia.com.br | E-commerce, Mercado Pago, Cielo, e-mail |
| TendTudo Jaru | https://tendtudojaru.com.br | Google Maps, APIs REST |

## Projetos pessoais / acadêmicos

- **AquaFloww** (irrigação automatizada): https://aquafloww.site — Arduino, React Native, Mundo SENAI
- Repositórios no GitHub: https://github.com/kawehenri

## Formação

- Engenharia de Software — UDF (2025 – em andamento)
- Técnico em Desenvolvimento de Sistemas — SENAI Taguatinga (2024 – 2025)
- Ensino Médio — SESI-SENAI DF (2024 – 2025)

## Certificados (${certs.length})

${certLines.join('\n')}

## Idiomas

- Português — Nativo
- Inglês — A2 (leitura técnica)
`;

    fs.writeFileSync(outPath, md, 'utf8');
    console.log(`✓ Versão ATS (texto): ${outPath}\n`);
}

async function gerarPDF(htmlPath, pdfPath) {
    let browser;
    try {
        console.log(`Gerando PDF de: ${htmlPath}`);
        console.log(`Salvando em: ${pdfPath}`);

        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        const htmlAbsolutePath = path.resolve(htmlPath);
        const htmlDir = path.dirname(htmlAbsolutePath);
        const fileUrl = `file://${htmlAbsolutePath}`;

        await page.goto(fileUrl, {
            waitUntil: 'networkidle0'
        });

        console.log('  Inlining imagens (base64)...');
        await inlineImages(page, htmlDir);

        await page.emulateMediaType('print');

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

    const htmlBr = path.join(baseDir, 'curriculo', 'curriculobr.html');
    const pdfBr = path.join(baseDir, 'curriculo', 'curriculobr.pdf');

    const htmlEn = path.join(baseDir, 'curriculoen', 'curriculoen.html');
    const pdfEn = path.join(baseDir, 'curriculoen', 'curriculoen.pdf');

    console.log('='.repeat(50));
    console.log('Gerador de PDFs dos Currículos');
    console.log('='.repeat(50));
    console.log();

    if (!fs.existsSync(htmlBr)) {
        console.error(`✗ Arquivo não encontrado: ${htmlBr}`);
        return;
    }
    if (!fs.existsSync(htmlEn)) {
        console.error(`✗ Arquivo não encontrado: ${htmlEn}`);
        return;
    }

    gerarAtsMd(baseDir);

    const sucessoBr = await gerarPDF(htmlBr, pdfBr);
    const sucessoEn = await gerarPDF(htmlEn, pdfEn);

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
