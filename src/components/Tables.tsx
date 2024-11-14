// Tables.tsx
import { useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Vector3 } from 'three';

interface TrophyFigure {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  type: 'bride-groom' | 'guest-male' | 'guest-female';
}

function TrophyBase({ scale = 1 }) {
  return (
    <mesh receiveShadow castShadow position={[0, -0.1, 0]} scale={scale}>
      <cylinderGeometry args={[1, 1.2, 0.2, 32]} />
      <meshStandardMaterial 
        color="#FFD700"
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

function BrideGroomTrophy({ position, rotation, scale }: Omit<TrophyFigure, 'type'>) {
  const modelScale = scale * 1.5;
  
  return (
    <group position={new Vector3(...position)} rotation={rotation} scale={modelScale}>
      <TrophyBase scale={2} />
      {/* Bride in emerald green */}
      <mesh position={[-0.8, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial 
          color="#228B22"
          metalness={0.4}
          roughness={0.2}
        />
      </mesh>
      {/* Groom in deep turquoise */}
      <mesh position={[0.8, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial 
          color="#008080"
          metalness={0.4}
          roughness={0.2}
        />
      </mesh>
      {/* Joining hands in burnt orange */}
      <mesh position={[0, 1, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.6, 16]} />
        <meshStandardMaterial 
          color="#CC5500"
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

function GuestTrophy({ position, rotation, scale, type }: TrophyFigure) {
  const modelScale = scale * 1.2; // Increased base scale
  
  return (
    <group position={new Vector3(...position)} rotation={rotation} scale={modelScale}>
      <TrophyBase scale={1.2} />
      {type === 'guest-male' ? (
        // Larger male guest cube
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial 
            color="#4B5563"
            metalness={0.2}
            roughness={0.4}
          />
        </mesh>
      ) : (
        // Larger female guest pyramid
        <mesh position={[0, 1.2, 0]} castShadow>
          <coneGeometry args={[0.8, 2, 4]} />
          <meshStandardMaterial 
            color="#F472B6"
            metalness={0.2}
            roughness={0.4}
          />
        </mesh>
      )}
    </group>
  );
}


export default function Tables() {
  const [guestTables, setGuestTables] = useState<TrophyFigure[][]>([]);

  const tableRadius = 12;
  const guestRadius = 1.2
  
  useEffect(() => {
    const tables: TrophyFigure[][] = [];
    const numTables = 6;
    
    for (let i = 0; i < numTables; i++) {
      const numGuests = Math.floor(Math.random() * 4) + 2; // 2-5 guests
      const tableGuests: TrophyFigure[] = [];
      
      for (let j = 0; j < numGuests; j++) {
        const angle = (j * Math.PI * 2) / numGuests;
        tableGuests.push({
          position: [Math.cos(angle) * 0.8, 0, Math.sin(angle) * 0.8],
          rotation: [0, -angle, 0],
          scale: 0.8,
          type: Math.random() > 0.5 ? 'guest-male' : 'guest-female'
        });
      }
      tables.push(tableGuests);
    }
    setGuestTables(tables);
  }, []);

  return (
    <group>
      {/* Center Stage - Bride & Groom Trophy */}
      <BrideGroomTrophy
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={1.2}
      />
      
      {/* Surrounding Guest Tables */}
      {guestTables.map((tableGuests, tableIndex) => {
        const tableAngle = (tableIndex * Math.PI * 2) / 6;
        const tableRadius = 8;
        const tablePosition: [number, number, number] = [
          Math.cos(tableAngle) * tableRadius,
          0,
          Math.sin(tableAngle) * tableRadius
        ];
        
        return (
          <group 
            key={tableIndex} 
            position={new Vector3(...tablePosition)}
          >
            {/* Table Base */}
            <mesh position={[0, -0.3, 0]} receiveShadow>
              <cylinderGeometry args={[2, 2, 0.2, 32]} />
              <meshStandardMaterial 
                color="#4B5563"
                metalness={0.2}
                roughness={0.7}
              />
            </mesh>
            
            {/* Guest Trophies */}
            {tableGuests.map((guest, guestIndex) => {
              const guestPosition: [number, number, number] = [
                guest.position[0],
                guest.position[1],
                guest.position[2]
              ];
              
              return (
                <GuestTrophy 
                  key={`${tableIndex}-${guestIndex}`}
                  {...guest}
                  position={[
                    tablePosition[0] + guestPosition[0],
                    guestPosition[1],
                    tablePosition[2] + guestPosition[2]
                  ]}
                />
              );
            })}
          </group>
        );
      })}
    </group>
  );
}