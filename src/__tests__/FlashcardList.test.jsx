import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FlashcardList from '../FlashcardList';

describe('FlashcardList', () => {
  const mockCards = [
    { question: 'What is React?', answer: 'A JavaScript library for building user interfaces' },
    { question: 'What is Jest?', answer: 'A JavaScript testing framework' }
  ];

  it('renders without crashing', () => {
    render(<FlashcardList cards={mockCards} />);
    expect(screen.getByText('What is React?')).toBeInTheDocument();
  });

  it('displays all cards', () => {
    render(<FlashcardList cards={mockCards} />);
    mockCards.forEach(card => {
      expect(screen.getByText(card.question)).toBeInTheDocument();
    });
  });

  it('flips card on click', () => {
    render(<FlashcardList cards={mockCards} />);
    const firstCard = screen.getByText('What is React?').closest('.flashcard');
    
    // Initial state - should show question
    expect(firstCard).toBeInTheDocument();
    expect(firstCard).not.toHaveClass('flipped');
    
    // Click to flip
    fireEvent.click(firstCard);
    expect(firstCard).toHaveClass('flipped');
    
    // Click again to flip back
    fireEvent.click(firstCard);
    expect(firstCard).not.toHaveClass('flipped');
  });

  it('shows answer when card is flipped', () => {
    render(<FlashcardList cards={mockCards} />);
    const firstCard = screen.getByText('What is React?').closest('.flashcard');
    
    // Click to flip
    fireEvent.click(firstCard);
    expect(screen.getByText('A JavaScript library for building user interfaces')).toBeInTheDocument();
  });

  it('handles empty cards array', () => {
    render(<FlashcardList cards={[]} />);
    expect(screen.queryByTestId('flashcard')).not.toBeInTheDocument();
  });

  it('handles null cards prop', () => {
    render(<FlashcardList cards={null} />);
    expect(screen.queryByTestId('flashcard')).not.toBeInTheDocument();
  });

  it('maintains independent card states', () => {
    render(<FlashcardList cards={mockCards} />);
    const cards = screen.getAllByTestId('flashcard');
    
    // Flip first card
    fireEvent.click(cards[0]);
    expect(cards[0]).toHaveClass('flipped');
    expect(cards[1]).not.toHaveClass('flipped');
    
    // Flip second card
    fireEvent.click(cards[1]);
    expect(cards[0]).toHaveClass('flipped');
    expect(cards[1]).toHaveClass('flipped');
  });

  it('applies correct styling to cards', () => {
    render(<FlashcardList cards={mockCards} />);
    const cardContainer = screen.getByTestId('flashcard-list');
    const cards = screen.getAllByTestId('flashcard');

    expect(cardContainer).toHaveClass('flashcard-list');
    cards.forEach(card => {
      expect(card).toHaveClass('flashcard');
      expect(window.getComputedStyle(card).transition).toBeDefined();
    });
  });
});