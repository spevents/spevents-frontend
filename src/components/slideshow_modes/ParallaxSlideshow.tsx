// File path: src/components/slideshow_modes/ParallaxSlideshow.tsx
// Full AI-enhanced 3D parallax slideshow with depth maps

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";

interface Photo {
  id: string;
  src: string;
  createdAt: string;
  depthMap?: string; // Base64 data URL from Replicate
}

interface ParallaxSlideshowProps {
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
  const [colorTexture, setColorTexture] = useState<THREE.Texture | null>(null);
  const [depthTexture, setDepthTexture] = useState<THREE.Texture | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load textures
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();

    // Load color texture
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

    // Load depth map if available
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
          setIsLoaded(true); // Still show photo without depth
        },
      );
    } else {
      setIsLoaded(true); // Show photo without depth map
    }
  }, [photo.src, photo.depthMap]);

  // Gentle floating animation
  useFrame((state) => {
    if (meshRef.current && isLoaded) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y =
        position[1] + Math.sin(time * 0.5 + index) * 0.1;
      meshRef.current.rotation.y = Math.sin(time * 0.3 + index) * 0.05;
    }
  });

  if (!colorTexture || !isLoaded) {
    return null;
  }

  // Calculate aspect ratio
  const aspectRatio = colorTexture.image
    ? colorTexture.image.width / colorTexture.image.height
    : 1;

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[aspectRatio * 2, 2, 32, 32]} />
      {depthTexture ? (
        <shaderMaterial
          vertexShader={`
            uniform sampler2D depthMap;
            uniform float time;
            uniform vec2 mouse;
            
            varying vec2 vUv;
            varying float vDepth;
            
            void main() {
              vUv = uv;
              
              // Sample depth from depth map
              vec4 depthColor = texture2D(depthMap, uv);
              float depth = depthColor.r; // Grayscale depth
              vDepth = depth;
              
              // Create parallax effect based on mouse position
              vec3 pos = position;
              float parallaxStrength = 0.3;
              pos.z += depth * parallaxStrength * (mouse.x * 0.5);
              pos.x += depth * parallaxStrength * mouse.x * 0.2;
              pos.y += depth * parallaxStrength * mouse.y * 0.2;
              
              // Add subtle wave motion
              pos.z += sin(time * 0.5 + position.x * 2.0) * 0.05 * depth;
              
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
          `}
          fragmentShader={`
            uniform sampler2D colorMap;
            uniform float time;
            
            varying vec2 vUv;
            varying float vDepth;
            
            void main() {
              vec4 color = texture2D(colorMap, vUv);
              
              // Add subtle depth-based brightness variation
              float brightness = 0.8 + vDepth * 0.2;
              color.rgb *= brightness;
              
              // Add slight vignette based on depth
              float vignette = 1.0 - vDepth * 0.1;
              color.rgb *= vignette;
              
              gl_FragColor = color;
            }
          `}
          uniforms={{
            colorMap: { value: colorTexture },
            depthMap: { value: depthTexture },
            time: { value: 0 },
            mouse: { value: new THREE.Vector2(0, 0) },
          }}
          side={THREE.DoubleSide}
        />
      ) : (
        <meshBasicMaterial map={colorTexture} side={THREE.DoubleSide} />
      )}
    </mesh>
  );
}

function Scene({ photos }: { photos: Photo[] }) {
  const { camera } = useThree();
  const mousePosition = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Arrange photos in a spiral gallery
  const photoPositions = photos.map((_, index) => {
    const angle = (index / photos.length) * Math.PI * 2;
    const radius = 5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = Math.sin(index * 0.5) * 2; // Vary height
    return [x, y, z] as [number, number, number];
  });

  useFrame(() => {
    // Update camera based on mouse position
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

export default function ParallaxSlideshow({
  photos,
  hideUI,
}: ParallaxSlideshowProps) {
  const [depthMapStats, setDepthMapStats] = useState({
    total: 0,
    withDepth: 0,
  });

  useEffect(() => {
    const withDepth = photos.filter((p) => p.depthMap).length;
    setDepthMapStats({
      total: photos.length,
      withDepth,
    });
  }, [photos]);

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
          {/* Depth Map Stats */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4"
          >
            <div className="text-white text-sm space-y-1">
              <div className="font-bold text-yellow-500">
                AI-Enhanced Gallery
              </div>
              <div>
                {depthMapStats.withDepth} of {depthMapStats.total} photos with
                depth
              </div>
              {depthMapStats.withDepth > 0 && (
                <div className="text-xs text-gray-400 mt-2">
                  Using Replicate Depth Anything V2
                </div>
              )}
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
              <div>🎯 Move mouse for parallax</div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
