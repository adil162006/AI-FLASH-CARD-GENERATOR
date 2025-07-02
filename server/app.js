require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
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
const allowedOrigins = [
  'https://ai-flash-card-generator-xi.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  },
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

// ✅ Default route
app.get('/', (req, res) => {
  res.send('Flashcard Generator Backend is running.');
});

// ✅ Favicon handler
app.get('/favicon.ico', (req, res) => res.status(204).end());

// ❗ Enhanced Global error handler
app.use((err, req, res, next) => {
  const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  console.error(`Error ID: ${errorId}`, {
    error: err,
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    body: req.body,
    headers: req.headers,
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation Error', message: err.message, errorId });
  }

  if (err.name === 'AuthenticationError' || err.message.includes('auth')) {
    return res.status(401).json({ error: 'Authentication Error', message: 'Invalid or expired authentication', errorId });
  }

  if (err.code === 'LIMIT_EXCEEDED') {
    return res.status(429).json({ error: 'Rate Limit Exceeded', message: 'Too many requests. Please try again later.', errorId });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    errorId,
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
