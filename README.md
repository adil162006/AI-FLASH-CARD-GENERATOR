# AI-Powered Flashcard Generator

A modern web application that automatically generates study flashcards from your notes, documents, and study materials using AI technology.

## Features

- **AI-Powered Generation**: Automatically creates relevant question-answer pairs from your content
- **Multiple File Support**: Upload and process various file formats:
  - PDF documents
  - Word documents (DOCX)
  - Excel spreadsheets (XLSX)
  - CSV files
  - Plain text files
  - Images (PNG, JPEG, WEBP)
- **Smart Processing**: Handles structured data and free-form text intelligently
- **User Authentication**: Secure access with Firebase authentication
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Real-time Updates**: Instant flashcard generation with smooth animations

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Authentication**: Firebase Auth
- **AI Integration**: Together AI API
- **File Processing**: 
  - PDF.js for PDF processing
  - Mammoth for Word documents
  - XLSX for spreadsheets
- **Testing**: 
  - Vitest for unit and integration testing
  - React Testing Library for component testing
  - Jest DOM for DOM testing utilities

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Together AI API key

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd Flash-card-generator-AI
```

2. Install dependencies for both frontend and backend:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

3. Create a `.env` file in the server directory with your API keys:
```env
TOGETHER_API_KEY=your_together_ai_key
```

4. Set up Firebase:
   - Create a new Firebase project
   - Enable Authentication
   - Add your Firebase config to `src/firebase/config.js`

### Running the Application

1. Start the backend server:
```bash
cd server
npm start
```

2. Start the frontend development server:
```bash
# In the project root
npm run dev
```

3. Open http://localhost:5173 in your browser

### Running Tests

The project includes a comprehensive test suite using Vitest and React Testing Library. Here are the available test commands:

```bash
# Run tests in watch mode
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests with UI
npm run test:ui
```

Test files are located in the `src/__tests__` directory and follow these conventions:
- Unit tests for components
- Integration tests for features
- Error boundary testing
- Form validation testing
- API integration testing

## Usage

1. Log in to your account
2. Upload your study material or paste text directly
3. Click "Generate Flashcards"
4. Review and study your AI-generated flashcards

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Make sure to add tests for any new features and ensure all tests pass before submitting a PR.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
