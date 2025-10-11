import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Boat() {
  const boatRef = useRef();
  
  // Create boat bow geometry (triangular pointed shape)
  const boatGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    
    // Create a boat bow shape (viewed from behind, looking forward)
    // Bottom point (front of boat)
    shape.moveTo(0, -1.5);
    
    // Left side rising up and back
    shape.lineTo(-1.2, -0.5);
    shape.lineTo(-1.0, 0.2);
    
    // Back left
    shape.lineTo(-0.8, 0.5);
    
    // Back edge
    shape.lineTo(0.8, 0.5);
    
    // Back right
    shape.lineTo(1.0, 0.2);
    
    // Right side
    shape.lineTo(1.2, -0.5);
    
    // Back to bottom point
    shape.lineTo(0, -1.5);
    
    const extrudeSettings = {
      depth: 3,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.05,
      bevelSegments: 3
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);
  
  // Iridescent shader material
  const boatMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        // Iridescent color palette
        baseColor: { value: new THREE.Color(0x2a1810) },      // Dark brown base
        iridescent1: { value: new THREE.Color(0xd4a574) },    // Gold
        iridescent2: { value: new THREE.Color(0xf4c795) },    // Light gold/cream
        iridescent3: { value: new THREE.Color(0xa67c52) },    // Bronze
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 baseColor;
        uniform vec3 iridescent1;
        uniform vec3 iridescent2;
        uniform vec3 iridescent3;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
          // Base color
          vec3 color = baseColor;
          
          // View direction for iridescence
          vec3 viewDir = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.5);
          
          // Iridescent effect based on viewing angle and position
          float iridFactor1 = sin(vPosition.x * 2.0 + vPosition.y * 1.5 + time * 0.5) * 0.5 + 0.5;
          float iridFactor2 = cos(vPosition.y * 1.8 - vPosition.z * 0.5 + time * 0.3) * 0.5 + 0.5;
          
          // Mix iridescent colors
          vec3 iridColor = mix(iridescent1, iridescent2, iridFactor1);
          iridColor = mix(iridColor, iridescent3, iridFactor2 * 0.5);
          
          // Apply iridescence on edges and angles
          color = mix(color, iridColor, fresnel * 0.7);
          
          // Add subtle shimmer
          float shimmer = sin(vPosition.x * 4.0 + vPosition.y * 3.0 + time * 2.0) * 0.15 + 0.15;
          color += iridColor * shimmer * fresnel;
          
          // Lighting
          vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
          float lightIntensity = max(dot(vNormal, lightDir), 0.0);
          color = color * (0.4 + lightIntensity * 0.6);
          
          // Specular highlight
          vec3 halfDir = normalize(lightDir + viewDir);
          float specular = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
          color += vec3(1.0, 0.9, 0.7) * specular * 0.3;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });
  }, []);
  
  // Gentle bobbing animation
  useFrame((state) => {
    if (boatRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Very gentle vertical bob (amplitude: 0.03 = very subtle)
      // Speed: 0.8 = slow gentle movement
      // Base position: 0.3 = slightly above water
      boatRef.current.position.y = 0.3 + Math.sin(time * 0.8) * 0.03;
      
      // Very subtle roll/tilt (amplitude: 0.008 radians = ~0.5 degrees)
      // Speed: 1.0 = slightly varied from vertical bob
      boatRef.current.rotation.z = Math.sin(time * 1.0) * 0.008;
      
      // Tiny forward-back tilt (amplitude: 0.005 radians = ~0.3 degrees)
      // Speed: 0.6 = slowest movement
      boatRef.current.rotation.x = Math.cos(time * 0.6) * 0.005;
      
      // Update material time for iridescent animation
      if (boatMaterial) {
        boatMaterial.uniforms.time.value = time;
      }
    }
  });
  
  return (
    <mesh 
      ref={boatRef}
      geometry={boatGeometry}
      material={boatMaterial}
      position={[0, 0.1, 8]}
      rotation={[0, Math.PI, 0]}
      scale={[0.5, 0.5, 0.5]}
    />
  );
}