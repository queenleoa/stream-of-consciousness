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

  // ---------- Helpers ----------
  const safeArray = (v) => (Array.isArray(v) ? v : []);
  const has = (obj, key) => obj && Object.prototype.hasOwnProperty.call(obj, key);
  const isHttp = (url = '') => /^https?:\/\//i.test(url);
  const normUrl = (url = '') => (isHttp(url) ? url : `https://${url}`);

  const renderKV = (obj) => {
    if (!obj || typeof obj !== 'object') return null;
    return (
      <div className="kv-grid">
        {Object.entries(obj).map(([k, v]) => (
          <div key={k} className="kv-row">
            <div className="kv-key">{humanize(k)}</div>
            <div className="kv-val">{renderValue(v)}</div>
          </div>
        ))}
      </div>
    );
  };

  const humanize = (s = '') =>
    s.replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const renderValue = (v) => {
    if (v == null) return <span className="muted">—</span>;
    if (typeof v === 'string') {
      // auto-link URLs
      return isHttp(v) ? (
        <a href={v} target="_blank" rel="noopener noreferrer">
          {v}
        </a>
      ) : (
        v
      );
    }
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (Array.isArray(v)) {
      return (
        <ul className="inline-list">
          {v.map((item, idx) => (
            <li key={idx}>{renderValue(item)}</li>
          ))}
        </ul>
      );
    }
    // nested object (e.g., featured_quote)
    return (
      <div className="kv-subgrid">
        {Object.entries(v).map(([sk, sv]) => (
          <div key={sk} className="kv-subrow">
            <div className="kv-subkey">{humanize(sk)}</div>
            <div className="kv-subval">{renderValue(sv)}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderLinksMap = (linksObj, accent) => {
    if (!linksObj || typeof linksObj !== 'object') return null;
    const entries = Object.entries(linksObj);
    if (!entries.length) return null;
    return (
      <div className="links-section">
        <h3>Links</h3>
        <ul>
          {entries.map(([label, url]) => (
            <li key={label}>
              <a
                href={normUrl(url)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: accent }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // ---------- Section Renderers ----------
  const PreviewDetailsSection = ({ fullContent }) => {
    if (!has(fullContent, 'previewDetails')) return null;
    return (
      <div className="preview-details-section">
        <h3>Preview Details</h3>
        {renderKV(fullContent.previewDetails)}
      </div>
    );
  };

  const MetaSection = ({ fullContent }) => {
    if (!has(fullContent, 'meta')) return null;
    return (
      <div className="meta-section">
        <h3>Meta</h3>
        {renderKV(fullContent.meta)}
      </div>
    );
  };

  const SummarySection = ({ fullContent }) =>
    fullContent.summary ? (
      <div className="summary-section">
        <p className="summary-text">{fullContent.summary}</p>
      </div>
    ) : null;

  const DetailsSection = ({ fullContent }) => {
    const details = safeArray(fullContent.details);
    if (!details.length) return null;
    return (
      <div className="details-section">
        <h3>Key Details</h3>
        <ul>
          {details.map((detail, idx) => (
            <li key={idx}>{detail}</li>
          ))}
        </ul>
      </div>
    );
  };

  const AppendixSection = ({ fullContent, accent }) => {
    const appendix = safeArray(fullContent.appendix);
    if (!appendix.length) return null;
    return (
      <div className="appendix-section">
        {appendix.map((item, idx) => {
          const label = item.label || item.platform || item.title || item.type || `Item ${idx + 1}`;
          const link = item.url || item.link;
          const price = item.price_eth ?? item.price;
          return (
            <div key={idx} className="appendix-item">
              <div className="appendix-label">{label}</div>
              <div className="appendix-value">
                {link && (
                  <a
                    href={normUrl(link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: accent }}
                  >
                    {link}
                  </a>
                )}
                {price && <span style={{ marginLeft: link ? 8 : 0 }}>{price}{item.price_eth ? ' ETH' : ''}</span>}
                {item.followers && <span style={{ marginLeft: 8 }}>{item.followers} followers</span>}
              </div>
              {item.date && <div className="appendix-date">{item.date}</div>}
              {(item.from || item.to) && (
                <div className="transaction-details">
                  {item.from && <div>From: {item.from}</div>}
                  {item.to && <div>To: {item.to}</div>}
                </div>
              )}
              {item.artist && item.year && (
                <div className="appendix-meta">
                  {item.artist} • {item.year}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const LinksSection = ({ fullContent, accent }) => renderLinksMap(fullContent.links, accent);

  const NotesSection = ({ fullContent, accent }) => {
    const notes = safeArray(fullContent.notes);
    if (!notes.length) return null;
    return (
      <div className="notes-section">
        {notes.map((note, idx) => (
          <div key={idx} className="note-item" style={{ borderLeftColor: accent }}>
            <div className="note-header">
              <span className="note-author" style={{ color: accent }}>
                {note.author || note.label}
              </span>
              <span className="note-date">{note.date}</span>
            </div>
            <p className="note-comment">{note.comment || (Array.isArray(note.items) ? note.items.join(', ') : '')}</p>
          </div>
        ))}
      </div>
    );
  };

  const SocialSection = ({ fullContent, accent }) => {
    const posts = safeArray(fullContent.posts);
    if (!posts.length) return null;
    return (
      <div className="social-section">
        {posts.map((post, idx) => (
          <div key={idx} className="social-post">
            <div className="post-header">
              <span className="post-platform" style={{ color: accent }}>
                {post.platform || 'Social'}
              </span>
              <span className="post-author">{post.author}</span>
            </div>
            <p className="post-text">{post.text}</p>
            <div className="post-footer">
              {post.likes != null && <span className="post-likes">❤️ {post.likes}</span>}
              <span className="post-date">{post.date}</span>
              {post.url && (
                <a href={normUrl(post.url)} target="_blank" rel="noopener noreferrer" className="post-link">
                  Open
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // --------- Flexible content renderer by type (now with previewDetails/meta/links) ---------
  const renderContentByType = () => {
    const { type, fullContent } = card;
    const accent = card.color;

    switch (type) {
      case 'summary':
        return (
          <div className="expanded-content">
            <PreviewDetailsSection fullContent={fullContent} />
            <SummarySection fullContent={fullContent} />
            <DetailsSection fullContent={fullContent} />
            <LinksSection fullContent={fullContent} accent={accent} />
            <AppendixSection fullContent={fullContent} accent={accent} />
            <NotesSection fullContent={fullContent} accent={accent} />
            <SocialSection fullContent={fullContent} accent={accent} />
            <MetaSection fullContent={fullContent} />
          </div>
        );

      case 'appendix':
        return (
          <div className="expanded-content">
            <PreviewDetailsSection fullContent={fullContent} />
            <SummarySection fullContent={fullContent} />
            <DetailsSection fullContent={fullContent} />
            <AppendixSection fullContent={fullContent} accent={accent} />
            <LinksSection fullContent={fullContent} accent={accent} />
            <NotesSection fullContent={fullContent} accent={accent} />
            <SocialSection fullContent={fullContent} accent={accent} />
            <MetaSection fullContent={fullContent} />
          </div>
        );

      case 'action':
        return (
          <div className="expanded-content action-content">
            <PreviewDetailsSection fullContent={fullContent} />
            <p className="action-description">{fullContent.description}</p>
            <textarea
              placeholder="Write your thoughts about this artwork..."
              className="comment-input"
              rows={6}
            />
            <button
              className="mint-button"
              style={{
                background: `linear-gradient(135deg, ${accent}40, ${accent}80)`,
                borderColor: accent,
                boxShadow: `0 0 20px ${accent}60`
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
            <PreviewDetailsSection fullContent={fullContent} />
            <NotesSection fullContent={fullContent} accent={accent} />
            <MetaSection fullContent={fullContent} />
          </div>
        );

      case 'social':
        return (
          <div className="expanded-content">
            <PreviewDetailsSection fullContent={fullContent} />
            <SocialSection fullContent={fullContent} accent={accent} />
            <MetaSection fullContent={fullContent} />
          </div>
        );

      // onchain is structurally like summary + links + meta
      case 'onchain':
        return (
          <div className="expanded-content">
            <PreviewDetailsSection fullContent={fullContent} />
            <SummarySection fullContent={fullContent} />
            <DetailsSection fullContent={fullContent} />
            <LinksSection fullContent={fullContent} accent={accent} />
            <MetaSection fullContent={fullContent} />
          </div>
        );

      default:
        // Fallback: show what exists
        return (
          <div className="expanded-content">
            <PreviewDetailsSection fullContent={fullContent} />
            <SummarySection fullContent={fullContent} />
            <DetailsSection fullContent={fullContent} />
            <AppendixSection fullContent={fullContent} accent={accent} />
            <LinksSection fullContent={fullContent} accent={accent} />
            <NotesSection fullContent={fullContent} accent={accent} />
            <SocialSection fullContent={fullContent} accent={accent} />
            <MetaSection fullContent={fullContent} />
          </div>
        );
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
        <button className="close-button" onClick={onClose}>✕</button>
        <div className="expanded-header">
          <h2 style={{ color: card.color, textShadow: `0 0 20px ${card.color}` }}>
            {card.title}
          </h2>
        </div>
        {renderContentByType()}
      </div>
    </div>
  );
}
