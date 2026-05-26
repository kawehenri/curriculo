# Proposta de patrocínio — Rodrigo Falcão

Documento HTML/PDF de patrocínio esportivo em Judô.

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `curriculobr.html` | Versão em português |
| `curriculoen.html` | Versão em inglês |
| `IMGS/` | Fotos do atleta e da trajetória |

## Gerar PDF

Na raiz do repositório:

```bash
npm run gerar:falcao
```

Gera `curriculobr.pdf` e `curriculoen.pdf` nesta pasta.

## Adicionar fotos na seção Trajetória

1. Coloque a imagem em `IMGS/` com nome simples (ex.: `trajetoria-4.jpeg`).
2. Em `curriculobr.html` (e `curriculoen.html`), dentro de `.trajectory-gallery`, adicione:

```html
<figure class="trajectory-item">
  <img src="IMGS/trajetoria-4.jpeg" alt="Trajetória esportiva">
  <figcaption>Brasileiro SUB-15 2026 — pódio ouro</figcaption>
</figure>
```

3. Remova a classe `placeholder` quando a legenda estiver definitiva.
4. Rode `npm run gerar:falcao` novamente.

## Comprimir imagens (PDF menor)

```bash
npm run comprimir:falcao
```

Redimensiona JPEGs em `IMGS/` (exceto `perfil.jpeg` se preferir manter alta resolução).

## O que editar com frequência

- Legendas em `<figcaption>` na seção Trajetória
- Representante legal no cabeçalho
- Faixas Bronze/Prata/Ouro em "Investimento e metas"
- Resultados e rankings por ano
