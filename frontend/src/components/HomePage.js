import { useState, useEffect, useRef } from 'react';
import './HomePage.css';

const USER_ADDRESS = '0xc6d96b91f6a71d7c2aa6ec3a47a548767a672486';

// Helper to shorten addresses
const fmt = (a) => `${a.slice(0, 6)}...${a.slice(-4)}`;

// Dummy MetaMask pill
function WalletPill({ onLoad }) {
  const [connected, setConnected] = useState(false);
  const [addr, setAddr] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onEsc = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onEsc);
    };
  }, []);

  const connect = () => {
    setAddr(USER_ADDRESS);
    setConnected(true);
    setMenuOpen(false);
  };

  return (
    <div className="wallet-wrapper" ref={menuRef}>
      <button className="wallet-pill" onClick={() => setMenuOpen((v) => !v)} aria-haspopup="menu">
        <span className="wallet-fox" aria-hidden>
          ▲
        </span>
        {connected ? fmt(addr) : 'Connect Wallet'}
      </button>

      {menuOpen && (
        <div className="wallet-menu" role="menu">
          {!connected ? (
            <button className="wallet-menu-item" onClick={connect}>
              Connect (mock)
            </button>
          ) : (
            <>
              <div className="wallet-menu-address">{addr}</div>
              <button className="wallet-menu-item" onClick={() => onLoad?.()}>
                Load
              </button>
              <button
                className="wallet-menu-item subtle"
                onClick={() => {
                  setConnected(false);
                  setAddr('');
                  setMenuOpen(false);
                }}
              >
                Disconnect
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Loader
function CollectingStories({ show, onClose }) {
  if (!show) return null;
  return (
    <div className="stories-overlay" onClick={onClose}>
      <div className="stories-card" onClick={(e) => e.stopPropagation()}>
        <div className="stories-spinner" aria-hidden />
        <h2 className="stories-title">collecting stories…</h2>
        <p className="stories-sub">
          On-chain provenance · Off-chain whispers · Threads of history
        </p>
        <button className="stories-cancel" onClick={onClose}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

// New modal before loading
function CreatorContextModal({ show, onSubmit, onClose, address }) {
  const [creatorNote, setCreatorNote] = useState('');

  if (!show) return null;

  const handleSubmit = () => {
    onSubmit(creatorNote); // pass the note up
  };

  return (
    <div className="stories-overlay" onClick={onClose}>
      <div className="stories-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="stories-title">Detected wallet as minter</h2>
        <p className="stories-sub">Add creator context</p>
        <div className="wallet-menu-address" style={{ marginBottom: '12px' }}>
          {address}
        </div>

        <textarea
          placeholder="Write about your artwork, process, or intent…"
          value={creatorNote}
          onChange={(e) => setCreatorNote(e.target.value)}
          style={{
            width: '100%',
            minHeight: '110px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.06)',
            color: '#f3f3fb',
            padding: '10px 12px',
            marginBottom: '18px',
            resize: 'vertical',
          }}
        />

        <button className="wallet-menu-item" onClick={handleSubmit}>Submit</button>
        <button className="stories-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}


export default function HomePage({ onNavigateToStream }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [showContextModal, setShowContextModal] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery || selectedImage) {
      // Show the detected wallet modal first
      setShowContextModal(true);
    }
  };

  const handleContextSubmit = (creatorNote) => {
  // you can persist or send creatorNote here
  console.log('Creator context submitted:', creatorNote);

  setShowContextModal(false);
  setShowLoader(true);

  setTimeout(() => {
    setShowLoader(false);
    onNavigateToStream();
  }, 3000);
};


  return (
    <div className="homepage">
      {/* Top-right wallet */}
      <div className="topbar">
        <WalletPill onLoad={() => setShowLoader(true)} />
      </div>

      <div className="wavy-background"></div>

      <div className="homepage-content">
        <div className="left-column">
          <div className="title-section">
            <h1 className="main-title">stream-of-consciousness</h1>
            <p className="subtitle">
              Immerse yourself in the on-chain and off-chain stories of any artwork
            </p>
          </div>

          <div className="search-section">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search for ID, title, or image..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />

                <label className="image-upload-button">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2" />
                    <polyline points="21 15 16 10 5 21" strokeWidth="2" />
                  </svg>
                  {imagePreview && <span className="image-indicator">✓</span>}
                </label>

                <button type="submit" className="search-button">
                  Search
                </button>
              </div>

              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Upload preview" />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="remove-image"
                  >
                    ✕
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="right-column">
          <div className="about-section">
            <h2>About</h2>
            <p>
              <strong>
                stream-of-consciousness: An immersive metaverse art discovery engine curating
                off-chain and on-chain stories of every artwork ever created.
              </strong>
            </p>
            <p>
              Every artwork deserves comprehensive curation. Navigate through a river of information,
              discovering on-chain provenance and off-chain context that traditional platforms miss and
              get credited for contributions to awakening artworks.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreatorContextModal
        show={showContextModal}
        address={USER_ADDRESS}
        onSubmit={handleContextSubmit}
        onClose={() => setShowContextModal(false)}
      />
      <CollectingStories show={showLoader} onClose={() => setShowLoader(false)} />
    </div>
  );
}
