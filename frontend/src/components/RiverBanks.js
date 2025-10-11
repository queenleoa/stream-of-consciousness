export default function RiverBanks() {
  return (
    <>
      <mesh position={[-4, 1, 0]}>
        <boxGeometry args={[1, 2, 50]} />
        <meshStandardMaterial color="#15b039ff" />
      </mesh>
      <mesh position={[4, 1, 0]}>
        <boxGeometry args={[1, 2, 50]} />
        <meshStandardMaterial color="#74db20ff" />
      </mesh>
    </>
  );
}
