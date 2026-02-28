/*const { GoogleGenAI} = require('@google/genai');

exports.generateTOC = async (req, res) => {
  try {
    const { topic, totalChapters, tone, language } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'OpenAI API key is missing in .env file' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `Create a table of contents for an eBook about '${topic}'.
It should have exactly ${totalChapters} chapters.
Writing tone: ${tone}. Language: ${language}.
Return ONLY a JSON array of chapter titles like:
["Chapter 1: Introduction", "Chapter 2: Getting Started"]
Do not include any explanation, markdown, or extra text. Only the JSON array.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
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

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'OpenAI API key is missing in .env file' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `Write a detailed chapter for an eBook.
Topic: '${topic}'.
Chapter ${chapterNumber}: '${chapterTitle}'.
Tone: ${tone}. Language: ${language}.
Write at least 500 words with clear paragraphs and good structure.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500
    });

    res.json({ content: response.choices[0].message.content });
  } catch (err) {
    console.error('Chapter Generation Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};*/

/*const { GoogleGenerativeAI } = require('@google/generative-ai');

const getAI = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateTOC = async (req, res) => {
  try {
    const { topic, totalChapters, tone, language } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Gemini API key is missing in .env file' });
    }

    const genAI = getAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Create a table of contents for an eBook about '${topic}'.
It should have exactly ${totalChapters} chapters.
Writing tone: ${tone}. Language: ${language}.
Return ONLY a JSON array of chapter titles like:
["Chapter 1: Introduction", "Chapter 2: Getting Started"]
Do not include any explanation, markdown, or extra text. Only the JSON array.`;

    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();
    console.log('AI TOC Response:', content);

    let toc;
    try {
      const clean = content.replace(/```json|```/g, '').trim();
      toc = JSON.parse(clean);
    } catch {
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
    res.status(500).json({ message: err.message });
  }
};

exports.generateChapter = async (req, res) => {
  try {
    const { topic, chapterTitle, chapterNumber, tone, language } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Gemini API key is missing in .env file' });
    }

    const genAI = getAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Write a detailed chapter for an eBook.
Topic: '${topic}'.
Chapter ${chapterNumber}: '${chapterTitle}'.
Tone: ${tone}. Language: ${language}.
Write at least 500 words with clear paragraphs and good structure.`;

    const result = await model.generateContent(prompt);
    res.json({ content: result.response.text() });
  } catch (err) {
    console.error('Chapter Generation Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};
*/

/*const { GoogleGenerativeAI } = require('@google/generative-ai');

const getModel = () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model:'gemini-2.5-flash' }); // ✅ correct model
};

exports.generateTOC = async (req, res) => {
  try {
    const { topic, totalChapters, tone, language } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Gemini API key is missing in .env file' });
    }

    const model = getModel();
    const prompt = `Create a table of contents for an eBook about '${topic}'.
It should have exactly ${totalChapters} chapters.
Writing tone: ${tone}. Language: ${language}.
Return ONLY a JSON array of chapter titles like:
["Chapter 1: Introduction", "Chapter 2: Getting Started"]
Do not include any explanation, markdown, or extra text. Only the JSON array.`;

    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();
    console.log('AI TOC Response:', content);

    let toc;
    try {
      const clean = content.replace(/```json|```/g, '').trim();
      toc = JSON.parse(clean);
    } catch {
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
    res.status(500).json({ message: err.message });
  }
};

exports.generateChapter = async (req, res) => {
  try {
    const { topic, chapterTitle, chapterNumber, tone, language } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Gemini API key is missing in .env file' });
    }

    const model = getModel();
    const prompt = `Write a detailed chapter for an eBook.
Topic: '${topic}'.
Chapter ${chapterNumber}: '${chapterTitle}'.
Tone: ${tone}. Language: ${language}.
Write at least 500 words with clear paragraphs. Do NOT use markdown symbols like ** or ##. Write in plain paragraphs only.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('Chapter generated, length:', text.length);
    res.json({ content: text });
  } catch (err) {
    console.error('Chapter Generation Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};
*/

const { GoogleGenerativeAI } = require('@google/generative-ai');

const getModel = () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

exports.generateTOC = async (req, res) => {
  try {
    const { topic, totalChapters, tone, language } = req.body;
    if (!process.env.GEMINI_API_KEY)
      return res.status(500).json({ message: 'Gemini API key is missing in .env file' });

    const model  = getModel();
    const prompt = `Create a table of contents for an eBook about '${topic}'.
It should have exactly ${totalChapters} chapters.
Writing tone: ${tone}. Language: ${language}.
Return ONLY a JSON array of chapter titles like:
["Chapter 1: Introduction", "Chapter 2: Getting Started"]
Do not include any explanation, markdown, or extra text. Only the JSON array.`;

    const result  = await model.generateContent(prompt);
    const content = result.response.text().trim();
    console.log('AI TOC Response:', content);

    let toc;
    try {
      const clean = content.replace(/```json|```/g, '').trim();
      toc = JSON.parse(clean);
    } catch {
      const match = content.match(/\[[\s\S]*\]/);
      if (match) toc = JSON.parse(match[0]);
      else return res.status(500).json({ message: 'AI returned invalid format, try again' });
    }

    res.json({ toc });
  } catch (err) {
    console.error('TOC Generation Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.generateChapter = async (req, res) => {
  try {
    const { topic, chapterTitle, chapterNumber, tone, language } = req.body;
    if (!process.env.GEMINI_API_KEY)
      return res.status(500).json({ message: 'Gemini API key is missing in .env file' });

    const model  = getModel();

    // IMPORTANT: Ask AI to use our formatting markers so they render correctly in PDF/DOCX
    const prompt = `Write a detailed chapter for an eBook.
Topic: '${topic}'.
Chapter ${chapterNumber}: '${chapterTitle}'.
Tone: ${tone}. Language: ${language}.
Write at least 600 words with clear paragraphs.

Formatting rules (use ONLY these markers, nothing else):
- For bold text use: **word**
- For italic text use: _word_
- For section headings use: ## Heading
- Do NOT use any other markdown like bullet points (*), numbered lists, or horizontal rules.
- Separate paragraphs with ONE blank line.
- Do not start with the chapter title again — go straight into the content.`;

    const result = await model.generateContent(prompt);
    const text   = result.response.text();
    console.log('Chapter generated, length:', text.length);
    res.json({ content: text });
  } catch (err) {
    console.error('Chapter Generation Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};