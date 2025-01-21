import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import Tables from "./Tables";
import * as THREE from "three";

interface MandalaProps {
  position: [number, number, number];
  scale?: number;
  rotation?: number;
}

function CameraSetup() {
  const { camera } = useThree();
  
  useEffect(() => {
    // Adjusted camera position for closer view
    camera.position.set(0, 25, 40);
    camera.lookAt(new THREE.Vector3(0, 0, -5));
  }, [camera]);
  
  return null;
}

function Mandala({ position, scale = 1, rotation = 0 }: MandalaProps) {
  return (
    <mesh
      position={new THREE.Vector3(...position)}
      rotation={[-Math.PI / 2, 0, rotation]}
      scale={scale}
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
    <group position={new THREE.Vector3(...position)} scale={scale}>
      {Array.from({ length: petalCount }).map((_, index) => (
        <mesh
          key={index}
          position={[
            Math.cos(index * petalAngle) * 2,
            0,
            Math.sin(index * petalAngle) * 2
          ]}
          rotation={[-Math.PI / 2, 0, index * petalAngle]}
        >
          <sphereGeometry args={[0.8, 32, 32]} />
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

export default function Scene() {
  return (
    <div className="w-full h-screen">
    <Canvas
      shadows
      camera={{ 
        position: [0, 25, 40], // Moved closer
        fov: 60, // Wider field of view
        near: 0.1,
        far: 1000
      }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
      style={{
        height: '100vh', // Full viewport height
        width: '100%',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}
    >
      <color attach="background" args={["#790015"]} />

      <CameraSetup />
      <PerspectiveCamera 
        makeDefault 
        position={[0, 25, 40]} 
        fov={60}
        near={0.1}
        far={1000}
      />

      {/* Enhanced main lighting */}
      <ambientLight intensity={1.4} color="#FFF5E6" />

      {/* Main directional light - brighter and warmer */}
      <directionalLight
        castShadow
        position={[20, 30, 20]}
        intensity={2}
        color="#FFE0B2"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.001}
        shadow-radius={8}
        shadow-camera-far={200}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-50, 50, -50, 50, 0.1, 200]}
        />
      </directionalLight>

      {/* Side fill lights for better visibility */}
      <spotLight 
        position={[-30, 25, 20]} 
        intensity={1} 
        color="#B3E5FC" 
        angle={0.7}
        penumbra={1}
      />
      <spotLight 
        position={[30, 25, 20]} 
        intensity={1} 
        color="#FFCDD2" 
        angle={0.7}
        penumbra={1}
      />

      {/* Center fill light */}
      <pointLight position={[0, 20, 0]} intensity={1} color="#FFF5E6" />

      {/* Stage spotlight - brighter and warmer */}
      <spotLight
        position={[0, 35, -15]}
        intensity={3}
        color="#FFE0B2"
        angle={0.5}
        penumbra={0.5}
        distance={60}
        castShadow
      />

      {/* Main content */}
      <Suspense fallback={null}>
        <Tables />
      </Suspense>

      {/* Floor with enhanced visibility */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color="#9D0000"
          metalness={0.3}
          roughness={0.7}
          emissive="#9D0000"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Decorative elements */}
      <group position={[0, -0.45, 0]}>
        {/* Center stage decoration */}
        <Mandala position={[0, 0, -25]} scale={2} />
        
        {/* Side decorations with glow */}
        {[-20, -10, 0, 10, 20].map((x, i) => (
          <Mandala 
            key={`mandala-${i}`} 
            position={[x, 0, -10]} 
            scale={0.8} 
            rotation={i * Math.PI / 4}
          />
        ))}

        {/* Flower patterns */}
        <FlowerPattern position={[-15, 0, -20]} scale={0.5} />
        <FlowerPattern position={[15, 0, -20]} scale={0.5} />
        <FlowerPattern position={[0, 0, -30]} scale={0.6} />
      </group>

      {/* Glowing aisle runner */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.48, -12]}
      >
        <planeGeometry args={[6, 30]} />
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

      {/* Glowing aisle borders */}
      {[-3.5, 3.5].map((x, i) => (
        <mesh
          key={`border-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, -0.47, -12]}
        >
          <planeGeometry args={[0.3, 30]} />
          <meshStandardMaterial 
            color="#FCA205"
            metalness={0.6}
            roughness={0.2}
            opacity={0.9}
            transparent
            emissive="#FCA205"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}

      {/* Subtle ambient occlusion */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.49, 0]}
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color="#000000"
          opacity={0.05}
          transparent
          depthWrite={false}
        />
      </mesh>
    </Canvas>
    </div>
  );
}