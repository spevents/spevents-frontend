// src/components/Tables.tsx

import { useState, useEffect } from "react";
import { Vector3 } from "three";

interface GuestFigure {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  type: "guest-male" | "guest-female";
}

interface TableLayout {
  position: [number, number, number];
  guests: GuestFigure[];
  rotation: number;
}

// MAIN STAGE COMPONENTS - Replace with imported 3D models later
function StageBase() {
  return (
    <group>
      {/* STAGE: Main platform - grounded at Y=0 */}
      <mesh position={[0, 0.6, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[12, 14, 1.2, 32]} />
        <meshStandardMaterial
          color="#D4AF37"
          metalness={0.6}
          roughness={0.2}
          emissive="#D4AF37"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* STAGE: Front accent step */}
      <mesh position={[0, 1.0, 4]} receiveShadow castShadow>
        <boxGeometry args={[24, 0.4, 6]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.7}
          roughness={0.1}
          emissive="#FFD700"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* STAGE: Decorative pillars - replace with 3D pillar models */}
      {[-8, -3, 3, 8].map((x, index) => (
        <mesh key={`stage-pillar-${index}`} position={[x, 2.5, -3]} castShadow>
          <cylinderGeometry args={[0.4, 0.5, 4, 16]} />
          <meshStandardMaterial
            color="#FFA500"
            metalness={0.8}
            roughness={0.1}
            emissive="#FFA500"
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

// BRIDE & GROOM CENTERPIECE - Replace with detailed 3D character models
function BrideGroomCenterpiece({
  position,
  rotation,
  scale,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}) {
  const modelScale = scale * 1.0;

  return (
    <group
      position={new Vector3(...position)}
      rotation={rotation}
      scale={modelScale}
    >
      {/* BRIDE: Female figure - replace with detailed bride 3D model */}
      <mesh position={[-2, 1.5, 0]} castShadow>
        <coneGeometry args={[1.5, 3, 8]} />
        <meshStandardMaterial
          color="#DC143C"
          metalness={0.3}
          roughness={0.4}
          emissive="#DC143C"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* GROOM: Male figure - replace with detailed groom 3D model */}
      <mesh position={[2, 1.5, 0]} castShadow>
        <boxGeometry args={[1.8, 3, 1.5]} />
        <meshStandardMaterial
          color="#4169E1"
          metalness={0.3}
          roughness={0.4}
          emissive="#4169E1"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* ARCH: Decorative wedding arch - replace with detailed arch 3D model */}
      <mesh position={[0, 3.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[3, 0.3, 16, 32]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.8}
          roughness={0.1}
          emissive="#FFD700"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* PLATFORM: Base platform - grounded properly */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <cylinderGeometry args={[4, 4.5, 0.4, 32]} />
        <meshStandardMaterial
          color="#D4AF37"
          metalness={0.5}
          roughness={0.3}
          emissive="#D4AF37"
          emissiveIntensity={0.05}
        />
      </mesh>
    </group>
  );
}

// GUEST FIGURES - Replace with detailed 3D character models
function GuestFigure({ position, rotation, scale, type }: GuestFigure) {
  const modelScale = scale * 1.2;

  // Consistent bright colors for male/female guests
  const color = type === "guest-male" ? "#4169E1" : "#DC143C";

  return (
    <group
      position={new Vector3(...position)}
      rotation={rotation}
      scale={modelScale}
    >
      {type === "guest-male" ? (
        /* MALE GUEST: Replace with detailed male character 3D model */
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[0.8, 1.6, 0.6]} />
          <meshStandardMaterial
            color={color}
            metalness={0.2}
            roughness={0.5}
            emissive={color}
            emissiveIntensity={0.02}
          />
        </mesh>
      ) : (
        /* FEMALE GUEST: Replace with detailed female character 3D model */
        <mesh position={[0, 0.8, 0]} castShadow>
          <coneGeometry args={[0.6, 1.6, 6]} />
          <meshStandardMaterial
            color={color}
            metalness={0.2}
            roughness={0.5}
            emissive={color}
            emissiveIntensity={0.02}
          />
        </mesh>
      )}
    </group>
  );
}

// TABLE BASES - Replace with detailed 3D table models
function TableBase({
  position,
  rotation = 0,
}: {
  position: [number, number, number];
  rotation?: number;
}) {
  return (
    <mesh
      position={new Vector3(position[0], 0.15, position[2])} // Grounded at Y=0.15
      rotation={[0, rotation, 0]}
      receiveShadow
      castShadow
    >
      {/* TABLE: Replace with detailed dining table 3D model */}
      <cylinderGeometry args={[3.5, 3.5, 0.3, 32]} />
      <meshStandardMaterial
        color="#D4AF37"
        metalness={0.4}
        roughness={0.3}
        emissive="#D4AF37"
        emissiveIntensity={0.05}
      />
    </mesh>
  );
}

export default function Tables() {
  const [tableLayouts, setTableLayouts] = useState<TableLayout[]>([]);

  useEffect(() => {
    // 9 tables positioned to match SLC Ballroom layout (3 columns)
    const tablePositions: [number, number, number][] = [
      // Left column
      [-24, 0, -8], // Front left
      [-24, 0, 8], // Middle left
      [-24, 0, 24], // Back left

      // Center column
      [0, 0, 4], // Front center
      [0, 0, 20], // Middle center
      [0, 0, 36], // Back center

      // Right column
      [24, 0, -8], // Front right
      [24, 0, 8], // Middle right
      [24, 0, 24], // Back right
    ];

    const layouts: TableLayout[] = [];

    // Generate guests for each table
    const generateGuests = (
      tablePos: [number, number, number],
      count: number,
    ): GuestFigure[] => {
      const guests: GuestFigure[] = [];
      const radius = 5;

      for (let i = 0; i < count; i++) {
        const angle = (i * (2 * Math.PI)) / count + Math.random() * 0.4;
        const distance = radius + Math.random() * 1.5;

        guests.push({
          position: [
            tablePos[0] + Math.cos(angle) * distance,
            0, // Grounded at Y=0
            tablePos[2] + Math.sin(angle) * distance,
          ],
          rotation: [0, -angle + Math.PI, 0],
          scale: 0.8 + Math.random() * 0.3,
          type: Math.random() > 0.5 ? "guest-male" : "guest-female",
        });
      }
      return guests;
    };

    // Generate layouts for all tables
    tablePositions.forEach((tablePos) => {
      const guestCount = Math.floor(Math.random() * 4) + 6; // 6-9 guests per table

      layouts.push({
        position: tablePos,
        guests: generateGuests(tablePos, guestCount),
        rotation: Math.random() * 0.3,
      });
    });

    setTableLayouts(layouts);
  }, []);

  return (
    <group>
      {/* MAIN STAGE AREA - Moved closer to front (south) for better visibility */}
      <group position={[0, 0, -25]}>
        <StageBase />

        {/* BRIDE & GROOM: Main centerpiece on stage */}
        <BrideGroomCenterpiece
          position={[0, 1.2, 0]}
          rotation={[0, Math.PI, 0]}
          scale={1.8}
        />

        {/* STAGE DECORATIONS: Side ornaments - replace with detailed 3D models */}
        {[-10, 10].map((x, index) => (
          <mesh key={`stage-decor-${index}`} position={[x, 0.5, 4]} castShadow>
            <torusGeometry args={[2, 0.4, 16, 32]} />
            <meshStandardMaterial
              color="#FFD700"
              metalness={0.8}
              roughness={0.1}
              emissive="#FFD700"
              emissiveIntensity={0.1}
            />
          </mesh>
        ))}
      </group>

      {/* DINING TABLES & GUESTS: 9 tables arranged in ballroom layout */}
      {tableLayouts.map((layout, tableIndex) => (
        <group key={tableIndex}>
          <TableBase position={layout.position} rotation={layout.rotation} />

          {layout.guests.map((guest, guestIndex) => (
            <GuestFigure key={`${tableIndex}-${guestIndex}`} {...guest} />
          ))}
        </group>
      ))}

      {/* AISLE RUNNER: Elegant path to stage - grounded properly */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -12]}>
        <planeGeometry args={[6, 30]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.3}
          roughness={0.5}
          opacity={0.9}
          transparent
          emissive="#FFD700"
          emissiveIntensity={0.02}
        />
      </mesh>
    </group>
  );
}
