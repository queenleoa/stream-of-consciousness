import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function RiverBanks() {
  const leftBankRef = useRef();
  const rightBankRef = useRef();
  
  // Create layered mountain geometry for depth
  const createMountainLayer = (side, distance, height, segments = 100) => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const uvs = [];
    
    const length = 270; // Length along the river
    const xOffset = side === 'left' ? -distance : distance;
    
    // Create mountain profile with Perlin-like noise simulation
    const mountainProfile = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const z = (t - 0.5) * length;
      
      // Combine multiple sine waves for natural mountain shapes
      let h = height;
      h += Math.sin(t * Math.PI * 2.5) * (height * 0.3);
      h += Math.sin(t * Math.PI * 4.2 + 1.5) * (height * 0.2);
      h += Math.sin(t * Math.PI * 7.8 + 3.2) * (height * 0.15);
      h += Math.sin(t * Math.PI * 12.3 + 5.7) * (height * 0.1);
      h += Math.sin(t * Math.PI * 18.7 + 8.1) * (height * 0.08);
      
      // Add some randomness for natural variation
      h += (Math.sin(t * Math.PI * 31.4 + distance) * 0.5) * (height * 0.05);
      
      mountainProfile.push({ z, height: Math.max(0.5, h) });
    }
    
    // Build the mountain mesh
    for (let i = 0; i <= segments; i++) {
      const profile = mountainProfile[i];
      
      // Base vertices (at water level)
      vertices.push(xOffset, -2.5, profile.z);
      uvs.push(i / segments, 0);
      
      // Peak vertices
      vertices.push(xOffset, profile.height, profile.z);
      uvs.push(i / segments, 1);
      
      // Far side vertices (for depth)
      const depthOffset = side === 'left' ? -8 : 8;
      vertices.push(xOffset + depthOffset, profile.height * 0.7, profile.z);
      uvs.push(i / segments, 0.7);
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
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
  };
  
  // Create multiple mountain layers for depth
  const mountainLayers = useMemo(() => {
    const layers = [];
    
    // Far background mountains
    layers.push({
      left: createMountainLayer('left', 25, 8, 80),
      right: createMountainLayer('right', 25, 8.5, 80),
      distance: 25
    });
    
    // Middle mountains
    layers.push({
      left: createMountainLayer('left', 18, 6, 90),
      right: createMountainLayer('right', 18, 6.2, 90),
      distance: 18
    });
    
    // Near mountains
    layers.push({
      left: createMountainLayer('left', 12, 4.5, 100),
      right: createMountainLayer('right', 12, 4.8, 100),
      distance: 12
    });
    
    return layers;
  }, []);
  
  // Create tree instances for forest effect
  const createTreeInstances = (side, baseDistance, count = 300) => {
    const treeGeometry = new THREE.ConeGeometry(0.3, 1.2, 6);
    const treeMaterial = new THREE.MeshBasicMaterial({ color: 0x0a0d0f });
    const instancedMesh = new THREE.InstancedMesh(treeGeometry, treeMaterial, count);
    
    const dummy = new THREE.Object3D();
    const xOffset = side === 'left' ? -baseDistance : baseDistance;
    
    for (let i = 0; i < count; i++) {
      // Random position along the mountain
      const z = (Math.random() - 0.5) * 120;
      const xVariation = (Math.random() - 0.5) * 6;
      const y = Math.random() * 3 + 1;
      
      dummy.position.set(
        xOffset + xVariation,
        y,
        z
      );
      
      // Random scale for variety
      const scale = 0.5 + Math.random() * 1.0;
      dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.4), scale);
      
      // Slight random rotation
      dummy.rotation.y = Math.random() * Math.PI * 2;
      
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    
    instancedMesh.instanceMatrix.needsUpdate = true;
    return instancedMesh;
  };
  
  // Tree instances
  const treeInstances = useMemo(() => {
    return {
      leftNear: createTreeInstances('left', 12, 200),
      leftMid: createTreeInstances('left', 18, 150),
      rightNear: createTreeInstances('right', 12, 200),
      rightMid: createTreeInstances('right', 18, 150),
    };
  }, []);
  
  // Shader material for atmospheric mountains
  const createMountainMaterial = (layerIndex) => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        layerDepth: { value: layerIndex },
        fogColor: { value: new THREE.Color(0x0a1218) },
        baseColor: { value: new THREE.Color(0x0d1519) },
        midColor: { value: new THREE.Color(0x152028) },
        peakColor: { value: new THREE.Color(0x1a2832) },
        atmosphereStrength: { value: 0.7 },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vHeight;
        
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          vHeight = position.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float layerDepth;
        uniform vec3 fogColor;
        uniform vec3 baseColor;
        uniform vec3 midColor;
        uniform vec3 peakColor;
        uniform float atmosphereStrength;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vHeight;
        
        void main() {
          // Base color based on height
          float heightFactor = smoothstep(-0.5, 8.0, vHeight);
          vec3 color = mix(baseColor, midColor, heightFactor * 0.5);
          
          // Add variation based on position
          float variation = sin(vPosition.z * 0.1 + time * 0.05) * 0.1;
          color = mix(color, peakColor, (heightFactor + variation) * 0.3);
          
          // Atmospheric perspective - further layers are lighter/hazier
          float atmosphere = layerDepth * 0.15 * atmosphereStrength;
          color = mix(color, fogColor, atmosphere);
          
          // Distance fog
          float distanceFog = smoothstep(30.0, 70.0, abs(vPosition.z));
          color = mix(color, fogColor, distanceFog * 0.4);
          
          // Very subtle lighting for depth
          vec3 lightDir = normalize(vec3(0.3, 0.8, 0.5));
          float lightIntensity = max(dot(vNormal, lightDir), 0.0);
          color = color * (0.85 + lightIntensity * 0.15);
          
          // Edge darkening for silhouette effect
          float edgeFactor = 1.0 - smoothstep(0.0, 1.0, abs(vUv.x - 0.5) * 2.0);
          color *= (0.9 + edgeFactor * 0.1);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });
  };
  
  // Create materials for each layer
  const materials = useMemo(() => {
    return mountainLayers.map((_, index) => ({
      left: createMountainMaterial(index),
      right: createMountainMaterial(index)
    }));
  }, [mountainLayers]);
  
  // Subtle animation for atmosphere
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    materials.forEach(material => {
      material.left.uniforms.time.value = time;
      material.right.uniforms.time.value = time;
    });
  });
  
  return (
    <group>
      {/* Render mountain layers from back to front */}
      {mountainLayers.map((layer, index) => (
        <group key={`layer-${index}`}>
          <mesh 
            geometry={layer.left} 
            material={materials[index].left}
            receiveShadow
          />
          <mesh 
            geometry={layer.right} 
            material={materials[index].right}
            receiveShadow
          />
        </group>
      ))}
      
      {/* Add tree instances for forested look */}
      <primitive object={treeInstances.leftNear} />
      <primitive object={treeInstances.leftMid} />
      <primitive object={treeInstances.rightNear} />
      <primitive object={treeInstances.rightMid} />
    </group>
  );
}