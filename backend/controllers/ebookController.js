/*const Ebook = require('../models/Ebook');

// Create new eBook
exports.createEbook = async (req, res) => {
  try {
    const { title, topic, language, tone, totalChapters, tableOfContents } = req.body;
    const ebook = await Ebook.create({
      user: req.user._id, title, topic, language, tone, totalChapters, tableOfContents
    });
    res.status(201).json(ebook);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get all eBooks for logged-in user
exports.getEbooks = async (req, res) => {
  try {
    const ebooks = await Ebook.find({ user: req.user._id }).sort('-createdAt');
    res.json(ebooks);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get single eBook
exports.getEbook = async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id);
    if (!ebook) return res.status(404).json({ message: 'Not found' });
    res.json(ebook);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Update chapter content
exports.updateChapter = async (req, res) => {
  try {
    const { chapterNumber, title, content } = req.body;
    const ebook = await Ebook.findById(req.params.id);
    const idx = ebook.chapters.findIndex(c => c.chapterNumber === chapterNumber);
    if (idx > -1) {
      ebook.chapters[idx] = { chapterNumber, title, content };
    } else {
      ebook.chapters.push({ chapterNumber, title, content });
    }
    await ebook.save();
    res.json(ebook);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Delete eBook
exports.deleteEbook = async (req, res) => {
  try {
    await Ebook.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Export as PDF
exports.exportPDF = async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id);
    let html = `<html><body style='font-family:Arial;padding:40px;max-width:800px;margin:auto;'>`;
    html += `<h1 style='text-align:center;color:#1F4E79;'>${ebook.title}</h1>`;
    html += `<p style='text-align:center;color:#888;'>Topic: ${ebook.topic} | Tone: ${ebook.tone}</p><hr/>`;
    ebook.chapters.forEach(ch => {
      html += `<h2 style='color:#2E75B6;'> ${ch.chapterNumber}: ${ch.title}</h2>`;
      html += `<p style='line-height:1.8;'>${ch.content}</p><hr/>`;
    });
    html += `</body></html>`;

    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
    });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${ebook.title}.pdf"`
    });
    res.send(pdf);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
*/

/*const Ebook = require('../models/Ebook');
const path = require('path');
const fs = require('fs');

// Create new eBook (supports multipart with optional cover image)
exports.createEbook = async (req, res) => {
  try {
    let { title, topic, language, tone, totalChapters, tableOfContents } = req.body;

    // tableOfContents may come as JSON string from FormData
    if (typeof tableOfContents === 'string') {
      tableOfContents = JSON.parse(tableOfContents);
    }

    const ebookData = {
      user: req.user._id, title, topic, language, tone,
      totalChapters: Number(totalChapters), tableOfContents
    };

    if (req.file) {
      ebookData.coverImage = `/uploads/${req.file.filename}`;
    }

    const ebook = await Ebook.create(ebookData);
    res.status(201).json(ebook);
  } catch (err) {
    console.error('Create ebook error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// Get all eBooks for logged-in user
exports.getEbooks = async (req, res) => {
  try {
    const ebooks = await Ebook.find({ user: req.user._id }).sort('-createdAt');
    res.json(ebooks);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get single eBook
exports.getEbook = async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id);
    if (!ebook) return res.status(404).json({ message: 'Not found' });
    res.json(ebook);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Update chapter content
exports.updateChapter = async (req, res) => {
  try {
    const { chapterNumber, title, content } = req.body;
    const ebook = await Ebook.findById(req.params.id);
    const idx = ebook.chapters.findIndex(c => c.chapterNumber === chapterNumber);
    if (idx > -1) {
      ebook.chapters[idx] = { chapterNumber, title, content };
    } else {
      ebook.chapters.push({ chapterNumber, title, content });
    }
    await ebook.save();
    res.json(ebook);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Delete eBook
exports.deleteEbook = async (req, res) => {
  try {
    await Ebook.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Helper: strip HTML tags and decode entities for plain text
function htmlToPlainText(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

// Export as PDF using Puppeteer
exports.exportPDF = async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id);
    if (!ebook) return res.status(404).json({ message: 'Not found' });

    let coverHtml = '';
    if (ebook.coverImage) {
      const imgPath = path.join(__dirname, '..', 'public', ebook.coverImage);
      if (fs.existsSync(imgPath)) {
        const imgData = fs.readFileSync(imgPath);
        const ext = path.extname(ebook.coverImage).slice(1) || 'jpeg';
        const base64 = imgData.toString('base64');
        coverHtml = `
          <div style="page-break-after:always; width:100%; height:100vh; display:flex; align-items:center; justify-content:center; background:#1a1a2e;">
            <img src="data:image/${ext};base64,${base64}" style="max-width:100%; max-height:100vh; object-fit:contain;" />
          </div>`;
      }
    }

    let chaptersHtml = '';
    ebook.chapters
      .sort((a, b) => a.chapterNumber - b.chapterNumber)
      .forEach(ch => {
        // Preserve the HTML content as-is (bold, italic, highlights etc.)
        chaptersHtml += `
          <div style="page-break-before:always; padding: 0 0 40px 0;">
            <h2 style="color:#2E75B6; font-size:24px; font-family:Arial,sans-serif; border-bottom:2px solid #e0e0e0; padding-bottom:10px; margin-bottom:20px;">
              Chapter ${ch.chapterNumber}: ${ch.title || ''}
            </h2>
            <div style="font-family:Georgia,serif; font-size:16px; line-height:1.9; color:#1a1a1a;">
              ${ch.content || ''}
            </div>
          </div>`;
      });

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Georgia', serif; background: #fff; color: #1a1a1a; }
  @page { margin: 20mm 15mm; }
  p { margin-bottom: 14px; }
  h1, h2, h3 { font-family: Arial, sans-serif; }
  mark { padding: 1px 2px; border-radius: 2px; }
</style>
</head>
<body>
  ${coverHtml}
  <!-- Title Page -->
  <div style="page-break-after:always; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; text-align:center; padding:40px;">
    <h1 style="font-size:36px; color:#1F4E79; margin-bottom:16px; font-family:Arial,sans-serif;">${ebook.title}</h1>
    <p style="color:#555; font-size:16px; margin-bottom:8px;">Topic: ${ebook.topic}</p>
    <p style="color:#888; font-size:14px;">Tone: ${ebook.tone} &nbsp;|&nbsp; Language: ${ebook.language}</p>
    <div style="margin-top:40px; width:60px; height:3px; background:#2E75B6; border-radius:2px;"></div>
  </div>
  ${chaptersHtml}
</body>
</html>`;

    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      printBackground: true
    });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(ebook.title)}.pdf"`
    });
    res.send(pdf);
  } catch (err) {
    console.error('PDF export error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// Export as DOCX
exports.exportDOCX = async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id);
    if (!ebook) return res.status(404).json({ message: 'Not found' });

    const {
      Document, Packer, Paragraph, TextRun, HeadingLevel,
      AlignmentType, PageBreak, ImageRun
    } = require('docx');

    const sections = [];
    const firstSectionChildren = [];

    // Cover image as first page
    if (ebook.coverImage) {
      const imgPath = path.join(__dirname, '..', 'public', ebook.coverImage);
      if (fs.existsSync(imgPath)) {
        const imgBuffer = fs.readFileSync(imgPath);
        const ext = path.extname(ebook.coverImage).toLowerCase().slice(1);
        const typeMap = { jpg: 'jpg', jpeg: 'jpg', png: 'png', gif: 'gif', webp: 'png' };
        const imgType = typeMap[ext] || 'png';
        firstSectionChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: imgBuffer,
                transformation: { width: 480, height: 640 },
                type: imgType
              })
            ],
            spacing: { after: 0 }
          }),
          new Paragraph({ children: [new PageBreak()] })
        );
      }
    }

    // Title page
    firstSectionChildren.push(
      new Paragraph({
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { before: 2400, after: 400 },
        children: [new TextRun({ text: ebook.title, bold: true, size: 56, color: '1F4E79', font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: `Topic: ${ebook.topic}`, size: 26, color: '555555', font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: `Tone: ${ebook.tone}  |  Language: ${ebook.language}`, size: 22, color: '888888', font: 'Arial' })]
      }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // Chapters
    const sortedChapters = [...ebook.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
    for (const ch of sortedChapters) {
      // Chapter heading
      firstSectionChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 480, after: 240 },
          children: [new TextRun({
            text: `Chapter ${ch.chapterNumber}: ${ch.title || ''}`,
            bold: true, size: 36, color: '2E75B6', font: 'Arial'
          })]
        })
      );

      // Parse HTML content into docx paragraphs
      const plainContent = htmlToPlainText(ch.content || '');
      const paragraphs = plainContent.split('\n\n').filter(p => p.trim());

      for (const para of paragraphs) {
        const lines = para.split('\n');
        const runs = [];
        for (let li = 0; li < lines.length; li++) {
          runs.push(new TextRun({
            text: lines[li],
            size: 24, font: 'Georgia', break: li > 0 ? 1 : 0
          }));
        }
        if (runs.length) {
          firstSectionChildren.push(
            new Paragraph({
              children: runs,
              spacing: { before: 0, after: 240 },
              style: 'Normal'
            })
          );
        }
      }

      // Page break after each chapter (except last)
      if (ch.chapterNumber < sortedChapters[sortedChapters.length - 1].chapterNumber) {
        firstSectionChildren.push(new Paragraph({ children: [new PageBreak()] }));
      }
    }

    sections.push({
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: firstSectionChildren
    });

    const doc = new Document({
      styles: {
        default: {
          document: { run: { font: 'Georgia', size: 24 } }
        },
        paragraphStyles: [
          {
            id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
            run: { size: 36, bold: true, font: 'Arial', color: '2E75B6' },
            paragraph: { spacing: { before: 480, after: 240 }, outlineLevel: 0 }
          }
        ]
      },
      sections
    });

    const buffer = await Packer.toBuffer(doc);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(ebook.title)}.docx"`
    });
    res.send(buffer);
  } catch (err) {
    console.error('DOCX export error:', err.message);
    res.status(500).json({ message: err.message });
  }
};
*/


const Ebook = require('../models/Ebook');
const path  = require('path');
const fs    = require('fs');

// ─────────────────────────────────────────────
//  MARKDOWN → HTML  (for PDF via Puppeteer)
// ─────────────────────────────────────────────
// Handles: **bold**, _italic_, __underline__, ==highlight==,
//          ## headings, blank-line paragraphs, single-line breaks
function markdownToHtml(text) {
  if (!text) return '';

  const lines = text.split('\n');
  const htmlLines = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Heading: ## Title
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length + 1; // ## → h3
      htmlLines.push(`<h${level}>${inlineMarkdown(headingMatch[2])}</h${level}>`);
      i++;
      continue;
    }

    // Blank line → paragraph separator (collected below)
    if (line.trim() === '') {
      htmlLines.push('__BLANK__');
      i++;
      continue;
    }

    // Normal text line
    htmlLines.push(inlineMarkdown(line));
    i++;
  }

  // Group lines into <p> blocks split by __BLANK__
  const raw = htmlLines.join('\n');
  const blocks = raw.split(/\n?__BLANK__\n?/).filter(b => b.trim());

  return blocks.map(block => {
    const trimmed = block.trim();
    // If it's already a heading tag, don't wrap in <p>
    if (/^<h[1-6]>/.test(trimmed)) return trimmed;
    // Replace single \n inside a block with <br>
    return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');
}

// Apply inline markdown (bold, italic, underline, highlight)
function inlineMarkdown(text) {
  return text
    // Must do ==highlight== BEFORE bold so == isn't confused with **
    .replace(/==(.+?)==/g, '<mark style="background:#fef08a;padding:1px 3px;border-radius:2px;">$1</mark>')
    // Bold+italic together: ***text***
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    // Bold: **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic: _text_ (not __ which is underline)
    .replace(/(?<![_])_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>')
    // Underline: __text__
    .replace(/__(.+?)__/g, '<u>$1</u>');
}

// ─────────────────────────────────────────────
//  MARKDOWN → DOCX RUNS  (for Word export)
// ─────────────────────────────────────────────
// Parses a paragraph string into an array of TextRun objects
function parseInlineToRuns(text, { Document, TextRun } = {}) {
  // Tokenise: split on **bold**, _italic_, __underline__, ==highlight==
  const tokens = [];
  // regex captures all inline markers
  const regex = /(\*\*\*[\s\S]+?\*\*\*|\*\*[\s\S]+?\*\*|==[\s\S]+?==|__[\s\S]+?__|(?<![_])_(?!_)[\s\S]+?(?<!_)_(?!_))/g;

  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'plain', text: text.slice(lastIndex, match.index) });
    }
    const raw = match[0];
    if (raw.startsWith('***')) {
      tokens.push({ type: 'bolditalic', text: raw.slice(3, -3) });
    } else if (raw.startsWith('**')) {
      tokens.push({ type: 'bold', text: raw.slice(2, -2) });
    } else if (raw.startsWith('==')) {
      tokens.push({ type: 'highlight', text: raw.slice(2, -2) });
    } else if (raw.startsWith('__')) {
      tokens.push({ type: 'underline', text: raw.slice(2, -2) });
    } else if (raw.startsWith('_')) {
      tokens.push({ type: 'italic', text: raw.slice(1, -1) });
    }
    lastIndex = match.index + raw.length;
  }
  if (lastIndex < text.length) {
    tokens.push({ type: 'plain', text: text.slice(lastIndex) });
  }

  return tokens.map(tok => {
    const base = { text: tok.text, size: 24, font: 'Georgia' };
    switch (tok.type) {
      case 'bold':       return new TextRun({ ...base, bold: true });
      case 'italic':     return new TextRun({ ...base, italics: true });
      case 'bolditalic': return new TextRun({ ...base, bold: true, italics: true });
      case 'underline':  return new TextRun({ ...base, underline: {} });
      case 'highlight':  return new TextRun({ ...base, highlight: 'yellow' });
      default:           return new TextRun(base);
    }
  });
}

// Convert full markdown text → array of docx Paragraph objects
function markdownToDocxParagraphs(text, docxLib) {
  const { Paragraph, TextRun, HeadingLevel } = docxLib;
  if (!text) return [];
  const result = [];
  const blocks = text.split(/\n{2,}/);   // double newline = new paragraph

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Heading
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      const levelMap = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3 };
      const level = levelMap[headingMatch[1].length] || HeadingLevel.HEADING_2;
      result.push(new Paragraph({
        heading: level,
        spacing: { before: 360, after: 180 },
        children: [new TextRun({ text: headingMatch[2], bold: true, size: 32, font: 'Arial', color: '2E75B6' })]
      }));
      continue;
    }

    // Normal paragraph — may have single \n line breaks inside
    const lines = trimmed.split('\n');
    const children = [];
    for (let li = 0; li < lines.length; li++) {
      const runs = parseInlineToRuns(lines[li], docxLib);
      if (li > 0) {
        // Add a line break run before subsequent lines in same paragraph
        children.push(new TextRun({ text: '', break: 1 }));
      }
      children.push(...runs);
    }

    result.push(new Paragraph({
      children,
      spacing: { before: 0, after: 240 }   // 240 twips ≈ one blank line gap
    }));
  }

  return result;
}

// ─────────────────────────────────────────────
//  CRUD
// ─────────────────────────────────────────────
exports.createEbook = async (req, res) => {
  try {
    let { title, topic, language, tone, totalChapters, tableOfContents } = req.body;
    if (typeof tableOfContents === 'string') tableOfContents = JSON.parse(tableOfContents);
    const ebookData = { user: req.user._id, title, topic, language, tone,
      totalChapters: Number(totalChapters), tableOfContents };
    if (req.file) ebookData.coverImage = `/uploads/${req.file.filename}`;
    const ebook = await Ebook.create(ebookData);
    res.status(201).json(ebook);
  } catch (err) { console.error(err); res.status(500).json({ message: err.message }); }
};

exports.getEbooks = async (req, res) => {
  try {
    const ebooks = await Ebook.find({ user: req.user._id }).sort('-createdAt');
    res.json(ebooks);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getEbook = async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id);
    if (!ebook) return res.status(404).json({ message: 'Not found' });
    res.json(ebook);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateChapter = async (req, res) => {
  try {
    const { chapterNumber, title, content } = req.body;
    const ebook = await Ebook.findById(req.params.id);
    const idx = ebook.chapters.findIndex(c => c.chapterNumber === chapterNumber);
    if (idx > -1) ebook.chapters[idx] = { chapterNumber, title, content };
    else ebook.chapters.push({ chapterNumber, title, content });
    await ebook.save();
    res.json(ebook);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteEbook = async (req, res) => {
  try {
    await Ebook.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─────────────────────────────────────────────
//  PDF EXPORT
// ─────────────────────────────────────────────
exports.exportPDF = async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id);
    if (!ebook) return res.status(404).json({ message: 'Not found' });

    // Cover image page
    let coverHtml = '';
    if (ebook.coverImage) {
      const imgPath = path.join(__dirname, '..', 'public', ebook.coverImage);
      if (fs.existsSync(imgPath)) {
        const ext    = path.extname(ebook.coverImage).slice(1) || 'jpeg';
        const base64 = fs.readFileSync(imgPath).toString('base64');
        coverHtml = `
          <div class="cover-page">
            <img src="data:image/${ext};base64,${base64}" style="max-width:100%;max-height:100vh;object-fit:contain;"/>
          </div>`;
      }
    }

    // Chapter pages — convert markdown → HTML
    let chaptersHtml = '';
    ebook.chapters
      .slice()
      .sort((a, b) => a.chapterNumber - b.chapterNumber)
      .forEach(ch => {
        const bodyHtml = markdownToHtml(ch.content || '');
        chaptersHtml += `
          <div class="chapter-page">
            <h2 class="chapter-heading">  ${ch.title || ''}</h2>
            <div class="chapter-body">${bodyHtml}</div>
          </div>`;
      });

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Georgia',serif; background:#fff; color:#1a1a1a; font-size:16px; line-height:1.9; }

  /* Cover page */
  .cover-page {
    page-break-after: always;
    width:100%; height:100vh;
    display:flex; align-items:center; justify-content:center;
    background:#1a1a2e;
  }

  /* Title page */
  .title-page {
    page-break-after: always;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    min-height:100vh; text-align:center; padding:60px 40px;
  }
  .title-page h1 { font-size:38px; color:#1F4E79; font-family:Arial,sans-serif; margin-bottom:20px; }
  .title-page p  { color:#555; font-size:16px; margin-bottom:8px; }
  .title-page .subtitle { color:#888; font-size:14px; }
  .title-page .divider { margin-top:48px; width:60px; height:3px; background:#2E75B6; border-radius:2px; }

  /* Chapter */
  .chapter-page { page-break-before:always; padding:0 0 40px 0; }
  .chapter-heading {
    font-family:Arial,sans-serif;
    font-size:26px;
    color:#2E75B6;
    border-bottom:2px solid #dde4ef;
    padding-bottom:12px;
    margin-bottom:28px;
  }
  .chapter-body { font-family:'Georgia',serif; font-size:16px; line-height:1.9; color:#1a1a1a; }

  /* Paragraphs */
  .chapter-body p {
    margin-bottom:18px;
    text-align:justify;
  }

  /* Headings inside chapters */
  .chapter-body h2 { font-size:20px; color:#1F4E79; margin:28px 0 12px; font-family:Arial,sans-serif; }
  .chapter-body h3 { font-size:18px; color:#2E75B6; margin:22px 0 10px; font-family:Arial,sans-serif; }

  /* Inline formatting */
  strong, b     { font-weight:700; }
  em, i         { font-style:italic; }
  u             { text-decoration:underline; }
  mark          { background:#fef08a; padding:1px 3px; border-radius:2px; }

  @page { margin:22mm 18mm; }
</style>
</head>
<body>
  ${coverHtml}

  <div class="title-page">
    <h1>${ebook.title}</h1>
    <p>Topic: ${ebook.topic}</p>
    <p class="subtitle">Tone: ${ebook.tone} &nbsp;|&nbsp; Language: ${ebook.language}</p>
    <div class="divider"></div>
  </div>

  ${chaptersHtml}
</body>
</html>`;

    const puppeteer = require('puppeteer');
    const browser   = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page      = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '22mm', bottom: '22mm', left: '18mm', right: '18mm' },
      printBackground: true
    });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(ebook.title)}.pdf"`
    });
    res.send(pdf);
  } catch (err) {
    console.error('PDF export error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
//  DOCX EXPORT
// ─────────────────────────────────────────────
exports.exportDOCX = async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id);
    if (!ebook) return res.status(404).json({ message: 'Not found' });

    const docxLib = require('docx');
    const { Document, Packer, Paragraph, TextRun, HeadingLevel,
            AlignmentType, PageBreak, ImageRun } = docxLib;

    const children = [];

    // ── Cover image ──
    if (ebook.coverImage) {
      const imgPath = path.join(__dirname, '..', 'public', ebook.coverImage);
      if (fs.existsSync(imgPath)) {
        const imgBuffer = fs.readFileSync(imgPath);
        const ext = path.extname(ebook.coverImage).toLowerCase().slice(1);
        const typeMap = { jpg:'jpg', jpeg:'jpg', png:'png', gif:'gif', webp:'png' };
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new ImageRun({ data: imgBuffer, transformation: { width:480, height:640 }, type: typeMap[ext] || 'png' })]
          }),
          new Paragraph({ children: [new PageBreak()] })
        );
      }
    }

    // ── Title page ──
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 2880, after: 480 },
        children: [new TextRun({ text: ebook.title, bold:true, size:56, color:'1F4E79', font:'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: `Topic: ${ebook.topic}`, size:26, color:'555555', font:'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: `Tone: ${ebook.tone}  |  Language: ${ebook.language}`, size:22, color:'888888', font:'Arial' })]
      }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // ── Chapters ──
    const sorted = [...ebook.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);

    for (let ci = 0; ci < sorted.length; ci++) {
      const ch = sorted[ci];

      // Chapter heading
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 480, after: 360 },
          children: [new TextRun({
            text: `Chapter ${ch.chapterNumber}: ${ch.title || ''}`,
            bold:true, size:40, color:'2E75B6', font:'Arial'
          })]
        })
      );

      // Content paragraphs — fully parsed with inline formatting
      const paras = markdownToDocxParagraphs(ch.content || '', docxLib);
      children.push(...paras);

      // Page break between chapters (not after last)
      if (ci < sorted.length - 1) {
        children.push(new Paragraph({ children: [new PageBreak()] }));
      }
    }

    const doc = new Document({
      styles: {
        default: { document: { run: { font:'Georgia', size:24 } } },
        paragraphStyles: [
          {
            id:'Heading1', name:'Heading 1', basedOn:'Normal', next:'Normal', quickFormat:true,
            run: { size:40, bold:true, font:'Arial', color:'2E75B6' },
            paragraph: { spacing:{ before:480, after:360 }, outlineLevel:0 }
          },
          {
            id:'Heading2', name:'Heading 2', basedOn:'Normal', next:'Normal', quickFormat:true,
            run: { size:32, bold:true, font:'Arial', color:'1F4E79' },
            paragraph: { spacing:{ before:360, after:180 }, outlineLevel:1 }
          }
        ]
      },
      sections: [{
        properties: {
          page: {
            size: { width:11906, height:16838 },              // A4
            margin: { top:1440, right:1440, bottom:1440, left:1440 }  // 1 inch
          }
        },
        children
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(ebook.title)}.docx"`
    });
    res.send(buffer);
  } catch (err) {
    console.error('DOCX export error:', err.message);
    res.status(500).json({ message: err.message });
  }
};