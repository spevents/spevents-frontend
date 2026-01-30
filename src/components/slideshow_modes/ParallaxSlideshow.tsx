// File Path: src/components/slideshow_modes/ParallaxSlideshow.tsx
// Advanced 3D venue reconstruction with spatial photo positioning

import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Sphere,
  Line,
} from "@react-three/drei";
import { useRef, useState, useEffect, Suspense, memo } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import {
  reconstructVenue,
  type VenueReconstruction,
  type CameraPoseResult,
} from "../../services/depthService";
import { DepthMapGenerator } from "../DepthMapGenerator";

interface Photo {
  id: string;
  src: string;
  createdAt: string;
  depthMap?: string;
}

interface ParallaxSlideshowProps {
  photos: Photo[];
  hideUI?: boolean;
  eventId: string;
  onPhotosRefresh?: () => void;
}

interface PhotoPlaneProps {
  photo: Photo;
  position: [number, number, number];
  rotation: [number, number, number];
  index: number;
  cameraPose?: CameraPoseResult;
}

function PhotoPlane({
  photo,
  position,
  rotation,
  index,
  cameraPose,
}: PhotoPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [colorTexture, setColorTexture] = useState<THREE.Texture | null>(null);
  const [depthTexture, setDepthTexture] = useState<THREE.Texture | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load(
      photo.src,
      (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        setColorTexture(texture);
      },
      undefined,
      (error) => console.error("Error loading color texture:", error),
    );

    if (photo.depthMap) {
      textureLoader.load(
        photo.depthMap,
        (texture) => {
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          setDepthTexture(texture);
          setIsLoaded(true);
        },
        undefined,
        (error) => {
          console.error("Error loading depth texture:", error);
          setIsLoaded(true);
        },
      );
    } else {
      setIsLoaded(true);
    }
  }, [photo.src, photo.depthMap]);

  useFrame((state) => {
    if (meshRef.current && isLoaded) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y =
        position[1] + Math.sin(time * 0.5 + index) * 0.05;
    }
  });

  if (!colorTexture || !isLoaded) {
    return null;
  }

  const aspectRatio = colorTexture.image
    ? colorTexture.image.width / colorTexture.image.height
    : 1;

  return (
    <group>
      <mesh ref={meshRef} position={position} rotation={rotation}>
        <planeGeometry args={[aspectRatio * 2, 2, 32, 32]} />
        {depthTexture ? (
          <meshStandardMaterial
            map={colorTexture}
            displacementMap={depthTexture}
            displacementScale={0.5}
            side={THREE.DoubleSide}
          />
        ) : (
          <meshStandardMaterial map={colorTexture} side={THREE.DoubleSide} />
        )}
      </mesh>

      {cameraPose && cameraPose.confidence > 0.5 && (
        <Sphere args={[0.1]} position={cameraPose.position}>
          <meshBasicMaterial color={0x00ffff} />
        </Sphere>
      )}
    </group>
  );
}

function ClusterVisualization({ cluster }: { cluster: any }) {
  return (
    <group>
      <Sphere args={[0.15]} position={cluster.centroid}>
        <meshBasicMaterial color={0xff00ff} opacity={0.6} transparent />
      </Sphere>
    </group>
  );
}

function BoundingBox({ bounds }: { bounds: any }) {
  const points = [
    new THREE.Vector3(bounds.min[0], bounds.min[1], bounds.min[2]),
    new THREE.Vector3(bounds.max[0], bounds.min[1], bounds.min[2]),
    new THREE.Vector3(bounds.max[0], bounds.max[1], bounds.min[2]),
    new THREE.Vector3(bounds.min[0], bounds.max[1], bounds.min[2]),
    new THREE.Vector3(bounds.min[0], bounds.min[1], bounds.min[2]),
    new THREE.Vector3(bounds.min[0], bounds.min[1], bounds.max[2]),
    new THREE.Vector3(bounds.max[0], bounds.min[1], bounds.max[2]),
    new THREE.Vector3(bounds.max[0], bounds.max[1], bounds.max[2]),
    new THREE.Vector3(bounds.min[0], bounds.max[1], bounds.max[2]),
    new THREE.Vector3(bounds.min[0], bounds.min[1], bounds.max[2]),
  ];

  return <Line points={points} color={0x00ff00} lineWidth={2} />;
}

const Scene = memo(function Scene({ photos }: { photos: Photo[] }) {
  const [reconstruction, setReconstruction] =
    useState<VenueReconstruction | null>(null);
  const [isReconstructing, setIsReconstructing] = useState(false);

  useEffect(() => {
    if (photos.length > 0) {
      const photosWithDepth = photos.filter((p) => p.depthMap);

      if (photosWithDepth.length > 0) {
        setIsReconstructing(true);
        reconstructVenue(photosWithDepth.map((p) => p.src))
          .then((result) => setReconstruction(result))
          .catch(() => {})
          .finally(() => setIsReconstructing(false));
      }
    }
  }, [photos]);

  const getPhotoTransform = (
    photo: Photo,
    index: number,
  ): {
    position: [number, number, number];
    rotation: [number, number, number];
    pose?: CameraPoseResult;
  } => {
    if (reconstruction) {
      const pose = reconstruction.cameraPoses.get(photo.id);
      if (pose && pose.success && pose.confidence > 0.3) {
        return {
          position: pose.position,
          rotation: pose.rotation,
          pose,
        };
      }
    }

    const angle = (index / photos.length) * Math.PI * 2;
    const radius = 8;
    return {
      position: [
        Math.cos(angle) * radius,
        (index % 3) * 2 - 2,
        Math.sin(angle) * radius,
      ],
      rotation: [0, -angle, 0],
    };
  };

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={75} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={50}
        enablePan={true}
      />

      {photos.map((photo, index) => {
        const { position, rotation, pose } = getPhotoTransform(photo, index);
        return (
          <PhotoPlane
            key={photo.id}
            photo={photo}
            position={position}
            rotation={rotation}
            index={index}
            cameraPose={pose}
          />
        );
      })}

      {reconstruction && !isReconstructing && (
        <>
          {reconstruction.clusters.map((cluster, idx) => (
            <ClusterVisualization key={`cluster-${idx}`} cluster={cluster} />
          ))}
          <BoundingBox bounds={reconstruction.bounds} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial
              color={0x1a1a2e}
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}

      <gridHelper args={[30, 30, 0x444444, 0x222222]} position={[0, -5, 0]} />
    </>
  );
});

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={0xffaa00} />
    </mesh>
  );
}

export default function ParallaxSlideshow({
  photos,
  hideUI,
  eventId,
  onPhotosRefresh,
}: ParallaxSlideshowProps) {
  const [stats, setStats] = useState({
    total: 0,
    withDepth: 0,
  });
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    const withDepth = photos.filter((p) => p.depthMap).length;

    setStats({
      total: photos.length,
      withDepth,
    });

    // Auto-show generator if no depth maps exist
    if (photos.length > 0 && withDepth === 0) {
      setShowGenerator(true);
    }
  }, [photos]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Canvas shadows>
        <Suspense fallback={<LoadingFallback />}>
          <Scene photos={photos} />
        </Suspense>
      </Canvas>

      {!hideUI && (
        <>
          {/* Depth Map Generator */}
          <AnimatePresence>
            {showGenerator && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute top-4 left-4 z-[60]"
                style={{ pointerEvents: "auto" }}
              >
                <DepthMapGenerator
                  eventId={eventId}
                  onComplete={() => {
                    onPhotosRefresh?.();
                    setTimeout(() => setShowGenerator(false), 3000);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Generator Button */}
          {!showGenerator && stats.withDepth === 0 && stats.total > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowGenerator(true)}
              className="absolute top-4 left-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg shadow-lg transition-all z-[60] flex items-center gap-2"
              style={{ pointerEvents: "auto" }}
            >
              <span>🎨</span>
              <span>Generate Depth Maps</span>
            </motion.button>
          )}

          {/* Venue Stats - Top Right */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-yellow-500/30 z-50"
          >
            <div className="text-white text-sm space-y-2">
              <div className="font-bold text-yellow-500 flex items-center gap-2">
                <span>🏗️</span>
                <span>Venue Reconstruction</span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Total Photos:</span>
                  <span className="font-mono">{stats.total}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">With Depth Maps:</span>
                  <span
                    className={`font-mono ${
                      stats.withDepth > 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {stats.withDepth}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Controls - Bottom Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-gray-700"
          >
            <div className="text-white text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span>🖱️</span>
                <span>Drag to rotate</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔍</span>
                <span>Scroll to zoom</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✋</span>
                <span>Right-click to pan</span>
              </div>
            </div>
          </motion.div>

          {/* No Depth Maps Warning */}
          {stats.total > 0 && stats.withDepth === 0 && !showGenerator && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-1/3 left-1/2 transform -translate-x-1/2 bg-yellow-500/20 backdrop-blur-md rounded-lg p-6 border-2 border-yellow-500 max-w-md z-40"
            >
              <div className="text-center space-y-3">
                <div className="text-4xl">⚠️</div>
                <div className="text-white font-bold text-lg">
                  No Depth Maps Available
                </div>
                <div className="text-gray-300 text-sm">
                  3D venue reconstruction requires depth maps. Click the button
                  above to generate them.
                </div>
                <button
                  onClick={() => setShowGenerator(true)}
                  className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg transition-all"
                >
                  Generate Depth Maps Now
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
