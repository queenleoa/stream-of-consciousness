import { useState } from 'react';
import './HomePage.css';

export default function HomePage({ onNavigateToStream }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement actual search logic
    console.log('Searching for:', searchQuery, 'Image:', selectedImage);
    
    // Navigate to stream (for now, just navigates - later will pass search results)
    if (searchQuery || selectedImage) {
      onNavigateToStream();
    }
  };

  const handleCreateMint = () => {
    // TODO: Open mint modal (we'll implement this later)
    console.log('Create mint clicked');
  };

  return (
    <div className="homepage">
      {/* Wavy Background */}
      <div className="wavy-background"></div>

      {/* Two Column Layout */}
      <div className="homepage-content">
        {/* LEFT COLUMN - Title, Search, Create */}
        <div className="left-column">
          {/* Title */}
          <div className="title-section">
            <h1 className="main-title">stream-of-consciousness</h1>
            <p className="subtitle">Immerse yourself in the on-chain and off-chain stories of any artwork</p>
          </div>

          {/* Search Section */}
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
                
                {/* Image Upload Button */}
                <label className="image-upload-button">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2"/>
                    <polyline points="21 15 16 10 5 21" strokeWidth="2"/>
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

          {/* Create Mint Section */}
          <div className="create-section">
            <p className="create-prompt">Don't know what to search for?</p>
            <button className="create-mint-button" onClick={handleCreateMint}>
              Create Your Own Mint
            </button>
            <p className="create-description">
              Mint your artwork and add it to the stream
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN - About */}
        <div className="right-column">
          <div className="about-section">
            <h2>About</h2>
            <p>
              <strong>stream-of-consciousness</strong> is an immersive journey through the 
              complete history of digital artworks. Every piece of art tells a story—from 
              its minting across multiple chains to its transfer history, from the artist's 
              background to community discourse.
            </p>
            <p>
              We believe every artwork deserves comprehensive documentation. Navigate through 
              a river of information, discovering on-chain provenance and off-chain context 
              that traditional platforms miss.
            </p>
            <p>
              This is art curation reimagined for the multi-chain era. Experience the full 
              narrative of each piece, from creation to collection, all visualized in an 
              atmospheric journey down the river of consciousness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}