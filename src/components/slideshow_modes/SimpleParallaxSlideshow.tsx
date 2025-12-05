// File path: src/components/slideshow_modes/SimpleParallaxSlideshow.tsx
// Simple 3D gallery without AI depth maps (always works)

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";

interface Photo {
  id: string;
  src: string;
  createdAt: string;
}

interface SimpleParallaxSlideshowProps {
  photos: Photo[];
  hideUI?: boolean;
}

interface PhotoPlaneProps {
  photo: Photo;
  position: [number, number, number];
  index: number;
}

function PhotoPlane({ photo, position, index }: PhotoPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      photo.src,
      (loadedTexture) => {
        loadedTexture.minFilter = THREE.LinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;
        setTexture(loadedTexture);
      },
      undefined,
      (error) => console.error("Error loading texture:", error),
    );
  }, [photo.src]);

  // Gentle floating animation
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y =
        position[1] + Math.sin(time * 0.5 + index) * 0.1;
      meshRef.current.rotation.y = Math.sin(time * 0.3 + index) * 0.05;
    }
  });

  if (!texture) {
    return null;
  }

  // Calculate aspect ratio
  const aspectRatio = texture.image
    ? texture.image.width / texture.image.height
    : 1;

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[aspectRatio * 2, 2]} />
      <meshStandardMaterial
        map={texture}
        side={THREE.DoubleSide}
        roughness={0.5}
        metalness={0.1}
      />
    </mesh>
  );
}

function Scene({ photos }: { photos: Photo[] }) {
  // Arrange photos in a spiral gallery
  const photoPositions = photos.map((_, index) => {
    const angle = (index / photos.length) * Math.PI * 2;
    const radius = 5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = Math.sin(index * 0.5) * 2; // Vary height
    return [x, y, z] as [number, number, number];
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={75} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {photos.map((photo, index) => (
        <PhotoPlane
          key={photo.id}
          photo={photo}
          position={photoPositions[index]}
          index={index}
        />
      ))}
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full"
      />
    </div>
  );
}

export default function SimpleParallaxSlideshow({
  photos,
  hideUI,
}: SimpleParallaxSlideshowProps) {
  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* 3D Canvas */}
      <Canvas>
        <Suspense fallback={<LoadingFallback />}>
          <Scene photos={photos} />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      {!hideUI && (
        <>
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4"
          >
            <div className="text-white text-sm space-y-1">
              <div className="font-bold text-yellow-500">3D Photo Gallery</div>
              <div className="text-xs text-gray-400">
                {photos.length} photos in 3D space
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-4"
          >
            <div className="text-white text-sm space-y-2">
              <div className="font-bold">Controls:</div>
              <div>🖱️ Drag to rotate</div>
              <div>🔍 Scroll to zoom</div>
              <div>👆 Right-click and drag to pan</div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
