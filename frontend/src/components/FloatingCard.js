import { useRef, useState, useMemo } from "react";
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
  const [isHovered, setIsHovered] = useState(false);

  // Glowing card material
  const cardMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        cardColor: { value: new THREE.Color(color) },
        glowIntensity: { value: isHovered ? 1.5 : 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 cardColor;
        uniform float glowIntensity;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          // Rounded corners
          vec2 center = vUv - 0.5;
          float cornerRadius = 0.1;
          vec2 edgeDist = abs(center) - (0.5 - cornerRadius);
          float cornerDist = length(max(edgeDist, 0.0));
          float rounded = smoothstep(cornerRadius + 0.01, cornerRadius - 0.01, cornerDist);
          
          // Inner card color with subtle gradient
          float gradient = vUv.y * 0.3 + 0.7;
          vec3 innerColor = cardColor * gradient;
          
          // Outer glow
          float glowDist = length(center);
          float glow = exp(-glowDist * 3.0) * 0.6 * glowIntensity;
          
          // Pulsing effect
          float pulse = sin(time * 1.5) * 0.1 + 0.9;
          
          // Edge highlight
          float edge = smoothstep(0.38, 0.42, length(center));
          vec3 edgeGlow = cardColor * edge * 0.8 * pulse;
          
          // Combine
          vec3 finalColor = innerColor + edgeGlow + (cardColor * glow * pulse);
          float alpha = rounded * (0.85 + glow * 0.15);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
  }, [color, isHovered]);

  // Animate floating and update shader
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (cardRef.current) {
      // Gentle floating motion
      cardRef.current.position.y = position[1] + Math.sin(time * 0.8 + floatOffset) * 0.15;
      
      // Subtle rotation
      cardRef.current.rotation.z = Math.sin(time * 0.5 + floatOffset) * 0.05;
      cardRef.current.rotation.x = Math.cos(time * 0.6 + floatOffset) * 0.03;
    }
    
    if (cardMaterial) {
      cardMaterial.uniforms.time.value = time;
      cardMaterial.uniforms.glowIntensity.value = isHovered ? 1.5 : 1.0;
    }
  });

  return (
    <group ref={cardRef} position={position}>
      {/* Card glow background */}
      

      {/* Card content - HTML overlay */}
      <Html
        position={[0, 0, 0.01]}
        center
        distanceFactor={8}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: '400px',
            height: '200px',
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            border: `2px solid ${color}40`,
            boxShadow: `0 0 20px ${color}60`,
            color: 'white',
            fontSize: '11px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            overflow: 'hidden',
          }}
        >
          <div style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: color,
            marginBottom: '4px',
            textShadow: `0 0 10px ${color}`,
          }}>
            {content.title}
          </div>
          <div style={{ 
            fontSize: '18px', 
            opacity: 0.9,
            lineHeight: '1.4',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {content.preview}
          </div>
          <div style={{ 
            marginTop: 'auto',
            fontSize: '12px',
            opacity: 0.6,
            fontStyle: 'italic',
          }}>
            Click to expand
          </div>
        </div>
      </Html>
    </group>
  );
}