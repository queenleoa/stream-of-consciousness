import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function River() {
  const meshRef = useRef();
  
  // Create a plane with segments for wave animation
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(200, 200, 256, 256);
  }, []);

  // Custom shader material for realistic water
  const waterMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        waterColor: { value: new THREE.Color(0x0a2d4d) }, // Deep water blue
        midColor: { value: new THREE.Color(0x1a5080) }, // Mid-tone blue
        foamColor: { value: new THREE.Color(0x4a9fd8) }, // Lighter foam/highlights
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vWaveHeight;
        
        void main() {
          vUv = uv;
          vec3 pos = position;
          
          // Large waves moving forward (along Y which becomes Z after rotation)
          float wave1 = sin(pos.y * 0.25 + time * 1.5) * 0.18;
          float wave2 = sin(pos.y * 0.18 - time * 1.2) * 0.15;
          float wave3 = sin((pos.x * 0.1 + pos.y * 0.2) + time * 1.8) * 0.12;
          
          // Medium waves for variation
          float wave4 = sin(pos.y * 0.4 + time * 2.2) * 0.08;
          float wave5 = sin((pos.x * 0.15 - pos.y * 0.35) - time * 1.6) * 0.07;
          
          // Fine-grained ripples (high frequency)
          float ripple1 = sin(pos.y * 1.2 + time * 3.5) * 0.025;
          float ripple2 = sin((pos.x * 0.8 + pos.y * 1.5) - time * 4.0) * 0.02;
          float ripple3 = sin(pos.y * 2.0 + pos.x * 0.5 + time * 5.0) * 0.018;
          float ripple4 = sin((pos.x * 1.2 - pos.y * 1.8) + time * 4.5) * 0.015;
          
          // Very fine detail
          float detail1 = sin(pos.y * 3.5 + time * 6.0) * 0.01;
          float detail2 = sin((pos.x * 2.0 + pos.y * 3.0) - time * 7.0) * 0.008;
          
          pos.z = wave1 + wave2 + wave3 + wave4 + wave5 + ripple1 + ripple2 + ripple3 + ripple4 + detail1 + detail2;
          vWaveHeight = pos.z;
          
          // Calculate normals for lighting
          float offset = 0.1;
          vec3 posX = vec3(position.x + offset, position.y, 0.0);
          vec3 posY = vec3(position.x, position.y + offset, 0.0);
          
          float waveX1 = sin(posX.y * 0.25 + time * 1.5) * 0.18;
          float waveX2 = sin(posX.y * 0.18 - time * 1.2) * 0.15;
          float waveX3 = sin((posX.x * 0.1 + posX.y * 0.2) + time * 1.8) * 0.12;
          posX.z = waveX1 + waveX2 + waveX3;
          
          float waveY1 = sin(posY.y * 0.25 + time * 1.5) * 0.18;
          float waveY2 = sin(posY.y * 0.18 - time * 1.2) * 0.15;
          float waveY3 = sin((posY.x * 0.1 + posY.y * 0.2) + time * 1.8) * 0.12;
          posY.z = waveY1 + waveY2 + waveY3;
          
          vec3 tangentX = normalize(posX - pos);
          vec3 tangentY = normalize(posY - pos);
          vNormal = normalize(cross(tangentX, tangentY));
          
          vPosition = pos;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 waterColor;
        uniform vec3 midColor;
        uniform vec3 foamColor;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vWaveHeight;
        
        void main() {
          // Multi-layer color gradient based on wave height and position
          vec3 color = waterColor;
          
          // Transition from deep to mid tone based on wave height
          float heightFactor = smoothstep(-0.15, 0.0, vWaveHeight);
          color = mix(waterColor, midColor, heightFactor * 0.7);
          
          // Lighting calculation
          vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
          float lightIntensity = max(dot(vNormal, lightDir), 0.0);
          
          // Add specular highlights (more pronounced on peaks)
          vec3 viewDir = normalize(cameraPosition - vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float specular = pow(max(dot(vNormal, halfDir), 0.0), 40.0);
          
          // Fresnel effect for realistic water edges
          float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
          
          // Add foam on wave crests with smooth transition
          float foam = smoothstep(0.10, 0.20, vWaveHeight);
          color = mix(color, foamColor, foam * 0.5);
          
          // Apply lighting with better contrast
          color = color * (0.4 + lightIntensity * 0.6);
          
          // Add specular highlights (brighter on crests)
          color += vec3(1.0) * specular * (0.6 + foam * 0.4);
          
          // Add fresnel rim lighting
          color += midColor * fresnel * 0.25;
          
          // Add depth with gradient (darker in distance)
          float depth = 1.0 - (vUv.y * 0.2);
          color *= depth;
          
          // Subtle ambient highlights in troughs
          float trough = smoothstep(-0.18, -0.08, vWaveHeight);
          color += midColor * trough * 0.15;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });
  }, []);

  // Animate the water
  useFrame((state) => {
    if (waterMaterial) {
      waterMaterial.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh 
      ref={meshRef}
      rotation-x={-Math.PI / 2} 
      position={[0, 0, 0]}
      geometry={geometry}
      material={waterMaterial}
    />
  );
}