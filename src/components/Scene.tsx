import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import Tables from './Tables';

export default function Scene() {
  return (
    <Canvas shadows>
      <PerspectiveCamera makeDefault position={[0, 15, 20]} />
      <OrbitControls 
        maxPolarAngle={Math.PI / 2.2}
        minDistance={10}
        maxDistance={30}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Scene Content */}
      <Suspense fallback={null}>
        <Tables />
      </Suspense>

      {/* Environment */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
    </Canvas>
  );
}
