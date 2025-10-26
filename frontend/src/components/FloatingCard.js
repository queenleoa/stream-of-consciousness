import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

export default function FloatingCard({ 
  position, 
  color, 
  content, 
  floatOffset = 0, 
  onCardClick 
}) {
  const cardRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Floating animation
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (cardRef.current) {
      // Gentle float up and down
      cardRef.current.position.y = position[1] + Math.sin(time * 0.8 + floatOffset) * 0.3;
      
      // Subtle rotation sway
      cardRef.current.rotation.y = Math.sin(time * 0.5 + floatOffset) * 0.08;
      cardRef.current.rotation.x = Math.cos(time * 0.6 + floatOffset) * 0.05;
      
      // Scale up slightly when hovered
      const targetScale = hovered ? 1.08 : 1.0;
      cardRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale), 
        0.1
      );
    }
  });

  return (
    <group ref={cardRef} position={position}>
      {/* Clickable invisible mesh (larger hit area) */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onCardClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <planeGeometry args={[4.5, 2.3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Glowing card background */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[4.2, 2.1]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.25 : 0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer glow effect */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[4.8, 2.5]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.12 : 0.06}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Card content - HTML overlay */}
      <Html
        position={[0, 0, 0.01]}
        center
        distanceFactor={8}
        style={{
          pointerEvents: 'none', // Let the mesh handle clicks
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: '400px',
            height: '200px',
            padding: '20px',
            borderRadius: '16px',
            background: `linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4))`,
            backdropFilter: 'blur(12px)',
            border: `2px solid ${color}${hovered ? '80' : '40'}`,
            boxShadow: `0 0 ${hovered ? '30px' : '20px'} ${color}${hovered ? '80' : '60'}`,
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            transform: hovered ? 'scale(1.02)' : 'scale(1)',
          }}
        >
          <div style={{ 
            fontSize: '22px', 
            fontWeight: '600', 
            color: color,
            marginBottom: '6px',
            textShadow: `0 0 15px ${color}`,
            letterSpacing: '0.3px',
          }}>
            {content.title}
          </div>
          <div style={{ 
            fontSize: '16px', 
            opacity: 0.9,
            lineHeight: '1.85',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}>
            {content.preview}
          </div>
          <div style={{ 
            marginTop: 'auto',
            fontSize: '13px',
            opacity: hovered ? 0.9 : 0.6,
            fontStyle: 'italic',
            color: color,
            transition: 'opacity 0.3s ease',
          }}>
            {hovered ? '→ Click to expand' : 'Click to expand'}
          </div>
        </div>
      </Html>
    </group>
  );
}