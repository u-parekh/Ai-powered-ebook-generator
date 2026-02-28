const Ebook = require('../models/Ebook');

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
      html += `<h2 style='color:#2E75B6;'>Chapter ${ch.chapterNumber}: ${ch.title}</h2>`;
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
