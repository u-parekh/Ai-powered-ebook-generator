const mongoose = require('mongoose');

const ebookSchema = new mongoose.Schema({
  user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:           { type: String, required: true },
  topic:           { type: String, required: true },
  language:        { type: String, default: 'English' },
  tone:            { type: String, default: 'Formal' },
  totalChapters:   { type: Number, required: true },
  tableOfContents: [String],
  coverImage:      { type: String, default: null }, // path like /uploads/filename.jpg
  chapters: [{
    chapterNumber: Number,
    title:         String,
    content:       String  // stored as HTML (rich text)
  }]
}, { timestamps: true });

module.exports = mongoose.model('Ebook', ebookSchema);
