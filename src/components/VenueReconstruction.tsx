// File: src/components/VenueReconstruction.tsx

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  reconstructVenue,
  type VenueReconstruction,
} from "../services/depthService";

interface VenueReconstructionProps {
  photos: Array<{ url: string; id: string }>;
  onLoadProgress?: (progress: number) => void;
}

export const VenueReconstructionView: React.FC<VenueReconstructionProps> = ({
  photos,
  onLoadProgress,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const controlsRef = useRef<OrbitControls>();
  const [reconstruction, setReconstruction] =
    useState<VenueReconstruction | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    scene.fog = new THREE.Fog(0x0a0e27, 10, 50);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 5, 15);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 50;
    controlsRef.current = controls;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (
        containerRef.current &&
        renderer.domElement.parentNode === containerRef.current
      ) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Reconstruct venue from photos
  useEffect(() => {
    if (photos.length === 0) return;

    const performReconstruction = async () => {
      try {
        setLoading(true);
        const imageUrls = photos.map((p) => p.url);

        const result = await reconstructVenue(imageUrls, (prog) => {
          setProgress(prog);
          onLoadProgress?.(prog);
        });

        setReconstruction(result);
        renderReconstruction(result);
      } catch (error) {
        console.error("Failed to reconstruct venue:", error);
      } finally {
        setLoading(false);
      }
    };

    performReconstruction();
  }, [photos, onLoadProgress]);

  // Render reconstruction in 3D scene
  const renderReconstruction = (recon: VenueReconstruction) => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear existing photo meshes
    const existingPhotos = scene.children.filter(
      (child) => child.userData.isPhoto,
    );
    existingPhotos.forEach((photo) => scene.remove(photo));

    // Add photos at their estimated positions
    photos.forEach((photo, index) => {
      const pose = recon.cameraPoses.get(photo.url);
      if (!pose || !pose.success) {
        // Fallback positioning for photos without poses
        const fallbackPos = getFallbackPosition(index, photos.length);
        addPhotoToScene(scene, photo.url, fallbackPos, [0, 0, 0]);
        return;
      }

      addPhotoToScene(scene, photo.url, pose.position, pose.rotation);
    });

    // Add cluster visualization
    recon.clusters.forEach((cluster) => {
      addClusterVisualization(scene, cluster);
    });

    // Add bounding box
    addBoundingBox(scene, recon.bounds);
  };

  // Add photo mesh to scene with 3D geometry
  const addPhotoToScene = (
    scene: THREE.Scene,
    imageUrl: string,
    position: [number, number, number],
    rotation: [number, number, number],
  ) => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imageUrl, (texture) => {
      const aspect = texture.image.width / texture.image.height;
      const geometry = new THREE.PlaneGeometry(2 * aspect, 2, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(position[0], position[1], position[2]);
      mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
      mesh.userData.isPhoto = true;

      // Add glow effect
      const glowGeometry = new THREE.PlaneGeometry(2 * aspect + 0.2, 2.2, 1, 1);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x4a9eff,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      mesh.add(glow);

      scene.add(mesh);
    });
  };

  // Add cluster visualization
  const addClusterVisualization = (
    scene: THREE.Scene,
    cluster: { centroid: [number, number, number]; photos: string[] },
  ) => {
    const geometry = new THREE.SphereGeometry(0.3, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff6b6b,
      transparent: true,
      opacity: 0.6,
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(
      cluster.centroid[0],
      cluster.centroid[1],
      cluster.centroid[2],
    );
    scene.add(sphere);

    // Add text label
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.width = 256;
    canvas.height = 64;
    context.fillStyle = "#ffffff";
    context.font = "Bold 32px Arial";
    context.fillText(`${cluster.photos.length} photos`, 10, 40);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(
      cluster.centroid[0],
      cluster.centroid[1] + 1,
      cluster.centroid[2],
    );
    sprite.scale.set(2, 0.5, 1);
    scene.add(sprite);
  };

  // Add bounding box
  const addBoundingBox = (
    scene: THREE.Scene,
    bounds: { min: [number, number, number]; max: [number, number, number] },
  ) => {
    const sizeX = bounds.max[0] - bounds.min[0];
    const sizeY = bounds.max[1] - bounds.min[1];
    const sizeZ = bounds.max[2] - bounds.min[2];

    const centerX = (bounds.max[0] + bounds.min[0]) / 2;
    const centerY = (bounds.max[1] + bounds.min[1]) / 2;
    const centerZ = (bounds.max[2] + bounds.min[2]) / 2;

    const geometry = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      linewidth: 2,
    });
    const box = new THREE.LineSegments(edges, material);
    box.position.set(centerX, centerY, centerZ);
    scene.add(box);
  };

  // Fallback positioning
  const getFallbackPosition = (
    index: number,
    total: number,
  ): [number, number, number] => {
    const radius = 8;
    const angle = (index / total) * Math.PI * 2;
    return [
      Math.cos(angle) * radius,
      Math.random() * 3 - 1.5,
      Math.sin(angle) * radius,
    ];
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.8)",
            padding: "2rem",
            borderRadius: "8px",
            color: "white",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            Reconstructing Venue...
          </div>
          <div style={{ width: "200px", height: "4px", background: "#333" }}>
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#4a9eff",
                transition: "width 0.3s",
              }}
            />
          </div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
            {progress.toFixed(0)}%
          </div>
        </div>
      )}

      {reconstruction && !loading && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "rgba(0,0,0,0.7)",
            padding: "1rem",
            borderRadius: "8px",
            color: "white",
            fontSize: "0.9rem",
          }}
        >
          <div>
            <strong>Venue Stats:</strong>
          </div>
          <div>📸 Photos: {photos.length}</div>
          <div>📍 Clusters: {reconstruction.clusters.length}</div>
          <div>
            🎯 Positioned:{" "}
            {
              Array.from(reconstruction.cameraPoses.values()).filter(
                (p) => p.success,
              ).length
            }
          </div>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          background: "rgba(0,0,0,0.7)",
          padding: "1rem",
          borderRadius: "8px",
          color: "white",
        }}
      >
        <div>
          <strong>Controls:</strong>
        </div>
        <div>🖱️ Drag to rotate</div>
        <div>🔍 Scroll to zoom</div>
        <div>Right-click + drag to pan</div>
      </div>
    </div>
  );
};
