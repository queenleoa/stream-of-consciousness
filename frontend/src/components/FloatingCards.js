import { useState } from "react";
import FloatingCard from "./FloatingCard";
import ExpandedCard from "./ExpandedCard";
import { leftBankCards, rightBankCards } from "../data/cardData";

export default function FloatingCards() {
  const [expandedCard, setExpandedCard] = useState(null);

  const handleCardClick = (card) => {
    setExpandedCard(card);
  };

  const handleClose = () => {
    setExpandedCard(null);
  };

  return (
    <>
      {/* Left Bank Cards (On-chain data) */}
      {leftBankCards.map((card, index) => (
        <FloatingCard
          key={card.id}
          position={card.position}
          color={card.color}
          content={{
            title: card.title,
            preview: card.preview,
          }}
          floatOffset={index * 0.5}
          onCardClick={() => handleCardClick(card)}
        />
      ))}

      {/* Right Bank Cards (Off-chain data) */}
      {rightBankCards.map((card, index) => (
        <FloatingCard
          key={card.id}
          position={card.position}
          color={card.color}
          content={{
            title: card.title,
            preview: card.preview,
          }}
          floatOffset={index * 0.7}
          onCardClick={() => handleCardClick(card)}
        />
      ))}

      {/* Expanded Card Modal */}
      {expandedCard && (
        <ExpandedCard card={expandedCard} onClose={handleClose} />
      )}
    </>
  );
}