require('dotenv').config();
const express = require('express');
const auth = require('../middleware/auth');
const { Together } = require('together-ai');

const router = express.Router();
const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

const MAX_CHUNK_SIZE = 8000;

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

const validateContent = (content) => {
  if (!content) return 'Missing content';
  if (typeof content !== 'string') return 'Content must be a string';
  if (content.trim().length === 0) return 'Content cannot be empty';
  if (content.length > 20000000) return 'Content is too long. Maximum length is 20,000,000 characters';
  return null;
};

router.post('/generate', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const validationError = validateContent(content);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const isCSVFormat = content.includes('Entry') && content.includes(':');
    const chunks = chunkContent(content, MAX_CHUNK_SIZE);
    let allCards = [];

    for (const chunk of chunks) {
      const prompt = isCSVFormat
        ? `Generate ${Math.min(5, Math.ceil(chunk.length / 1000))} flashcards from the structured data below.
Your response MUST be a valid JSON array containing flashcard objects.
Each object MUST have exactly two fields: "question" and "answer". Both must be strings.

Rules:
1. Output MUST start with '[' and end with ']'
2. Each flashcard MUST follow this format: {"question": "...", "answer": "..."}
3. NO extra text or comments

Content:
"""
${chunk}
"""`

        : `Generate ${Math.min(5, Math.ceil(chunk.length / 1000))} flashcards from the content below.
Your response MUST be a valid JSON array containing flashcard objects.
Each object MUST have exactly two fields: "question" and "answer". Both must be strings.

Rules:
1. Output MUST start with '[' and end with ']'
2. Each flashcard MUST follow this format: {"question": "...", "answer": "..."}
3. NO extra text or comments
4. Questions should test understanding of key concepts
5. Answers should be clear and concise

Content:
"""
${chunk}
"""`;

      const response = await together.chat.completions.create({
        model: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1024
      });

      if (!response?.choices?.[0]?.message?.content) {
        console.warn('Invalid or empty AI response');
        continue;
      }

      const text = response.choices[0].message.content.trim();
      console.log('Raw AI response:', text);

      const match = text.match(/\[\s*{[\s\S]*?}\s*\]/g);
      if (!match || match.length === 0) {
        console.warn('No valid JSON array pattern found in chunk response');
        console.log('Text content:', text);
        continue;
      }

      console.log('Extracted JSON string:', match[0]);

      try {
        const cleanedJson = match[0]
          .replace(/\\n/g, '\n')
          .replace(/\\'/g, "'")
          .replace(/\\(?=[^"\\])/g, '');

        const chunkCards = JSON.parse(cleanedJson);

        const validCards = chunkCards.filter(card => {
          return (
            card &&
            typeof card === 'object' &&
            typeof card.question === 'string' &&
            typeof card.answer === 'string' &&
            card.question.trim().length > 0 &&
            card.answer.trim().length > 0
          );
        });

        allCards = [...allCards, ...validCards];
      } catch (err) {
        console.warn('Failed to parse flashcards from chunk:', err);
      }
    }

    if (allCards.length === 0) {
      return res.status(500).json({
        error: 'No flashcards were generated. Please provide some content to generate flashcards.'
      });
    }

    try {
      if (!Array.isArray(allCards)) {
        throw new Error('Final result is not an array');
      }

      const validatedCards = allCards.filter(card => {
        return (
          card &&
          typeof card === 'object' &&
          typeof card.question === 'string' &&
          typeof card.answer === 'string' &&
          card.question.trim().length > 0 &&
          card.answer.trim().length > 0
        );
      });

      const serializedCards = JSON.stringify(validatedCards);
      JSON.parse(serializedCards);

      return res.json({ cards: validatedCards });
    } catch (error) {
      console.error('Final validation failed:', error);
      return res.status(500).json({
        error: 'Failed to generate valid flashcards',
        details: error.message
      });
    }

  } catch (err) {
    console.error('Error in flashcard generation:', err);
    return res.status(500).json({ error: 'An error occurred while generating flashcards.' });
  }
});

module.exports = router;
