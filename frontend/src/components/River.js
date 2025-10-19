import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function River() {
  const meshRef = useRef();
  
  // Create a plane with segments for wave animation
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(200, 150, 256, 256);
  }, []);

  // Custom shader material for realistic water
  const waterMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        // Color palette - 5 shades from deep to bright
        deepColor: { value: new THREE.Color(0x081c2e) },    // Darkest deep water
        darkColor: { value: new THREE.Color(0x0a2d4d) },    // Deep water blue
        midColor: { value: new THREE.Color(0x1a5080) },      // Mid-tone blue
        lightColor: { value: new THREE.Color(0x103659) },    // Lighter highlight
        foamColor: { value: new THREE.Color(0x13446f) },     // Brightest foam/crest
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
          
          // === LARGE WAVES (Slow, gentle swells) ===
          // Frequency: 0.15 = wave spacing | Speed: 0.8 = how fast they move | Amplitude: 0.07 = height
          float wave1 = sin(pos.y * 0.30 + time * 0.2) * 0.03;
          
          // Secondary large wave at different frequency for natural variation
          // Frequency: 0.12 | Speed: 0.6 | Amplitude: 0.06
          float wave2 = sin(pos.y * 0.07 - time * 0.4) * 0.06;
          
          // Cross-wave (diagonal) for more organic movement
          // Frequency: 0.1 on x, 0.14 on y | Speed: 0.9 | Amplitude: 0.05
          float wave3 = sin((pos.x * 0.1 + pos.y * 0.14) + time * 0.7) * 0.04;
          
          // === MEDIUM WAVES (Moderate movement) ===
          // Frequency: 0.35 | Speed: 1.4 | Amplitude: 0.06
          float wave4 = sin(pos.y * 0.35 + time * 1.4) * 0.06;
          
          // Diagonal medium wave
          // Frequency: 0.15 on x, 0.3 on y | Speed: 1.1 | Amplitude: 0.05
          float wave5 = sin((pos.x * 0.15 - pos.y * 0.3) - time * 1.1) * 0.05;
          
          // === VISIBLE RIPPLES (High frequency, higher amplitude for visibility) ===
          // First ripple layer
          // Frequency: 1.5 | Speed: 2.8 | Amplitude: 0.045 (increased for visibility)
          float ripple1 = sin(pos.y * 1.5 + time * 2.8) * 0.045;
          
          // Second ripple with diagonal movement
          // Frequency: 0.9 on x, 1.8 on y | Speed: 3.2 | Amplitude: 0.04
          float ripple2 = sin((pos.x * 0.9 + pos.y * 1.8) - time * 3.2) * 0.04;
          
          // Third ripple layer
          // Frequency: 2.2 | Speed: 3.8 | Amplitude: 0.035
          float ripple3 = sin(pos.y * 2.2 + pos.x * 0.6 + time * 3.8) * 0.035;
          
          // Fourth ripple with opposite direction
          // Frequency: 1.4 on x, 2.0 on y | Speed: 3.5 | Amplitude: 0.038
          float ripple4 = sin((pos.x * 1.4 - pos.y * 2.0) + time * 3.5) * 0.038;
          
          // === FINE DETAIL (Very small, fast ripples) ===
          // High frequency detail
          // Frequency: 4.0 | Speed: 5.5 | Amplitude: 0.015
          float detail1 = sin(pos.y * 4.0 + time * 5.5) * 0.025;
          
          // Cross detail
          // Frequency: 2.5 on x, 3.5 on y | Speed: 6.0 | Amplitude: 0.012
          float detail2 = sin((pos.x * 2.5 + pos.y * 3.5) - time * 6.0) * 0.012;
          
          // Combine all waves
          pos.z = wave1 + wave2 + wave3 + wave4 + wave5 + ripple1 + ripple2 + ripple3 + ripple4 + detail1 + detail2;
          vWaveHeight = pos.z;
          
          // Calculate normals for lighting (don't modify unless you know what you're doing)
          float offset = 0.1;
          vec3 posX = vec3(position.x + offset, position.y, 0.0);
          vec3 posY = vec3(position.x, position.y + offset, 0.0);
          
          float waveX1 = sin(posX.y * 0.15 + time * 0.8) * 0.08;
          float waveX2 = sin(posX.y * 0.12 - time * 0.6) * 0.06;
          float waveX3 = sin((posX.x * 0.1 + posX.y * 0.14) + time * 0.9) * 0.05;
          posX.z = waveX1 + waveX2 + waveX3;
          
          float waveY1 = sin(posY.y * 0.15 + time * 0.8) * 0.08;
          float waveY2 = sin(posY.y * 0.12 - time * 0.6) * 0.06;
          float waveY3 = sin((posY.x * 0.1 + posY.y * 0.14) + time * 0.9) * 0.05;
          posY.z = waveY1 + waveY2 + waveY3;
          
          vec3 tangentX = normalize(posX - pos);
          vec3 tangentY = normalize(posY - pos);
          vNormal = normalize(cross(tangentX, tangentY));
          
          vPosition = pos;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 deepColor;   // Darkest base color
        uniform vec3 darkColor;   // Deep water
        uniform vec3 midColor;    // Middle tone
        uniform vec3 lightColor;  // Light highlights
        uniform vec3 foamColor;   // Brightest foam on crests
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vWaveHeight;
        
        void main() {
          // === BASE COLOR BLENDING (5 color gradient) ===
          vec3 color = deepColor;
          
          // Blend from deep to dark based on height
          // Range: -0.2 to -0.05 | Lower values = darker water in troughs
          float deepToDark = smoothstep(-0.2, -0.05, vWaveHeight);
          color = mix(deepColor, darkColor, deepToDark);
          
          // Blend to mid tone
          // Range: -0.05 to 0.05 | Strength: 0.8 (80% blend)
          float darkToMid = smoothstep(-0.05, 0.05, vWaveHeight);
          color = mix(color, midColor, darkToMid * 0.8);
          
          // Blend to light color on rising waves
          // Range: 0.04 to 0.12 | Strength: 0.6
          float midToLight = smoothstep(0.04, 0.12, vWaveHeight);
          color = mix(color, lightColor, midToLight * 0.6);
          
          // === LIGHTING ===
          // Light direction: x=0.5 (slightly right), y=1.0 (from above), z=0.3 (forward)
          vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
          float lightIntensity = max(dot(vNormal, lightDir), 0.0);
          
          // === SPECULAR HIGHLIGHTS (Shiny reflections) ===
          vec3 viewDir = normalize(cameraPosition - vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          // Power: 50.0 = sharpness of highlight (higher = sharper, lower = broader)
          float specular = pow(max(dot(vNormal, halfDir), 0.0), 50.0);
          
          // === FRESNEL EFFECT (Rim lighting on edges) ===
          // Power: 3.0 = falloff (higher = thinner rim)
          float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
          
          // === FOAM ON WAVE CRESTS ===
          // Range: 0.10 to 0.22 = where foam appears | Strength: 0.5 (50% blend)
          float foam = smoothstep(0.10, 0.22, vWaveHeight);
          color = mix(color, foamColor, foam * 0.5);
          
          // === APPLY LIGHTING TO BASE COLOR ===
          // Base brightness: 0.35 | Light contribution: 0.65 (adjust these to change overall brightness)
          color = color * (0.35 + lightIntensity * 0.65);
          
          // === ADD SPECULAR HIGHLIGHTS ===
          // Brightness: 0.7 | Extra on foam: 0.5 (makes crests shinier)
          color += vec3(1.0) * specular * (0.8 + foam * 0.5);
          
          // === ADD FRESNEL RIM LIGHT ===
          // Uses lightColor for rim | Strength: 0.3
          color += lightColor * fresnel * 0.5;
          
          // === DEPTH GRADIENT (Darker in distance) ===
          // vUv.y goes from 0 (near) to 1 (far) | Factor: 0.18 (how much darker)
          float depth = 1.0 - (vUv.y * 0.18);
          color *= depth;
          
          // === HIGHLIGHTS IN WAVE TROUGHS (Ambient light) ===
          // Range: -0.20 to -0.08 = where to add glow | Strength: 0.12
          float trough = smoothstep(-0.20, -0.08, vWaveHeight);
          color += midColor * trough * 0.12;
          
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