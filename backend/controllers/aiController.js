const OpenAI = require('openai');

exports.generateTOC = async (req, res) => {
  try {
    const { topic, totalChapters, tone, language } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: 'OpenAI API key is missing in .env file' });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Create a table of contents for an eBook about '${topic}'.
It should have exactly ${totalChapters} chapters.
Writing tone: ${tone}. Language: ${language}.
Return ONLY a JSON array of chapter titles like:
["Chapter 1: Introduction", "Chapter 2: Getting Started"]
Do not include any explanation, markdown, or extra text. Only the JSON array.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500
    });

    const content = response.choices[0].message.content.trim();
    console.log('AI TOC Response:', content);

    let toc;
    try {
      toc = JSON.parse(content);
    } catch {
      // Try to extract JSON array from response
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        toc = JSON.parse(match[0]);
      } else {
        return res.status(500).json({ message: 'AI returned invalid format, try again' });
      }
    }

    res.json({ toc });
  } catch (err) {
    console.error('TOC Generation Error:', err.message);
    if (err.message.includes('API key')) {
      return res.status(500).json({ message: 'Invalid OpenAI API key. Check your .env file' });
    }
    if (err.message.includes('quota')) {
      return res.status(500).json({ message: 'OpenAI quota exceeded. Check your billing' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.generateChapter = async (req, res) => {
  try {
    const { topic, chapterTitle, chapterNumber, tone, language } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: 'OpenAI API key is missing in .env file' });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Write a detailed chapter for an eBook.
Topic: '${topic}'.
Chapter ${chapterNumber}: '${chapterTitle}'.
Tone: ${tone}. Language: ${language}.
Write at least 500 words with clear paragraphs and good structure.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500
    });

    res.json({ content: response.choices[0].message.content });
  } catch (err) {
    console.error('Chapter Generation Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};