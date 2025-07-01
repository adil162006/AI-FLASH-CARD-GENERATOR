import './FlashcardList.css';

export default function FlashcardList({ cards }) {
  const handleFlip = (index) => {
    const card = document.querySelector(`[data-index="${index}"]`);
    card.classList.toggle('flipped');
  };

  if (!cards || cards.length === 0) {
    return <div className="no-cards">No flashcards generated yet.</div>;
  }

  return (
    <div className="flashcard-list">
      {cards.map((card, idx) => (
        <div
          className="flashcard"
          key={idx}
          data-index={idx}
          onClick={() => handleFlip(idx)}
        >
          <div className="flashcard-front">{card.question}</div>
          <div className="flashcard-back">{card.answer}</div>
        </div>
      ))}
    </div>
  );
}