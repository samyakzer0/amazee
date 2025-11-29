
import React, { useMemo } from 'react';
import { ThreeElements } from '@react-three/fiber';
import { MazeData } from '../types';
import * as THREE from 'three';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface MazeRendererProps {
  mazeData: MazeData;
}

// Shared geometry and materials for performance
const wallGeometry = new THREE.BoxGeometry(0.96, 1.46, 0.96);
const outlineGeometry = new THREE.BoxGeometry(1, 1.5, 1);
const wallMaterial = new THREE.MeshBasicMaterial({ color: '#14b8a6' });
const outlineMaterial = new THREE.MeshBasicMaterial({ 
  color: '#0f766e', 
  side: THREE.BackSide 
});

// Wall block with dark outline using backface technique
const WallBlock: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Dark outline - slightly larger, rendered on backside */}
      <mesh geometry={outlineGeometry} material={outlineMaterial} />
      {/* Main wall block on top */}
      <mesh geometry={wallGeometry} material={wallMaterial} />
    </group>
  );
};

const MazeRenderer: React.FC<MazeRendererProps> = ({ mazeData }) => {
  const walls = useMemo(() => {
    const w: { position: [number, number, number] }[] = [];
    mazeData.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 'WALL') {
          w.push({ position: [x, 0.75, y] });
        }
      });
    });
    return w;
  }, [mazeData]);

  const floorWidth = mazeData.grid[0].length;
  const floorHeight = mazeData.grid.length;

  return (
    <group>
      {/* Floor - Soft mint green */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[floorWidth / 2 - 0.5, 0, floorHeight / 2 - 0.5]}
      >
        <planeGeometry args={[500, 500]} />
        <meshBasicMaterial color="#a7f3d0" />
      </mesh>

      {/* Walls with smooth dark outlines */}
      {walls.map((wall, i) => (
        <WallBlock key={i} position={wall.position} />
      ))}
    </group>
  );
};

export default MazeRenderer;
