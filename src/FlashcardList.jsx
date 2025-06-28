import './FlashcardList.css';

export default function FlashcardList({ cards }) {
  if (!cards || cards.length === 0) {
    return <div className="no-cards">No flashcards generated yet.</div>;
  }
  return (
    <div className="flashcard-list">
      {cards.map((card, idx) => (
        <div className="flashcard" key={idx}>
          <div className="flashcard-question">{card.question}</div>
          <div className="flashcard-answer">{card.answer}</div>
        </div>
      ))}
    </div>
  );
} 