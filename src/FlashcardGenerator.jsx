import { useState, useRef } from 'react';
import FlashcardList from './FlashcardList';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Set worker from CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function FlashcardGenerator({ user, onLogout, onAuthRequired }) {
  const [notes, setNotes] = useState('');
  const [cards, setCards] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  const validateInput = (text) => {
    if (!text || !text.trim()) {
      return 'Please enter some text or upload a file';
    }
    if (text.length > 20000000) {
      return 'Text is too long. Please keep it under 20,000,000 characters';
    }
    return null;
  };

  const handleGenerate = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }

    const validationError = validateInput(notes);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setCards([]);

    try {
      const token = await user.getIdToken();
      const response = await fetch('http://localhost:5000/api/flashcards/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: `Generate flashcards based only on the following content.
Return the result as a JSON array of objects, each with a "question" and "answer".
Do not include any explanation or extra text.

Content:
"""\n${notes}\n"""
`,
          content: notes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const data = await response.json();
      setCards(data.cards || []);
      setNotes(''); // Clear the text area after successful generation
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const type = file.type;
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const SUPPORTED_TYPES = {
      'text/plain': 'Text',
      'application/pdf': 'PDF',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
      'application/vnd.ms-excel': 'Excel',
      'text/csv': 'CSV',
      'image/png': 'Image',
      'image/jpeg': 'Image',
      'image/webp': 'Image'
    };

    if (!SUPPORTED_TYPES[type]) {
      setError(`Unsupported file type. Supported types: ${Object.values(SUPPORTED_TYPES).join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 5MB limit');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (type === 'text/plain') {
        const text = await file.text();
        setNotes(prev => prev + '\n' + text);

      } else if (type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map(item => item.str).join(' ');
          text += pageText + '\n';
        }
        setNotes(prev => prev + '\n' + text);

      } else if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setNotes(prev => prev + '\n' + result.value);

      } else if (
        type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        type === 'application/vnd.ms-excel' ||
        type === 'text/csv'
      ) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        let text = '';
        
        try {
          workbook.SheetNames.forEach(sheet => {
            const worksheet = workbook.Sheets[sheet];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            if (jsonData.length === 0) {
              throw new Error('No data found in the CSV file');
            }
            
            // Format each row into a readable text
            jsonData.forEach((row, index) => {
              if (Object.keys(row).length === 0) {
                throw new Error('Empty row found in CSV file');
              }
              
              const rowText = Object.entries(row)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');
              text += `Entry ${index + 1}:\n${rowText}\n\n`;
            });
          });
          
          if (!text.trim()) {
            throw new Error('No valid content found in the CSV file');
          }
          
          setNotes(prev => prev + '\n' + text);
        } catch (csvError) {
          throw new Error(`CSV Processing Error: ${csvError.message}`);
        }

      } else if (
        type === 'image/png' ||
        type === 'image/jpeg' ||
        type === 'image/webp'
      ) {
        setNotes(prev => prev + `\n[Image Uploaded: ${file.name}]`);

      } else {
        setError(`Unsupported file type. Supported types: Text, PDF, Word, Excel, CSV, Images`);
      }
    } catch (err) {
      setError(`Failed to process file: ${err.message}`);
    } finally {
      setLoading(false);
    }

    // Fix: reset input so same file can be selected again
    e.target.type = '';
    e.target.type = 'file';
  };



  return (
    <>
      <div className="nav-container">
        <nav className="navbar">
          <h2>Flashcard Generator</h2>
          {user ? (
            <button onClick={onLogout}>Logout</button>
          ) : (
            <button onClick={onAuthRequired}>Login</button>
          )}
        </nav>
      </div>
      <div className="generator-container">
        <div className="input-section">
          <h3>📚 Flashcard Generator</h3>
          <p>Upload your notes or study materials (PDF, DOCX, XLSX, PNG) and generate AI-powered flashcards in seconds.</p>

          <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter your notes here or upload a file (max 20,000,000 characters)"
          className="input-textarea"
          rows="10"
          />
          <div className="button-group">
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".txt,.pdf,.docx,.xlsx,.csv"
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          <button onClick={() => fileInputRef.current.click()}>
            Upload File
          </button>
          <button 
            onClick={handleGenerate}
            disabled={loading || !notes.trim()}
            className="generate-btn"
          >
            {loading ? 'Generating...' : 'Generate Flashcards'}
          </button>
        </div>
        {error && <div className="error">{error}</div>}
        </div>

      </div>
        <FlashcardList cards={cards} />
    </>
  );
}
