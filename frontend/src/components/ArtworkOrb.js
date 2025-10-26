import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { fetchArtByPkOnce, getImageUrl } from "../data/indexer"

const art = await fetchArtByPkOnce();        // full object (all fields)
const img = await getImageUrl();             // just the image_url

export default function ArtworkOrb({ imageUrl = "./test.png" }) { //replace with url
  const groupRef = useRef();
  const [imageDimensions, setImageDimensions] = useState({ width: 512, height: 512 });
  
  // Handle image load to get dimensions
  const handleImageLoad = (e) => {
    const img = e.target;
    const aspect = img.naturalWidth / img.naturalHeight;
    const height = 512; // Base width in pixels
    setImageDimensions({
      width: height * aspect,
      height: height,
    });
  };
  
  // Calculate 3D size based on image dimensions (pixels to 3D units)
  const scale3D = useMemo(() => {
    // Convert pixels to 3D units (roughly)
    const scale = 0.005;
    return {
      width: imageDimensions.width * scale,
      height: imageDimensions.height * scale
    };
  }, [imageDimensions]);
  
  // Ambient glow material
  const glowMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        glowColor: { value: new THREE.Color(0xffd700) }, // Golden glow
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 glowColor;
        varying vec2 vUv;
        
        void main() {
          // Distance from center
          vec2 center = vUv - 0.5;
          float dist = length(center) * 2.0;
          
          // Soft circular glow with smooth falloff
          float glow = pow(1.0 - smoothstep(0.3, 1.2, dist), 2.0);
          
          // Gentle pulse
          float pulse = sin(time * 0.7) * 0.1 + 0.9;
          
          gl_FragColor = vec4(glowColor, glow * pulse * 0.4);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, []);
  
  // Gentle floating animation
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (groupRef.current) {
      // Subtle vertical float
      groupRef.current.position.y = 2 + Math.sin(time * 1.8) * 0.12;
      
      // Very gentle sway/rotation
      groupRef.current.rotation.z = Math.sin(time * 1.2) * 0.015;
      groupRef.current.rotation.x = Math.cos(time * 1.5) * 0.01;
    }
    
    // Update glow shaders
    if (glowMaterial) glowMaterial.uniforms.time.value = time;
  });
  
  return (
    <group ref={groupRef} position={[0, 0, -50]}>
      {/* Outer ambient glow */}
      <mesh position={[0, 5, -0.3]}>
        <planeGeometry args={[scale3D.width * 10, scale3D.height * 10]} />
        <primitive object={glowMaterial} />
      </mesh>
      
      {/* Clear HTML image (no blur!) */}
      <Html
        transform
        occlude
        position={[0, 3, 0]}
        style={{
          width: `${imageDimensions.width}px`,
          height: `${imageDimensions.height}px`,
          transition: 'all 0.3s',
        }}
      >
        <img 
          src={imageUrl}
          alt="Artwork"
          onLoad={handleImageLoad}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            imageRendering: 'crisp-edges',
          }}
        />
      </Html>
    </group>
  );
}