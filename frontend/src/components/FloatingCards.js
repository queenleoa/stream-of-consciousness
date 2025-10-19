import FloatingCard from "./FloatingCard";
import { leftBankCards, rightBankCards } from "../data/cardData";

export default function FloatingCards({ onCardClick }) {
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
          onCardClick={() => onCardClick(card)}
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
          onCardClick={() => onCardClick(card)}
        />
      ))}
    </>
  );
}