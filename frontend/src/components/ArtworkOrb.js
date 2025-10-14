import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

export default function ArtworkOrb() {
  const imageRef = useRef();
  const glowRef = useRef();
  const [imageSize, setImageSize] = useState([1, 1]);
  
  // Load your artwork image
  const texture = useLoader(THREE.TextureLoader, '/test.png');
  
  // Calculate aspect ratio once texture is loaded
  useEffect(() => {
    if (texture.image) {
      const aspect = texture.image.width / texture.image.height;
      // Set width to 2 units, height based on aspect ratio
      setImageSize([2, 2 / aspect]);
    }
  }, [texture]);
  
  // Image plane material with slight glow
  const imageMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        imageTexture: { value: texture },
        glowColor: { value: new THREE.Color(0xffcc66) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D imageTexture;
        uniform vec3 glowColor;
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          // Get the image color
          vec4 texColor = texture2D(imageTexture, vUv);
          
          // Subtle inner glow at edges
          vec2 center = vUv - 0.5;
          float dist = length(center);
          float edgeGlow = smoothstep(0.5, 0.35, dist) * 0.15;
          
          vec3 color = texColor.rgb + glowColor * edgeGlow;
          
          gl_FragColor = vec4(color, texColor.a);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, [texture]);
  
  // Iridescent glow aura around the image
  const glowMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        glowColor1: { value: new THREE.Color(0xffb94f) },
        glowColor2: { value: new THREE.Color(0xffd700) },
        glowColor3: { value: new THREE.Color(0xff9a00) },
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
        uniform vec3 glowColor1;
        uniform vec3 glowColor2;
        uniform vec3 glowColor3;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          // Distance from center
          vec2 center = vUv - 0.5;
          float dist = length(center) * 2.0;
          
          // Create glowing frame effect - glow only at edges
          float frameInner = 0.85;
          float frameOuter = 1.2;
          float glow = smoothstep(frameInner, frameOuter, dist) * (1.0 - smoothstep(frameOuter, frameOuter + 0.3, dist));
          
          // Animated iridescent colors
          float shimmer1 = sin(vPosition.x * 3.0 + time * 1.5) * 0.5 + 0.5;
          float shimmer2 = cos(vPosition.y * 3.5 - time * 1.2) * 0.5 + 0.5;
          
          vec3 color = mix(glowColor1, glowColor2, shimmer1);
          color = mix(color, glowColor3, shimmer2 * 0.5);
          
          // Pulsing intensity
          float pulse = sin(time * 0.8) * 0.15 + 0.85;
          
          float alpha = glow * pulse;
          
          gl_FragColor = vec4(color, alpha * 0.7);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, []);
  
  // Outer glow halo
  const haloMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        glowColor: { value: new THREE.Color(0xffcc66) },
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
          vec2 center = vUv - 0.5;
          float dist = length(center) * 2.0;
          
          // Soft outer glow
          float glow = 1.0 - smoothstep(0.3, 1.5, dist);
          float pulse = sin(time * 0.6) * 0.2 + 0.8;
          
          gl_FragColor = vec4(glowColor, glow * pulse * 0.25);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, []);
  
  // Gentle floating animation
  useFrame((state) => {
    if (imageRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Gentle floating up and down
      imageRef.current.position.y = 2 + Math.sin(time * 0.6) * 0.15;
      
      // Very subtle rotation
      imageRef.current.rotation.z = Math.sin(time * 0.3) * 0.02;
      
      // Update shader time
      if (imageMaterial) {
        imageMaterial.uniforms.time.value = time;
      }
      if (glowMaterial) {
        glowMaterial.uniforms.time.value = time;
      }
      if (haloMaterial) {
        haloMaterial.uniforms.time.value = time;
      }
    }
  });
  
  return (
    <group ref={imageRef} position={[0, 2, -10]}>
      {/* Outer soft halo */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[imageSize[0] * 1.8, imageSize[1] * 1.8]} />
        <primitive object={haloMaterial} attach="material" />
      </mesh>
      
      {/* Iridescent frame glow */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[imageSize[0] * 1.3, imageSize[1] * 1.3]} />
        <primitive object={glowMaterial} attach="material" />
      </mesh>
      
      {/* The actual artwork image (intact and flat) */}
      <mesh>
        <planeGeometry args={imageSize} />
        <primitive object={imageMaterial} attach="material" />
      </mesh>
    </group>
  );
}