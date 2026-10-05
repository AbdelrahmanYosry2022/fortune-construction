import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const tmpDir = resolve(root, 'tmp/pdfs')
const outDir = resolve(root, 'output/pdf')
mkdirSync(tmpDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const docs = [
  {
    lang: 'en',
    dir: 'ltr',
    title: 'Fortune Construction Website and Dashboard User Guide',
    subtitle: 'Daily operating catalog for website and dashboard staff',
    source: resolve(root, 'docs/handover/fortune-construction-handover-guide-en.md'),
    html: resolve(tmpDir, 'fortune-construction-user-guide-en.html'),
    pdf: resolve(outDir, 'fortune-construction-website-dashboard-user-guide-en.pdf'),
  },
  {
    lang: 'ar',
    dir: 'rtl',
    title: 'كتالوج استخدام موقع ولوحة تحكم Fortune Construction',
    subtitle: 'دليل تشغيل يومي لموظفي الموقع ولوحة التحكم',
    source: resolve(root, 'docs/handover/fortune-construction-handover-guide-ar.md'),
    html: resolve(tmpDir, 'fortune-construction-user-guide-ar.html'),
    pdf: resolve(outDir, 'fortune-construction-website-dashboard-user-guide-ar.pdf'),
  },
]

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/)
  const html = []
  let i = 0

  function closeParagraph(paragraph) {
    if (paragraph.length) {
      html.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`)
      paragraph.length = 0
    }
  }

  const paragraph = []
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      closeParagraph(paragraph)
      i += 1
      continue
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/)
    if (heading) {
      closeParagraph(paragraph)
      const level = heading[1].length
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`)
      i += 1
      continue
    }

    if (trimmed.startsWith('|')) {
      closeParagraph(paragraph)
      const tableLines = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim())
        i += 1
      }
      const rows = tableLines
        .filter((row, index) => index !== 1 || !/^\|\s*:?-{3,}/.test(row))
        .map((row) => row.slice(1, -1).split('|').map((cell) => cell.trim()))
      const [head = [], ...body] = rows
      html.push('<div class="table-wrap"><table>')
      html.push(`<thead><tr>${head.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join('')}</tr></thead>`)
      html.push(`<tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join('')}</tr>`).join('')}</tbody>`)
      html.push('</table></div>')
      continue
    }

    if (/^- \[ \]\s+/.test(trimmed)) {
      closeParagraph(paragraph)
      html.push('<ul class="checklist">')
      while (i < lines.length && /^- \[ \]\s+/.test(lines[i].trim())) {
        const item = lines[i].trim().replace(/^- \[ \]\s+/, '')
        html.push(`<li><span class="box"></span><span>${inlineMarkdown(item)}</span></li>`)
        i += 1
      }
      html.push('</ul>')
      continue
    }

    if (/^-\s+/.test(trimmed)) {
      closeParagraph(paragraph)
      html.push('<ul>')
      while (i < lines.length && /^-\s+/.test(lines[i].trim())) {
        const item = lines[i].trim().replace(/^-\s+/, '')
        html.push(`<li>${inlineMarkdown(item)}</li>`)
        i += 1
      }
      html.push('</ul>')
      continue
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      closeParagraph(paragraph)
      html.push('<ol>')
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const item = lines[i].trim().replace(/^\d+\.\s+/, '')
        html.push(`<li>${inlineMarkdown(item)}</li>`)
        i += 1
      }
      html.push('</ol>')
      continue
    }

    paragraph.push(trimmed)
    i += 1
  }

  closeParagraph(paragraph)
  return html.join('\n')
}

function buildHtml(doc, body) {
  const rtl = doc.dir === 'rtl'
  return `<!doctype html>
<html lang="${doc.lang}" dir="${doc.dir}">
<head>
<meta charset="utf-8">
<title>${escapeHtml(doc.title)}</title>
<style>
  @page { size: A4; margin: 18mm 14mm 18mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    color: #172033;
    background: #ffffff;
    font-family: ${rtl ? "'SF Arabic', 'Geeza Pro', 'Al Nile', Arial, sans-serif" : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"};
    font-size: ${rtl ? '12.3pt' : '11.4pt'};
    line-height: 1.62;
  }
  .cover {
    min-height: 225mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 18mm 15mm;
    color: #fff;
    background:
      radial-gradient(circle at 18% 16%, rgba(45, 212, 191, .34), transparent 28%),
      linear-gradient(135deg, #0f172a 0%, #123540 52%, #0f766e 100%);
    page-break-after: always;
  }
  .brand { font-size: 12pt; text-transform: uppercase; letter-spacing: .14em; color: #a7f3d0; font-weight: 800; }
  .cover h1 { margin: 32mm 0 8mm; color: #fff; font-size: ${rtl ? '35pt' : '38pt'}; line-height: 1.08; letter-spacing: 0; max-width: 160mm; }
  .cover .subtitle { max-width: 135mm; font-size: 16pt; color: #d1fae5; }
  .meta {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4mm;
    margin-top: 18mm;
  }
  .meta div {
    padding: 5mm;
    border: 1px solid rgba(255,255,255,.22);
    border-radius: 8px;
    background: rgba(255,255,255,.08);
  }
  .meta strong { display: block; color: #fff; font-size: 10pt; }
  .meta span { color: #ccfbf1; font-size: 9.5pt; }
  main { padding: 0 1mm; }
  main h1 { display: none; }
  h2 {
    margin: 10mm 0 4mm;
    padding-bottom: 2mm;
    color: #0f766e;
    font-size: ${rtl ? '22pt' : '20pt'};
    line-height: 1.15;
    border-bottom: 2px solid #ccfbf1;
    break-after: avoid;
  }
  h3 {
    margin: 7mm 0 2.5mm;
    color: #334155;
    font-size: ${rtl ? '15.5pt' : '14.5pt'};
    line-height: 1.25;
    break-after: avoid;
  }
  p { margin: 0 0 3.5mm; }
  strong { color: #0f172a; }
  code {
    padding: 1px 4px;
    border-radius: 4px;
    background: #f1f5f9;
    color: #0f766e;
    font-family: inherit;
  }
  ul, ol { margin: 0 0 4mm; padding-${rtl ? 'right' : 'left'}: 6mm; }
  li { margin: 1.2mm 0; }
  li::marker { color: #0f766e; font-weight: 700; }
  .table-wrap {
    margin: 4mm 0 7mm;
    border: 1px solid #dbe7e5;
    border-radius: 8px;
    overflow: hidden;
    break-inside: avoid;
    box-shadow: 0 6px 18px rgba(15, 23, 42, .06);
  }
  table { width: 100%; border-collapse: collapse; font-size: ${rtl ? '9.5pt' : '8.8pt'}; line-height: 1.42; }
  th {
    background: #0f766e;
    color: white;
    text-align: ${rtl ? 'right' : 'left'};
    padding: 3mm 2.4mm;
    font-weight: 800;
  }
  td {
    vertical-align: top;
    padding: 2.5mm 2.4mm;
    border-top: 1px solid #e2e8f0;
  }
  tr:nth-child(even) td { background: #f8fafc; }
  .checklist { list-style: none; padding: 0; }
  .checklist li { display: flex; gap: 2mm; align-items: flex-start; margin: 2mm 0; }
  .box { width: 4.2mm; height: 4.2mm; border: 1.4px solid #0f766e; border-radius: 3px; flex: 0 0 auto; margin-top: 1mm; }
  html[dir="rtl"] .checklist li { flex-direction: row-reverse; justify-content: flex-end; }
  main > p:nth-of-type(-n+3) {
    padding: 3.5mm 4mm;
    border-${rtl ? 'right' : 'left'}: 4px solid #14b8a6;
    border-radius: 7px;
    background: #f0fdfa;
  }
  .footer {
    position: fixed;
    bottom: 6mm;
    left: 14mm;
    right: 14mm;
    color: #64748b;
    font-size: 8.5pt;
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #e2e8f0;
    padding-top: 2mm;
  }
</style>
</head>
<body>
  <section class="cover">
    <div>
      <div class="brand">Fortune Construction</div>
      <h1>${escapeHtml(doc.title)}</h1>
      <div class="subtitle">${escapeHtml(doc.subtitle)}</div>
    </div>
    <div class="meta">
      <div><strong>${rtl ? 'اللغة' : 'Language'}</strong><span>${rtl ? 'العربية' : 'English'}</span></div>
      <div><strong>${rtl ? 'الجمهور' : 'Audience'}</strong><span>${rtl ? 'موظفو التشغيل اليومي' : 'Daily operations staff'}</span></div>
      <div><strong>${rtl ? 'آخر مراجعة' : 'Last reviewed'}</strong><span>2026-07-29</span></div>
    </div>
  </section>
  <main>${body}</main>
  <div class="footer"><span>Fortune Construction</span><span>${rtl ? 'كتالوج استخدام الموقع ولوحة التحكم' : 'Website and Dashboard User Guide'}</span></div>
</body>
</html>`
}

for (const doc of docs) {
  const markdown = readFileSync(doc.source, 'utf8')
  const html = buildHtml(doc, renderMarkdown(markdown))
  writeFileSync(doc.html, html)
  console.log(`Wrote ${doc.html}`)

  if (process.argv.includes('--html-only')) {
    continue
  }

  const result = spawnSync(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--print-to-pdf=${doc.pdf}`,
    '--no-pdf-header-footer',
    `file://${doc.html}`,
  ], { encoding: 'utf8' })

  if (result.status !== 0) {
    console.error(result.stderr || result.stdout)
    process.exit(result.status || 1)
  }

  console.log(`Wrote ${doc.pdf}`)
}
