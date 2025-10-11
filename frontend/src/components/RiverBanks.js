export default function RiverBanks() {
  return (
    <>
      <mesh position={[-5, 1, 0]}>
        <boxGeometry args={[2, 2, 200]} />
        <meshStandardMaterial color="#1b2b34" />
      </mesh>
      <mesh position={[5, 1, 0]}>
        <boxGeometry args={[2, 2, 200]} />
        <meshStandardMaterial color="#1b2b34" />
      </mesh>
    </>
  );
}
