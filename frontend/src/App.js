import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import Boat from "./components/Boat";
import River from "./components/River";
import ArtworkOrb from "./components/ArtworkOrb";
import RiverBanks from "./components/RiverBanks";
import Controls from "./components/Controls";
import AudioPlayer from "./components/AudioPlayer";
import FloatingCards from "./components/FloatingCards";
import ExpandedCard from "./components/ExpandedCard";
import CameraController from "./components/CameraController";
import HomePage from "./components/HomePage";
import "./App.css";

export default function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' or 'stream'
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

  const handleCardClick = (card) => {
    setExpandedCard(card);
  };

  const handleClose = () => {
    setExpandedCard(null);
  };

  const navigateToStream = () => {
    setIsTransitioning(true);
    // Wait for fade out animation (800ms) before switching page
    setTimeout(() => {
      setCurrentPage('stream');
      setIsTransitioning(false);
    }, 900);
  };

  const navigateToHome = () => {
    setIsTransitioning(true);
    // Wait for fade out animation before switching page
    setTimeout(() => {
      setCurrentPage('home');
      setExpandedCard(null);
      setIsTransitioning(false);
    }, 800);
  };

  // Show HomePage
  if (currentPage === 'home') {
    return (
      <div className={`page-wrapper ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
        <HomePage onNavigateToStream={navigateToStream} />
      </div>
    );
  }

  // Show Stream of Consciousness page
  return (
    <div className={`page-wrapper stream-page ${isTransitioning ? 'fade-out' : 'fade-in'}`} style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Back to Home Button */}
      <button 
        onClick={navigateToHome}
        disabled={isTransitioning}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '12px 24px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          color: 'white',
          cursor: isTransitioning ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          zIndex: 100,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          opacity: isTransitioning ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isTransitioning) {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        ← Back to Home
      </button>

      {/* 3D Canvas - lower z-index */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
          <Suspense fallback={null}>
            <CameraController />
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} />
            <Stars radius={100} depth={100} count={20000} factor={5} fade />
            <FloatingCards onCardClick={handleCardClick} />
            <River />
            <Boat />
            <ArtworkOrb />
            <RiverBanks />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Controls - middle z-index */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
        <div style={{ pointerEvents: "auto" }}>
          <Controls />
          <AudioPlayer />
        </div>
      </div>
      
      {/* Expanded Card Modal - highest z-index */}
      {expandedCard && (
        <ExpandedCard card={expandedCard} onClose={handleClose} />
      )}
    </div>
  );
}