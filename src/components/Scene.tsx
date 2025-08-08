// src/components/Scene.tsx

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import Tables from "./Tables";
import { Stickman } from "../../public/models/stickman/Stickman";
import * as THREE from "three";
import React from "react";

interface DecorativeElement {
  position: [number, number, number];
  scale?: number;
  rotation?: number;
}

function CameraSetup() {
  const { camera } = useThree();

  useEffect(() => {
    // Optimized camera position for ballroom view
    camera.position.set(0, 30, 50);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  }, [camera]);

  return null;
}

function BallroomChandelier({ position, scale = 1 }: DecorativeElement) {
  return (
    <group position={new THREE.Vector3(...position)} scale={scale}>
      {/* Central sphere */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.9}
          roughness={0.05}
          emissive="#FFD700"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Surrounding crystals */}
      {Array.from({ length: 8 }).map((_, index) => {
        const angle = (index * Math.PI * 2) / 8;
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * 2, -1, Math.sin(angle) * 2]}
            rotation={[0, angle, 0]}
            castShadow
          >
            <coneGeometry args={[0.3, 1.5, 6]} />
            <meshStandardMaterial
              color="#FFFFFF"
              metalness={0.9}
              roughness={0.05}
              transparent
              opacity={0.95}
              emissive="#FFFFFF"
              emissiveIntensity={0.1}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function WallSconce({ position, rotation = 0 }: DecorativeElement) {
  return (
    <group
      position={new THREE.Vector3(...position)}
      rotation={[0, rotation, 0]}
    >
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.8}
          roughness={0.2}
          emissive="#FFD700"
          emissiveIntensity={0.15}
        />
      </mesh>

      <mesh position={[0, -0.5, 0.5]} castShadow>
        <boxGeometry args={[0.5, 1, 0.3]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function AnimatedStickman() {
  const stickmanRef = useRef<THREE.Group>(null);
  const bonesRef = useRef<{ [key: string]: THREE.Bone }>({});

  useEffect(() => {
    if (!stickmanRef.current) return;

    // Find and store bone references
    stickmanRef.current.traverse((child) => {
      if (child instanceof THREE.Bone) {
        bonesRef.current[child.name] = child;
      }
    });
  }, []);

  useFrame((state) => {
    if (!stickmanRef.current || Object.keys(bonesRef.current).length === 0)
      return;

    const time = state.clock.getElapsedTime();
    const walkSpeed = 3; // Speed of walking animation
    const armSwing = 0.8; // How much arms swing
    const legSwing = 0.6; // How much legs swing

    // Walking cycle phase
    const phase = (time * walkSpeed) % (Math.PI * 2);

    // Arm animation (opposite to legs for natural walking)
    if (bonesRef.current.shoulder_l_03) {
      bonesRef.current.shoulder_l_03.rotation.x = Math.sin(phase) * armSwing;
    }
    if (bonesRef.current.shoulder_r_08) {
      bonesRef.current.shoulder_r_08.rotation.x =
        Math.sin(phase + Math.PI) * armSwing;
    }

    // Hand/forearm animation
    if (bonesRef.current.hand_l_1_04) {
      bonesRef.current.hand_l_1_04.rotation.x = Math.sin(phase) * 0.5;
    }
    if (bonesRef.current.hand_r_1_09) {
      bonesRef.current.hand_r_1_09.rotation.x = Math.sin(phase + Math.PI) * 0.5;
    }

    // Leg animation
    if (bonesRef.current.foot_l_1_019) {
      bonesRef.current.foot_l_1_019.rotation.x =
        Math.sin(phase + Math.PI) * legSwing;
    }
    if (bonesRef.current.foot_r_1_015) {
      bonesRef.current.foot_r_1_015.rotation.x = Math.sin(phase) * legSwing;
    }

    // Lower leg/knee animation
    if (bonesRef.current.foot_l_2_020) {
      const leftKnee = Math.max(0, Math.sin(phase + Math.PI) * 0.8);
      bonesRef.current.foot_l_2_020.rotation.x = leftKnee;
    }
    if (bonesRef.current.foot_r_2_016) {
      const rightKnee = Math.max(0, Math.sin(phase) * 0.8);
      bonesRef.current.foot_r_2_016.rotation.x = rightKnee;
    }

    // Body slight sway
    if (bonesRef.current.body_00) {
      bonesRef.current.body_00.rotation.z =
        Math.sin(time * walkSpeed * 2) * 0.05;
    }

    // Head slight bob
    if (bonesRef.current.head_014) {
      bonesRef.current.head_014.position.y =
        34.334815979003906 + Math.sin(time * walkSpeed * 2) * 2;
    }

    // Gentle body bobbing motion
    stickmanRef.current.position.y =
      -0.5 + Math.sin(time * walkSpeed * 2) * 0.1;
  });

  return (
    <group ref={stickmanRef} position={[0, 0, 0]}>
      <Stickman scale={[0.01, 0.01, 0.01]} castShadow receiveShadow />
    </group>
  );
}

export default function Scene({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-screen">
      <Canvas
        shadows
        camera={{
          position: [0, 30, 50],
          fov: 55,
          near: 0.1,
          far: 1000,
        }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
        style={{
          height: "100vh",
          width: "100%",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <color attach="background" args={["#FFF8DC"]} />
        <CameraSetup />

        {/* Enhanced bright ballroom lighting */}
        <ambientLight intensity={1.2} color="#FFFAF0" />

        {/* Main directional light */}
        <directionalLight
          castShadow
          position={[20, 40, 20]}
          intensity={2.0}
          color="#FFFACD"
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-far={200}
          shadow-camera-left={-60}
          shadow-camera-right={60}
          shadow-camera-top={60}
          shadow-camera-bottom={-60}
        />

        {/* Bright accent lighting from chandeliers */}
        <pointLight
          position={[0, 15, 0]}
          intensity={1.5}
          color="#FFD700"
          distance={40}
        />

        <pointLight
          position={[-20, 12, 10]}
          intensity={1.2}
          color="#FFD700"
          distance={35}
        />

        <pointLight
          position={[20, 12, 10]}
          intensity={1.2}
          color="#FFD700"
          distance={35}
        />

        {/* Main content */}
        <Suspense fallback={null}>
          <Tables />

          {/* Animated Stickman */}
          <AnimatedStickman />

          {children}
        </Suspense>

        {/* Ballroom floor */}
        <mesh
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.5, 0]}
        >
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial
            color="#8B4513"
            metalness={0.1}
            roughness={0.9}
          />
        </mesh>

        {/* Decorative floor pattern */}
        <mesh
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.48, 0]}
        >
          <ringGeometry args={[15, 17, 32]} />
          <meshStandardMaterial
            color="#DAA520"
            metalness={0.3}
            roughness={0.7}
            opacity={0.6}
            transparent
          />
        </mesh>

        {/* Chandeliers */}
        <BallroomChandelier position={[0, 12, 0]} scale={1.5} />
        <BallroomChandelier position={[-25, 10, 15]} scale={1.0} />
        <BallroomChandelier position={[25, 10, 15]} scale={1.0} />

        {/* Wall sconces */}
        <WallSconce position={[-45, 8, -20]} rotation={Math.PI / 2} />
        <WallSconce position={[45, 8, -20]} rotation={-Math.PI / 2} />
        <WallSconce position={[-45, 8, 20]} rotation={Math.PI / 2} />
        <WallSconce position={[45, 8, 20]} rotation={-Math.PI / 2} />

        {/* Back wall decorative elements */}
        <mesh position={[0, 8, -50]} receiveShadow>
          <planeGeometry args={[100, 20]} />
          <meshStandardMaterial
            color="#654321"
            metalness={0.2}
            roughness={0.8}
          />
        </mesh>

        {/* Side walls */}
        <mesh
          position={[-50, 8, 0]}
          rotation={[0, Math.PI / 2, 0]}
          receiveShadow
        >
          <planeGeometry args={[100, 20]} />
          <meshStandardMaterial
            color="#654321"
            metalness={0.2}
            roughness={0.8}
          />
        </mesh>

        <mesh
          position={[50, 8, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          receiveShadow
        >
          <planeGeometry args={[100, 20]} />
          <meshStandardMaterial
            color="#654321"
            metalness={0.2}
            roughness={0.8}
          />
        </mesh>
      </Canvas>
    </div>
  );
}
