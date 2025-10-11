export default function RiverBanks() {
  return (
    <>
      <mesh position={[-5, 1, 0]}>
        <boxGeometry args={[2, 2, 200]} />
        <meshStandardMaterial color="#15b039ff" />
      </mesh>
      <mesh position={[5, 1, 0]}>
        <boxGeometry args={[2, 2, 200]} />
        <meshStandardMaterial color="#74db20ff" />
      </mesh>
    </>
  );
}
