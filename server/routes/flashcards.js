require('dotenv').config();
const express = require('express');
const auth = require('../middleware/auth');
const { Together } = require('together-ai');

const router = express.Router();
const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

const MAX_CHUNK_SIZE = 4000; // Safe limit considering max_tokens

function chunkContent(content, maxSize) {
  const words = content.split(' ');
  const chunks = [];
  let currentChunk = [];
  let currentSize = 0;

  for (const word of words) {
    if (currentSize + word.length + 1 > maxSize) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [word];
      currentSize = word.length + 1;
    } else {
      currentChunk.push(word);
      currentSize += word.length + 1;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
}

router.post('/generate', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Missing content' });

    // Check if content contains CSV-like structure
    const isCSVFormat = content.includes('Entry') && content.includes(':');

    // Split content into manageable chunks
    const chunks = chunkContent(content, MAX_CHUNK_SIZE);
    let allCards = [];

    for (const chunk of chunks) {
      const prompt = isCSVFormat ?
        `Create ${Math.min(5, Math.ceil(chunk.length / 1000))} flashcards from this structured data. For each entry, create a question that asks about the relationship between the key-value pairs. Return the flashcards in this JSON format:\n[` :
        `Generate ${Math.min(5, Math.ceil(chunk.length / 1000))} flashcards in JSON format as an array like this:\n[
        {"question": "...", "answer": "..."},
        ...\n      ]\nBased on the following content:\n${chunk}`;

      const response = await together.chat.completions.create({
        model: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1024
      });

      const text = response.choices?.[0]?.message?.content || '';
      try {
        const match = text.match(/\[.*\]/s);
        if (match) {
          const chunkCards = JSON.parse(match[0]);
          allCards = [...allCards, ...chunkCards];
        } else {
          console.warn('No valid JSON array found in chunk response');
        }
      } catch (err) {
        console.warn('Failed to parse flashcards from chunk:', err);
      }
    }

    if (allCards.length === 0) {
      return res.status(500).json({ error: 'Failed to generate any valid flashcards.' });
    }

    return res.json({ cards: allCards });

  } catch (err) {
    console.error('Error in flashcard generation:', err);
    return res.status(500).json({ error: 'An error occurred while generating flashcards.' });
  }
});

module.exports = router;
