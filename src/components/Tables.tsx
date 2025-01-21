import { useState, useEffect } from "react";
import { Vector3 } from "three";

interface TrophyFigure {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  type: "guest-male" | "guest-female";
  side: "bride" | "groom";
}

interface TableLayout {
  position: [number, number, number];
  guests: TrophyFigure[];
  rotation: number;
}

function TrophyBase({ scale = 1, side = 'neutral' }) {
  const color = side === 'groom' ? '#1B2B4B' : side === 'bride' ? '#A91C11' : '#C29327';
  
  return (
    <mesh receiveShadow castShadow position={[0, -0.1, 0]} scale={scale}>
      <cylinderGeometry args={[1.2, 1.4, 0.3, 10000]} /> // Reduced from 1.5, 1.8
      <meshStandardMaterial 
        color={color}
        metalness={0.6}
        roughness={0.2}
      />
    </mesh>
  );
}

function BrideGroomTrophy({ position, rotation, scale }: Omit<TrophyFigure, 'type' | 'side'>) {
  const modelScale = scale * 0.45; // Increased from 0.3 - make the bride and groom 50% larger
  
  return (
    <group position={new Vector3(...position)} rotation={rotation} scale={modelScale}>
      <TrophyBase scale={3} /> // Increased from 2.5
      
      {/* Bride in deep red - scaled up */}
      <mesh position={[-1.0, 1.5, 0]} castShadow> // Adjusted position for larger scale
        <sphereGeometry args={[1.1, 32, 32]} /> // Increased from 0.9
        <meshStandardMaterial 
          color="#A91C11"
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
      
      {/* Groom in navy blue - scaled up */}
      <mesh position={[1.0, 1.5, 0]} castShadow> // Adjusted position for larger scale
        <sphereGeometry args={[1.1, 32, 32]} /> // Increased from 0.9
        <meshStandardMaterial 
          color="#1B2B4B"
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* Joining hands - scaled up */}
      <mesh position={[0, 1.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 2.0, 16]} /> // Increased from 0.15 and 1.6
        <meshStandardMaterial color="#C29327" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Decorative elements - scaled up */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, index) => (
        <group
          key={`decor-${index}`}
          rotation={[0, angle, 0]}
          position={[0, 0.7, 0]}
        >
          <mesh position={[1.8, 0, 0]} castShadow> // Increased from 1.5
            <torusGeometry args={[0.35, 0.12, 16, 32]} /> // Increased from 0.3, 0.1
            <meshStandardMaterial
              color="#FCA205"
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function GuestTrophy({ position, rotation, scale, type, side }: TrophyFigure) {
  const modelScale = scale * 1.6; // Reduced from 2.2
  const color = side === 'groom' 
    ? (type === 'guest-male' ? '#1B2B4B' : '#2C4270')
    : (type === 'guest-male' ? '#9D0000' : '#EA8879');
  
  return (
    <group position={new Vector3(...position)} rotation={rotation} scale={modelScale}>
      <TrophyBase scale={1.2} side={side} /> // Reduced from 1.5
      {type === 'guest-male' ? (
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[1, 2, 1]} /> // Reduced from [1.2, 2.4, 1.2]
          <meshStandardMaterial 
            color={color}
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>
      ) : (
        <mesh position={[0, 1.2, 0]} castShadow>
          <coneGeometry args={[0.8, 2, 4]} /> // Reduced from [1, 2.4, 4]
          <meshStandardMaterial 
            color={color}
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>
      )}
    </group>
  );
}

function TableBase({
  position,
  rotation = 0,
  side,
}: {
  position: [number, number, number];
  rotation?: number;
  side: "bride" | "groom";
}) {
  return (
    <mesh
      position={new Vector3(...position)}
      rotation={[0, rotation, 0]}
      receiveShadow
    >
      <cylinderGeometry args={[2.2, 2.2, 0.2, 32]} /> // Reduced from [3, 3, 0.2, 32]
      <meshStandardMaterial
        color={side === "groom" ? "#1B2B4B" : "#9D0000"}
        metalness={0.3}
        roughness={0.7}
      />
    </mesh>
  );
}

export default function Tables() {
  const [tableLayouts, setTableLayouts] = useState<TableLayout[]>([]);

  useEffect(() => {
    // Define table positions with adjusted distances
    const groomTables: [number, number, number][] = [
      [-18, 0, -12], // Reduced from [-25, 0, -15]
      [-20, 0, 4],   // Reduced from [-28, 0, 5]
      [-15, 0, -20], // Reduced from [-20, 0, -25]
      [-17, 0, 18],  // Reduced from [-23, 0, 25]
    ];

    const brideTables: [number, number, number][] = [
      [18, 0, -12],  // Reduced from [25, 0, -15]
      [20, 0, 4],    // Reduced from [28, 0, 5]
      [15, 0, -20],  // Reduced from [20, 0, -25]
      [17, 0, 18],   // Reduced from [23, 0, 25]
    ];

    const layouts: TableLayout[] = [];

    // Generate guests with adjusted spacing
    const generateGuests = (
      tablePos: [number, number, number],
      side: "bride" | "groom",
      count: number
    ): TrophyFigure[] => {
      const guests: TrophyFigure[] = [];
      const radius = 3.5; // Reduced from 5 for tighter grouping

      for (let i = 0; i < count; i++) {
        const angle = (i * (2 * Math.PI)) / count + Math.random() * 0.6; // Reduced random variation
        const distance = radius + Math.random() * 0.8; // Reduced random distance variation

        guests.push({
          position: [
            tablePos[0] + Math.cos(angle) * distance,
            0,
            tablePos[2] + Math.sin(angle) * distance,
          ],
          rotation: [0, -angle + Math.PI, 0],
          scale: 0.7 + Math.random() * 0.2, // Reduced from 0.9 + Math.random() * 0.2
          type: Math.random() > 0.5 ? "guest-male" : "guest-female",
          side,
        });
      }
      return guests;
    };

    // Generate layouts for both sides
    [...groomTables, ...brideTables].forEach((tablePos, index) => {
      const side = index < groomTables.length ? "groom" : "bride";
      const guestCount = Math.floor(Math.random() * 3) + 3; // 3-5 guests per table

      layouts.push({
        position: tablePos,
        guests: generateGuests(tablePos, side, guestCount),
        rotation: Math.random() * 0.5,
      });
    });

    setTableLayouts(layouts);
  }, []);

  return (
    <group>
      {/* Stage with Bride & Groom Trophy - Adjusted stage size */}
      <group position={[0, 0, -20]}> // Moved closer from -25
        <mesh position={[0, -0.3, 0]} receiveShadow>
          <cylinderGeometry args={[3, 3.5, 1, 32]} /> // Reduced from [4, 4.5, 1, 32]
          <meshStandardMaterial
            color="#6B86AB"
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>

        <mesh position={[0, 0.21, 0]} receiveShadow>
          <torusGeometry args={[3.2, 0.1, 16, 64]} /> // Reduced from [4.2, 0.1, 16, 64]
          <meshStandardMaterial
            color="#C29327"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>

        <mesh position={[0, -0.6, 2]} receiveShadow>
          <boxGeometry args={[6, 0.4, 3]} /> // Reduced from [8, 0.4, 4]
          <meshStandardMaterial
            color="#6B86AB"
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>

        <BrideGroomTrophy
          position={[0, 0.7, 0]}
          rotation={[0, Math.PI, 0]}
          scale={2} // Increased from 1.6
        />
      </group>

      {/* Tables and Guests */}
      {tableLayouts.map((layout, tableIndex) => (
        <group key={tableIndex}>
          <TableBase
            position={layout.position}
            rotation={layout.rotation}
            side={tableIndex < 4 ? "groom" : "bride"}
          />

          {layout.guests.map((guest, guestIndex) => (
            <GuestTrophy key={`${tableIndex}-${guestIndex}`} {...guest} />
          ))}
        </group>
      ))}
    </group>
  );
}