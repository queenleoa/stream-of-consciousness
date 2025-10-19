import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import Boat from "./components/Boat";
import River from "./components/River";
import ArtworkOrb from "./components/ArtworkOrb";
import RiverBanks from "./components/RiverBanks";
import Controls from "./components/Controls";
import AudioPlayer from "./components/AudioPlayer";
import FloatingCards from "./components/FloatingCards";
import ExpandedCard from "./components/ExpandedCard";
import "./App.css";

export default function App() {
  const [expandedCard, setExpandedCard] = useState(null);

  const handleCardClick = (card) => {
    setExpandedCard(card);
  };

  const handleClose = () => {
    setExpandedCard(null);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "dark-blue", position: "relative" }}>
      {/* 3D Canvas - lower z-index */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} />
            <Stars radius={100} depth={100} count={20000} factor={5} fade />
            <FloatingCards onCardClick={handleCardClick} />
            <River />
            <Boat />
            <ArtworkOrb />
            <RiverBanks />
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} />
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