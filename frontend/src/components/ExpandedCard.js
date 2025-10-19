import { useEffect } from 'react';
import './ExpandedCard.css';

export default function ExpandedCard({ card, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!card) return null;

  const renderContent = () => {
    const { type, fullContent } = card;

    switch (type) {
      case 'summary':
        return (
          <div className="expanded-content">
            <div className="summary-section">
              <p className="summary-text">{fullContent.summary}</p>
            </div>
            <div className="details-section">
              <h3>Key Details</h3>
              <ul>
                {fullContent.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'appendix':
        return (
          <div className="expanded-content">
            <div className="appendix-section">
              {fullContent.appendix.map((item, idx) => (
                <div key={idx} className="appendix-item">
                  <div className="appendix-label">
                    {item.label || item.platform || item.title || item.type}
                  </div>
                  <div className="appendix-value">
                    {item.link && (
                      <a 
                        href={`https://${item.link}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: card.color }}
                      >
                        {item.link}
                      </a>
                    )}
                    {item.price && <span>{item.price}</span>}
                    {item.followers && <span>{item.followers} followers</span>}
                  </div>
                  {item.date && (
                    <div className="appendix-date">{item.date}</div>
                  )}
                  {(item.from || item.to) && (
                    <div className="transaction-details">
                      {item.from && <div>From: {item.from}</div>}
                      {item.to && <div>To: {item.to}</div>}
                    </div>
                  )}
                  {item.artist && (
                    <div className="appendix-meta">
                      {item.artist} • {item.year}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'action':
        return (
          <div className="expanded-content action-content">
            <p className="action-description">{fullContent.description}</p>
            <textarea 
              placeholder="Write your thoughts about this artwork..."
              className="comment-input"
              rows={6}
            />
            <button 
              className="mint-button"
              style={{ 
                background: `linear-gradient(135deg, ${card.color}40, ${card.color}80)`,
                borderColor: card.color,
                boxShadow: `0 0 20px ${card.color}60`
              }}
            >
              {fullContent.buttonText}
            </button>
            <p className="action-note">
              Your comment will be permanently stored on-chain
            </p>
          </div>
        );

      case 'list':
        return (
          <div className="expanded-content">
            <div className="notes-section">
              {fullContent.notes.map((note, idx) => (
                <div key={idx} className="note-item">
                  <div className="note-header">
                    <span className="note-author" style={{ color: card.color }}>
                      {note.author}
                    </span>
                    <span className="note-date">{note.date}</span>
                  </div>
                  <p className="note-comment">{note.comment}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="expanded-content">
            <div className="social-section">
              {fullContent.posts.map((post, idx) => (
                <div key={idx} className="social-post">
                  <div className="post-header">
                    <span className="post-platform" style={{ color: card.color }}>
                      {post.platform}
                    </span>
                    <span className="post-author">{post.author}</span>
                  </div>
                  <p className="post-text">{post.text}</p>
                  <div className="post-footer">
                    <span className="post-likes">❤️ {post.likes}</span>
                    <span className="post-date">{post.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <p>Content type not recognized</p>;
    }
  };

  return (
    <div className="expanded-card-overlay" onClick={onClose}>
      <div 
        className="expanded-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          borderColor: card.color,
          boxShadow: `0 0 60px ${card.color}60, inset 0 0 40px ${card.color}20`
        }}
      >
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        
        <div className="expanded-header">
          <h2 style={{ color: card.color, textShadow: `0 0 20px ${card.color}` }}>
            {card.title}
          </h2>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}