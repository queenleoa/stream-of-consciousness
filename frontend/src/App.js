import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import Boat from "./components/Boat";
import River from "./components/River";
import ArtworkOrb from "./components/ArtworkOrb";
import RiverBanks from "./components/RiverBanks";
import Controls from "./components/Controls";
import AudioPlayer from "./components/AudioPlayer";
import FloatingCards from "./components/FloatingCards";
import "./App.css";


export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "dark-blue" }}>
      <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} />
          <Stars radius={100} depth={100} count={20000} factor={5} fade />
          <FloatingCards />
          <River />
          <Boat />
          <ArtworkOrb />
          <RiverBanks />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
      <Controls />
      <AudioPlayer />
    </div>
  );
}
