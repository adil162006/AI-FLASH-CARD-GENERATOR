import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FlashcardGenerator from '../FlashcardGenerator';
import { vi } from 'vitest';

describe('FlashcardGenerator', () => {
  const mockUser = {
    getIdToken: vi.fn(() => Promise.resolve('mock-token'))
  };

  const mockOnAuthRequired = vi.fn();
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders without crashing', () => {
    render(
      <FlashcardGenerator
        user={mockUser}
        onAuthRequired={mockOnAuthRequired}
        onLogout={mockOnLogout}
      />
    );
    expect(screen.getByText('Flashcard Generator')).toBeInTheDocument();
  });

  it('shows login button when user is not authenticated', () => {
    render(
      <FlashcardGenerator
        user={null}
        onAuthRequired={mockOnAuthRequired}
        onLogout={mockOnLogout}
      />
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('shows logout button when user is authenticated', () => {
    render(
      <FlashcardGenerator
        user={mockUser}
        onAuthRequired={mockOnAuthRequired}
        onLogout={mockOnLogout}
      />
    );
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('validates empty input', async () => {
    render(
      <FlashcardGenerator
        user={mockUser}
        onAuthRequired={mockOnAuthRequired}
        onLogout={mockOnLogout}
      />
    );

    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter some text or upload a file')).toBeInTheDocument();
    });
  });

  it('handles file upload correctly', async () => {
    render(
      <FlashcardGenerator
        user={mockUser}
        onAuthRequired={mockOnAuthRequired}
        onLogout={mockOnLogout}
      />
    );

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/upload/i);

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByDisplayValue('test content')).toBeInTheDocument();
    });
  });

  it('generates flashcards successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        cards: [
          { question: 'Test Question', answer: 'Test Answer' }
        ]
      })
    });

    render(
      <FlashcardGenerator
        user={mockUser}
        onAuthRequired={mockOnAuthRequired}
        onLogout={mockOnLogout}
      />
    );

    const textarea = screen.getByPlaceholderText(/enter your text/i);
    fireEvent.change(textarea, { target: { value: 'Test content' } });

    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/flashcards/generate',
        expect.any(Object)
      );
    });
  });

  it('handles API errors gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('API Error'));

    render(
      <FlashcardGenerator
        user={mockUser}
        onAuthRequired={mockOnAuthRequired}
        onLogout={mockOnLogout}
      />
    );

    const textarea = screen.getByPlaceholderText(/enter your text/i);
    fireEvent.change(textarea, { target: { value: 'Test content' } });

    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });
}));