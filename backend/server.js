/*require("dotenv").config();
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: '*',
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server working!' });
});

// Auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Ebook routes
const ebookRoutes = require('./routes/ebookRoutes');
app.use('/api/ebooks', ebookRoutes);

// AI routes
const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
*/

// server.js — add these lines if not already present

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const ebookRoutes = require('./routes/ebookRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// ✅ REQUIRED: Serve uploaded cover images as static files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.use('/api/auth',   authRoutes);
app.use('/api/ebooks', ebookRoutes);
app.use('/api/ai',     aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));