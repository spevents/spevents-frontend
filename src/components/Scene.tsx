import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import Tables from "./Tables";
import * as THREE from "three";
import React from "react";


interface MandalaProps {
  position: [number, number, number];
  scale?: number;
  rotation?: number;
}


function CameraSetup() {
  const { camera } = useThree();
  
  useEffect(() => {
    // Adjusted camera position for better view of scaled objects
    camera.position.set(0, 20, 35);
    camera.lookAt(new THREE.Vector3(0, 0, -5));
  }, [camera]);
  
  return null;
}

function Mandala({ position, scale = 1, rotation = 0 }: MandalaProps) {
  return (
    <mesh
      position={new THREE.Vector3(...position)}
      rotation={[-Math.PI / 2, 0, rotation]}
      scale={scale * 0.7} // Scaled down by 30%
    >
      <ringGeometry args={[4, 4.2, 32]} />
      <meshStandardMaterial 
        color="#FCA205" 
        metalness={0.6} 
        roughness={0.2} 
        emissive="#FCA205"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

function FlowerPattern({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
  const petalCount = 8;
  const petalAngle = (2 * Math.PI) / petalCount;

  return (
    <group position={new THREE.Vector3(...position)} scale={scale * 0.7}> // Scaled down by 30%
      {Array.from({ length: petalCount }).map((_, index) => (
        <mesh
          key={index}
          position={[
            Math.cos(index * petalAngle) * 1.5, // Reduced from 2
            0,
            Math.sin(index * petalAngle) * 1.5  // Reduced from 2
          ]}
          rotation={[-Math.PI / 2, 0, index * petalAngle]}
        >
          <sphereGeometry args={[0.6, 32, 32]} /> // Reduced from 0.8
          <meshStandardMaterial
            color="#C29327"
            metalness={0.4}
            roughness={0.3}
            opacity={0.8}
            transparent
            emissive="#C29327"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function Scene({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-screen">
      <Canvas
        shadows
        camera={{ 
          position: [0, 20, 35],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
        style={{
          height: '100vh',
          width: '100%',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <color attach="background" args={["#790015"]} />
        <CameraSetup />
        
        {/* Lighting */}
        <ambientLight intensity={1.4} color="#FFF5E6" />
        <directionalLight
          castShadow
          position={[15, 25, 15]}
          intensity={2}
          color="#FFE0B2"
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={150}
          shadow-camera-left={-35}
          shadow-camera-right={35}
          shadow-camera-top={35}
          shadow-camera-bottom={-35}
        />

        {/* Main content */}
        <Suspense fallback={null}>
          <Tables />
          {children} {/* Add this line to render children */}
        </Suspense>

        {/* Scaled down floor */}
        <mesh
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.5, 0]}
        >
          <planeGeometry args={[150, 150]} /> // Reduced from 200x200
          <meshStandardMaterial 
            color="#9D0000"
            metalness={0.3}
            roughness={0.7}
            emissive="#9D0000"
            emissiveIntensity={0.05}
          />
        </mesh>

        {/* Decorative elements scaled down */}
        <group position={[0, -0.45, 0]}>
          <Mandala position={[0, 0, -20]} scale={1.6} /> // Reduced from -25 and 2
          
          {[-15, -7.5, 0, 7.5, 15].map((x, i) => ( // Reduced spacing
            <Mandala 
              key={`mandala-${i}`} 
              position={[x, 0, -8]} // Reduced from -10
              scale={0.6} // Reduced from 0.8
              rotation={i * Math.PI / 4}
            />
          ))}

          <FlowerPattern position={[-12, 0, -15]} scale={0.4} /> // Adjusted positions and scale
          <FlowerPattern position={[12, 0, -15]} scale={0.4} />
          <FlowerPattern position={[0, 0, -22]} scale={0.5} />
        </group>

        {/* Scaled down aisle */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.48, -10]}
        >
          <planeGeometry args={[4.5, 25]} /> // Reduced from 6x30
          <meshStandardMaterial 
            color="#C29327"
            metalness={0.4}
            roughness={0.3}
            opacity={0.8}
            transparent
            emissive="#C29327"
            emissiveIntensity={0.2}
          />
        </mesh>
      </Canvas>
    </div>
  );
}