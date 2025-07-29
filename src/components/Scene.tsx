// src/components/Scene.tsx

import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import Tables from "./Tables";
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
