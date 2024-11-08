import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

const photos = {
  centerStage: {
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80',
    title: 'Sarah & James',
    description: 'The Happy Couple',
  },
  guests: [
    {
      url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&q=80',
      name: 'Emma Thompson',
      relation: "Bride's Sister",
      tableNumber: 1,
    },
    {
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80',
      name: 'Michael Chen',
      relation: "Groom's Best Friend",
      tableNumber: 2,
    },
    {
      url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80',
      name: 'Sophie Martinez',
      relation: 'College Friend',
      tableNumber: 3,
    },
  ],
};

function PhotoFrame({ position, rotation, scale, photo, hoverable = true }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Table */}
      <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
        <meshStandardMaterial color="#4B5563" />
      </mesh>
      
      {/* Photo Frame */}
      <group position={[0, 1.5, 0]}>
        <mesh
          castShadow
          onPointerOver={() => hoverable && setHovered(true)}
          onPointerOut={() => hoverable && setHovered(false)}
        >
          <boxGeometry args={[2, 3, 0.1]} />
          <meshStandardMaterial color="#D1D5DB" />
        </mesh>
        
        {/* Photo */}
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[1.8, 2.8]} />
          <meshBasicMaterial>
            <textureLoader url={photo.url} />
          </meshBasicMaterial>
        </mesh>

        {/* Tooltip */}
        {hovered && (
          <Html position={[1.2, 0, 0]}>
            <div className="bg-white p-4 rounded-lg shadow-xl w-48">
              <h3 className="font-bold text-gray-900">{photo.name || photo.title}</h3>
              <p className="text-sm text-gray-600">{photo.relation || photo.description}</p>
              {photo.tableNumber && (
                <p className="text-xs text-gray-500 mt-1">Table {photo.tableNumber}</p>
              )}
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

export default function Tables() {
  const [rotation, setRotation] = useState(0);

  useFrame(() => {
    setRotation((prev) => prev + 0.001);
  });

  return (
    <group rotation={[0, rotation, 0]}>
      {/* Center Stage */}
      <PhotoFrame
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={1.2}
        photo={photos.centerStage}
      />

      {/* Guest Tables */}
      {photos.guests.map((photo, index) => {
        const angle = (index * Math.PI * 2) / 3;
        const radius = 6;
        return (
          <PhotoFrame
            key={index}
            position={[
              Math.cos(angle) * radius,
              0,
              Math.sin(angle) * radius,
            ]}
            rotation={[0, -angle, 0]}
            scale={1}
            photo={photo}
          />
        );
      })}
    </group>
  );
}