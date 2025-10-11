export default function RiverBanks() {
  return (
    <>
      <mesh position={[-5, 1, 0]}>
        <boxGeometry args={[2, 2, 200]} />
        <meshStandardMaterial color="#613a11ff" />
      </mesh>
      <mesh position={[5, 1, 0]}>
        <boxGeometry args={[2, 2, 200]} />
        <meshStandardMaterial color="#e09f10ff" />
      </mesh>
    </>
  );
}
