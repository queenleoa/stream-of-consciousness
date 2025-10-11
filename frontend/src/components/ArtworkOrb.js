import { MeshWobbleMaterial } from "@react-three/drei";

export default function ArtworkOrb() {
  return (
    <mesh position={[0, 2, -50]}>
      <icosahedronGeometry args={[1.5, 1]} />
      <MeshWobbleMaterial
        attach="material"
        color="#ffb94f"
        factor={1}
        speed={2}
        emissive="#ffcc66"
        emissiveIntensity={0.8}
      />
    </mesh>
  );
}
