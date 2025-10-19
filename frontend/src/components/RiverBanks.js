import { useMemo } from "react";
import * as THREE from "three";

export default function RiverBanks() {
  
  // Create left bank terrain
  const leftBankGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    
    // Parameters for the bank
    const length = 100; // How far along the river
    const segments = 50;
    const baseHeight = 0.5; // Base height above water
    
    for (let i = 0; i <= segments; i++) {
      const z = (i / segments) * length - length / 2;
      
      // Create mountain/hill profile with variation
      const heightVariation1 = Math.sin(i * 0.3) * 2.5;
      const heightVariation2 = Math.sin(i * 0.15 + 2) * 1.8;
      const heightVariation3 = Math.sin(i * 0.5 + 5) * 1.2;
      const totalHeight = baseHeight + heightVariation1 + heightVariation2 + heightVariation3;
      
      // Bottom edge (at water level)
      vertices.push(-8, 0, z);
      
      // Top edge (mountain peak)
      vertices.push(-8, totalHeight, z);
      
      // Far edge (depth)
      vertices.push(-12, totalHeight * 1.2, z);
    }
    
    // Create faces
    for (let i = 0; i < segments; i++) {
      const base = i * 3;
      const next = (i + 1) * 3;
      
      // Front face
      indices.push(base, base + 1, next);
      indices.push(base + 1, next + 1, next);
      
      // Top face
      indices.push(base + 1, base + 2, next + 1);
      indices.push(base + 2, next + 2, next + 1);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
  }, []);
  
  // Create right bank terrain (mirror of left)
  const rightBankGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    
    const length = 100;
    const segments = 50;
    const baseHeight = 0.5;
    
    for (let i = 0; i <= segments; i++) {
      const z = (i / segments) * length - length / 2;
      
      // Different variation pattern for variety
      const heightVariation1 = Math.sin(i * 0.25 + 1) * 2.8;
      const heightVariation2 = Math.sin(i * 0.18 + 3) * 1.5;
      const heightVariation3 = Math.sin(i * 0.45 + 7) * 1.3;
      const totalHeight = baseHeight + heightVariation1 + heightVariation2 + heightVariation3;
      
      // Bottom edge
      vertices.push(8, 0, z);
      
      // Top edge
      vertices.push(8, totalHeight, z);
      
      // Far edge
      vertices.push(12, totalHeight * 1.2, z);
    }
    
    // Create faces
    for (let i = 0; i < segments; i++) {
      const base = i * 3;
      const next = (i + 1) * 3;
      
      // Front face
      indices.push(base, next, base + 1);
      indices.push(base + 1, next, next + 1);
      
      // Top face
      indices.push(base + 1, next + 1, base + 2);
      indices.push(base + 2, next + 1, next + 2);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
  }, []);
  
  // Material for banks - dark mountain/forest silhouette
  const bankMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        darkColor: { value: new THREE.Color(0x0a0f15) },      // Very dark base
        midColor: { value: new THREE.Color(0x1a2530) },       // Dark blue-grey
        highlightColor: { value: new THREE.Color(0x2a3f50) }, // Subtle highlights
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 darkColor;
        uniform vec3 midColor;
        uniform vec3 highlightColor;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          // Height-based color gradient
          float heightFactor = smoothstep(0.0, 3.0, vPosition.y);
          vec3 color = mix(darkColor, midColor, heightFactor * 0.6);
          
          // Add subtle highlights on top peaks
          float peakHighlight = smoothstep(3.0, 5.0, vPosition.y);
          color = mix(color, highlightColor, peakHighlight * 0.4);
          
          // Subtle ambient lighting
          vec3 lightDir = normalize(vec3(0.3, 1.0, 0.2));
          float lightIntensity = max(dot(vNormal, lightDir), 0.0);
          color = color * (0.7 + lightIntensity * 0.3);
          
          // Distance fog effect (darker in distance)
          float fogFactor = smoothstep(20.0, 50.0, abs(vPosition.z));
          color = mix(color, darkColor, fogFactor * 0.5);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });
  }, []);
  
  return (
    <group>
      {/* Left bank */}
      <mesh geometry={leftBankGeometry} material={bankMaterial} />
      
      {/* Right bank */}
      <mesh geometry={rightBankGeometry} material={bankMaterial} />
    </group>
  );
}