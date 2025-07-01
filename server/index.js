require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin'); // Firebase Admin SDK
const rateLimit = require('express-rate-limit');
const flashcardsRouter = require('./routes/flashcards');

// Rate limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

// 🔐 Firebase Admin Initialization
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true,
  maxAge: 86400 // CORS preflight cache time
}));

// Apply rate limiter to all routes
app.use(limiter);
app.use(express.json());

// 👉 Routes
app.use('/api/flashcards', flashcardsRouter);

// 🔧 Global error handler (optional)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  

});
