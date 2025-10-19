import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Movement constraints
const START_Z = 10;      // Starting position (far from artwork)
const END_Z = -50;       // End position (at artwork)
const CAMERA_Y = 2;      // Camera height
const MOVEMENT_SPEED = 0.3; // Units per second when key held

export default function CameraController() {
  const { camera } = useThree();
  const targetPositionRef = useRef(new THREE.Vector3(0, CAMERA_Y, START_Z));
  const keysPressed = useRef({ forward: false, backward: false });

  // Set initial camera position
  useEffect(() => {
    camera.position.set(0, CAMERA_Y, START_Z);
    targetPositionRef.current.set(0, CAMERA_Y, START_Z);
  }, [camera]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        keysPressed.current.forward = true;
        e.preventDefault();
      }
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        keysPressed.current.backward = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        keysPressed.current.forward = false;
      }
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        keysPressed.current.backward = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Update camera position each frame
  useFrame((state, delta) => {
    const target = targetPositionRef.current;

    // Update target based on key presses
    if (keysPressed.current.forward) {
      target.z -= MOVEMENT_SPEED * delta * 60; // Move forward (toward artwork)
    }
    if (keysPressed.current.backward) {
      target.z += MOVEMENT_SPEED * delta * 60; // Move backward (away from artwork)
    }

    // Clamp target position between start and artwork
    target.z = THREE.MathUtils.clamp(target.z, END_Z, START_Z);

    // Smoothly move camera toward target (lerp for smooth movement)
    camera.position.lerp(target, 0.1);

    // Store camera position in window for Boat to access
    if (!window.cameraJourneyPosition) {
      window.cameraJourneyPosition = { z: START_Z };
    }
    window.cameraJourneyPosition.z = camera.position.z;

    // Keep camera looking slightly ahead
    const lookAtZ = camera.position.z - 7;
    camera.lookAt(0, 1, lookAtZ);
  });

  return null; // This component only controls the camera, no visual elements
}