// Scene.tsx
import { Suspense, useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import Tables from "./Tables";


function CameraController() {
  const controls = useRef<any>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (controls.current) {
      const cameraDistance = 45;
      const fixedPolarAngle = Math.PI / 3.5;

      controls.current.minDistance = cameraDistance;
      controls.current.maxDistance = cameraDistance;
      controls.current.minPolarAngle = fixedPolarAngle;
      controls.current.maxPolarAngle = fixedPolarAngle;
      controls.current.enableZoom = false;
      controls.current.enablePan = false;
      controls.current.dampingFactor = 0.05; // Reduced for smoother movement
      controls.current.rotateSpeed = 0.3; // Reduced for more controlled rotation

      // Initialize camera position
      camera.position.set(-45, 40, -45);
      camera.lookAt(0, 0, 0);

      // Remove the updateCamera function from the event listener
      // This prevents duplicate camera updates
      controls.current.addEventListener("change", () => {
        camera.lookAt(0, 0, 0);
      });

      return () => {
        controls.current?.removeEventListener("change", () => {});
      };
    }
  }, [camera]);

  return <OrbitControls ref={controls} enableDamping={true} />;
}

export default function Scene() {
  return (
    <Canvas
      shadows
      camera={{ position: [-45, 40, -45], fov: 45 }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
    >
      <color attach="background" args={["#8B0000"]} />

      <PerspectiveCamera makeDefault position={[-45, 40, -45]} fov={65} />

      <CameraController />

      {/* Increased ambient light */}
      <ambientLight intensity={0.7} color="#FFF5E1" />

      {/* Adjusted main directional light for softer shadows */}
      <directionalLight
        castShadow
        position={[20, 30, 20]}
        intensity={1.1}
        color="#FFF5E1"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.001}
        shadow-radius={8} // Add blur to the shadows
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

      {/* Additional fill light */}
      <directionalLight
        position={[-20, 30, -20]}
        intensity={1.4}
        color="#FFE5B4"
      />

      {/* Rim light for depth */}
      <directionalLight
        position={[0, 10, -30]}
        intensity={0.8}
        color="#FFD700"
      />

      <Suspense fallback={null}>
        <Tables />
      </Suspense>

      {/* Lighter floor material */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#B25555" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Brighter decorative circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
        <ringGeometry args={[24.8, 25, 64]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.9} />
      </mesh>
    </Canvas>
  );
}