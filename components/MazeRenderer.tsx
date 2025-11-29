
import React, { useMemo } from 'react';
import { ThreeElements } from '@react-three/fiber';
import { MazeData } from '../types';
import { RoundedBox } from '@react-three/drei';
import { DoubleSide } from 'three';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface MazeRendererProps {
  mazeData: MazeData;
}

const MazeRenderer: React.FC<MazeRendererProps> = ({ mazeData }) => {
  // Memoize wall positions to avoid recalculating on every render
  const walls = useMemo(() => {
    const w: { position: [number, number, number] }[] = [];
    mazeData.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 'WALL') {
          // Walls are centered at integer coordinates, raised by half height (1.5 / 2 = 0.75)
          w.push({ position: [x, 0.75, y] });
        }
      });
    });
    return w;
  }, [mazeData]);

  // Floor dimensions (used for centering, though plane is now infinite)
  const floorWidth = mazeData.grid[0].length;
  const floorHeight = mazeData.grid.length;

  return (
    <group>
      {/* Infinite Water Surface */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[floorWidth / 2 - 0.5, 0, floorHeight / 2 - 0.5]} 
        receiveShadow
      >
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial 
            color="#bae6fd" // Light Sky Blue
            roughness={0.1} // Glossy/Wet look
            metalness={0.1} // Slight reflection
        />
      </mesh>

      {/* Walls - Plain Mint Green */}
      {walls.map((wall, i) => (
        <RoundedBox 
            key={i} 
            position={wall.position} 
            args={[1, 1.5, 1]} // Width, Height, Depth
            radius={0.05} // Smooth corners
            smoothness={1} // LOW POLY for Mobile Optimization (was 4)
            receiveShadow
            castShadow
        >
            <meshStandardMaterial 
                color="#6ee7b7" // Plain Mint (Emerald 300)
                roughness={0.9} // Matte
                metalness={0} // No reflection
            />
        </RoundedBox>
      ))}
    </group>
  );
};

export default MazeRenderer;
