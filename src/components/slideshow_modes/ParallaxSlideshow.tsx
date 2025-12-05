// File: src/components/slideshow_modes/ParallaxSlideshow.tsx
// Advanced 3D venue reconstruction with spatial photo positioning

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Sphere,
  Line,
} from "@react-three/drei";
import { useRef, useState, useEffect, Suspense } from "react";
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
  eventId: string; // ⭐ Add eventId prop
  onPhotosRefresh?: () => void; // ⭐ Add refresh callback
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
      // Subtle floating only, position is determined by camera pose
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
          <shaderMaterial
            vertexShader={`
              uniform sampler2D depthMap;
              uniform float time;
              
              varying vec2 vUv;
              varying float vDepth;
              
              void main() {
                vUv = uv;
                vec4 depthColor = texture2D(depthMap, uv);
                float depth = depthColor.r;
                vDepth = depth;
                
                vec3 pos = position;
                float displacement = 0.15;
                pos.z += depth * displacement;
                pos.z += sin(time * 0.5 + position.x * 2.0) * 0.02 * depth;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
              }
            `}
            fragmentShader={`
              uniform sampler2D colorMap;
              
              varying vec2 vUv;
              varying float vDepth;
              
              void main() {
                vec4 color = texture2D(colorMap, vUv);
                float brightness = 0.85 + vDepth * 0.15;
                color.rgb *= brightness;
                gl_FragColor = color;
              }
            `}
            uniforms={{
              colorMap: { value: colorTexture },
              depthMap: { value: depthTexture },
              time: { value: 0 },
            }}
            side={THREE.DoubleSide}
          />
        ) : (
          <meshStandardMaterial
            map={colorTexture}
            side={THREE.DoubleSide}
            transparent
            opacity={0.95}
          />
        )}
      </mesh>

      {/* Confidence indicator */}
      {cameraPose && cameraPose.confidence > 0.5 && (
        <Sphere args={[0.1, 16, 16]} position={position}>
          <meshBasicMaterial
            color={cameraPose.confidence > 0.8 ? 0x00ff00 : 0xffaa00}
            transparent
            opacity={0.6}
          />
        </Sphere>
      )}
    </group>
  );
}

function ClusterVisualization({
  cluster,
}: {
  cluster: { centroid: [number, number, number]; photos: string[] };
}) {
  return (
    <group position={cluster.centroid}>
      <Sphere args={[0.3, 16, 16]}>
        <meshBasicMaterial color={0xff6b6b} transparent opacity={0.4} />
      </Sphere>
      {/* Text label would go here - simplified for now */}
    </group>
  );
}

function BoundingBox({
  bounds,
}: {
  bounds: { min: [number, number, number]; max: [number, number, number] };
}) {
  const points = [
    // Bottom rectangle
    new THREE.Vector3(bounds.min[0], bounds.min[1], bounds.min[2]),
    new THREE.Vector3(bounds.max[0], bounds.min[1], bounds.min[2]),
    new THREE.Vector3(bounds.max[0], bounds.min[1], bounds.max[2]),
    new THREE.Vector3(bounds.min[0], bounds.min[1], bounds.max[2]),
    new THREE.Vector3(bounds.min[0], bounds.min[1], bounds.min[2]),
    // Up to top
    new THREE.Vector3(bounds.min[0], bounds.max[1], bounds.min[2]),
    // Top rectangle
    new THREE.Vector3(bounds.max[0], bounds.max[1], bounds.min[2]),
    new THREE.Vector3(bounds.max[0], bounds.max[1], bounds.max[2]),
    new THREE.Vector3(bounds.min[0], bounds.max[1], bounds.max[2]),
    new THREE.Vector3(bounds.min[0], bounds.max[1], bounds.min[2]),
  ];

  return <Line points={points} color={0x00ff00} lineWidth={2} />;
}

function Scene({ photos }: { photos: Photo[] }) {
  const { camera } = useThree();
  const [reconstruction, setReconstruction] =
    useState<VenueReconstruction | null>(null);
  const [isReconstructing, setIsReconstructing] = useState(true);
  const mousePosition = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Perform venue reconstruction
  useEffect(() => {
    const performReconstruction = async () => {
      try {
        setIsReconstructing(true);
        const imageUrls = photos.map((p) => p.src);

        console.log("🏗️ Starting venue reconstruction...");
        const result = await reconstructVenue(imageUrls, (progress) => {
          console.log(`Reconstruction progress: ${progress}%`);
        });

        console.log("✅ Reconstruction complete:", result);
        setReconstruction(result);
      } catch (error) {
        console.error("❌ Reconstruction failed:", error);
        // Continue with fallback positioning
      } finally {
        setIsReconstructing(false);
      }
    };

    if (photos.length > 0) {
      performReconstruction();
    }
  }, [photos]);

  // Calculate photo positions based on reconstruction or fallback
  const getPhotoTransform = (
    photo: Photo,
    index: number,
  ): {
    position: [number, number, number];
    rotation: [number, number, number];
    pose?: CameraPoseResult;
  } => {
    if (reconstruction) {
      const pose = reconstruction.cameraPoses.get(photo.src);
      if (pose && pose.success && pose.confidence > 0.3) {
        return {
          position: pose.position,
          rotation: pose.rotation,
          pose,
        };
      }
    }

    // Fallback: spiral arrangement
    const angle = (index / photos.length) * Math.PI * 2;
    const radius = 8;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = Math.sin(index * 0.5) * 2;

    return {
      position: [x, y, z],
      rotation: [0, -angle, 0],
    };
  };

  useFrame(() => {
    if (camera) {
      camera.position.x +=
        (mousePosition.current.x * 2 - camera.position.x) * 0.05;
      camera.position.y +=
        (mousePosition.current.y * 2 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 3, 15]} fov={75} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={30}
        autoRotate={!isReconstructing}
        autoRotateSpeed={0.3}
      />

      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <pointLight position={[0, -10, 0]} intensity={0.3} color={0x4a9eff} />

      {/* Photos */}
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

      {/* Venue reconstruction visualization */}
      {reconstruction && !isReconstructing && (
        <>
          {/* Cluster markers */}
          {reconstruction.clusters.map((cluster, idx) => (
            <ClusterVisualization key={`cluster-${idx}`} cluster={cluster} />
          ))}

          {/* Bounding box */}
          <BoundingBox bounds={reconstruction.bounds} />

          {/* Ground plane for reference */}
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

      {/* Grid helper */}
      <gridHelper args={[30, 30, 0x444444, 0x222222]} position={[0, -5, 0]} />
    </>
  );
}

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
    reconstructing: true,
    positioned: 0,
    clusters: 0,
  });
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    const withDepth = photos.filter((p) => p.depthMap).length;
    setStats((prev) => ({
      ...prev,
      total: photos.length,
      withDepth,
    }));

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
          {/* ⭐ DEPTH MAP GENERATOR - Top Left */}
          <AnimatePresence>
            {showGenerator && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute top-4 left-4 z-50"
              >
                <DepthMapGenerator
                  eventId={eventId}
                  onComplete={() => {
                    console.log(
                      "✅ Depth maps generated, refreshing photos...",
                    );
                    onPhotosRefresh?.();
                    // Hide generator after completion
                    setTimeout(() => setShowGenerator(false), 3000);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ⭐ Toggle Generator Button - Only show if generator is hidden and no depth maps */}
          {!showGenerator && stats.withDepth === 0 && stats.total > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowGenerator(true)}
              className="absolute top-4 left-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg shadow-lg transition-all z-50 flex items-center gap-2"
            >
              <span>🎨</span>
              <span>Generate Depth Maps</span>
            </motion.button>
          )}

          {/* Venue Stats - Top Right */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-yellow-500/30"
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
                    className={`font-mono ${stats.withDepth > 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {stats.withDepth}
                  </span>
                </div>
                {stats.positioned > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-400">Positioned:</span>
                    <span className="font-mono text-blue-400">
                      {stats.positioned}
                    </span>
                  </div>
                )}
                {stats.clusters > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-400">Clusters:</span>
                    <span className="font-mono text-purple-400">
                      {stats.clusters}
                    </span>
                  </div>
                )}
              </div>

              {stats.withDepth > 0 && (
                <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-700">
                  Powered by Replicate Depth Anything V2
                </div>
              )}
            </div>
          </motion.div>

          {/* Controls - Bottom Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-blue-500/30"
          >
            <div className="text-white text-sm space-y-2">
              <div className="font-bold text-blue-400">🎮 Controls</div>
              <div className="text-xs space-y-1">
                <div>
                  🖱️ <span className="text-gray-400">Drag to rotate</span>
                </div>
                <div>
                  🔍 <span className="text-gray-400">Scroll to zoom</span>
                </div>
                <div>
                  🎯{" "}
                  <span className="text-gray-400">Move mouse for parallax</span>
                </div>
                <div>
                  📍{" "}
                  <span className="text-gray-400">
                    Green dots = high confidence
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Legend - Bottom Right */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30"
          >
            <div className="text-white text-xs space-y-2">
              <div className="font-bold text-purple-400">📊 Legend</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-400">High confidence pose</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-400">Medium confidence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="text-gray-400">Photo cluster</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-green-500"></div>
                  <span className="text-gray-400">Venue bounds</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Reconstruction Status */}
          {stats.reconstructing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md rounded-lg p-6 border border-yellow-500/50"
            >
              <div className="text-white text-center space-y-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto"
                />
                <div className="font-bold text-lg">Reconstructing Venue...</div>
                <div className="text-sm text-gray-400">
                  Analyzing {stats.total} photos
                </div>
              </div>
            </motion.div>
          )}

          {/* ⭐ NO DEPTH MAPS WARNING - Center overlay when no depth maps */}
          {stats.total > 0 && stats.withDepth === 0 && !showGenerator && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-1/3 left-1/2 transform -translate-x-1/2 bg-yellow-500/20 backdrop-blur-md rounded-lg p-6 border-2 border-yellow-500 max-w-md"
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
