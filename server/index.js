require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin'); // Firebase Admin SDK
const rateLimit = require('express-rate-limit');
const flashcardsRouter = require('./routes/flashcards');

const app = express();

// 🔐 Firebase Admin Initialization using env vars (Vercel-compatible)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

// 🌐 CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true,
  maxAge: 86400,
}));

// 🚫 Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// 🧠 JSON middleware
app.use(express.json());

// 📦 Routes
app.use('/api/flashcards', flashcardsRouter);

// ❗ Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
