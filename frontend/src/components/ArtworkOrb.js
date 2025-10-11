import { MeshWobbleMaterial } from "@react-three/drei";

export default function ArtworkOrb() {
  return (
    <mesh position={[0, 2, -10]}>
      <icosahedronGeometry args={[1.5, 1]} />
      <MeshWobbleMaterial
        attach="material"
        color="#f09307ff"
        factor={1}
        speed={2}
        emissive="#f0a206ff"
        emissiveIntensity={0.8}
      />
    </mesh>
  );
}
