import { MeshReflectorMaterial } from "@react-three/drei";

export default function River() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
      <planeGeometry args={[200, 200, 1, 1]} />
      <MeshReflectorMaterial
        color="#8fbceaff"
        roughness={0.4}
        metalness={0.8}
        blur={[300, 100]}
        mixStrength={1}
        mirror={0.2}
      />
    </mesh>
  );
}
