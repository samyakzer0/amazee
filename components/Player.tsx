
import React, { useRef } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import { CharacterType, Position } from '../types';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface PlayerProps {
  position: Position;
  type: CharacterType;
}

const Player: React.FC<PlayerProps> = ({ position, type }) => {
  const ref = useRef<Group>(null);
  
  useFrame((state, delta) => {
    if (ref.current) {
      // Smooth lerp to target position
      // Factor 5 provides a smooth glide (reduced from 6)
      const targetPos = new Vector3(position.x, 0.25, position.y);
      ref.current.position.lerp(targetPos, 5 * delta);
      
      // Bobbing animation
      ref.current.position.y = 0.25 + Math.sin(state.clock.elapsedTime * 10) * 0.05;
      
      // Slight rotation for life
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const TurtleParams = () => (
    <group scale={[0.4, 0.4, 0.4]}>
      {/* Shell */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1, 0.6, 1.2]} />
        <meshStandardMaterial color="#166534" />
      </mesh>
      {/* Body/Head */}
      <mesh position={[0, 0.5, 0.8]}>
         <boxGeometry args={[0.5, 0.4, 0.5]} />
         <meshStandardMaterial color="#a3e635" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.6, 0.2, 0.4]}><boxGeometry args={[0.3, 0.4, 0.3]} /><meshStandardMaterial color="#84cc16" /></mesh>
      <mesh position={[0.6, 0.2, 0.4]}><boxGeometry args={[0.3, 0.4, 0.3]} /><meshStandardMaterial color="#84cc16" /></mesh>
      <mesh position={[-0.6, 0.2, -0.4]}><boxGeometry args={[0.3, 0.4, 0.3]} /><meshStandardMaterial color="#84cc16" /></mesh>
      <mesh position={[0.6, 0.2, -0.4]}><boxGeometry args={[0.3, 0.4, 0.3]} /><meshStandardMaterial color="#84cc16" /></mesh>
    </group>
  );

  const BearParams = () => (
    <group scale={[0.45, 0.45, 0.45]}>
      {/* Body */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.9, 1.2, 0.6]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[0.8, 0.7, 0.7]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>
      {/* Ears */}
      <mesh position={[-0.3, 1.8, 0]}><boxGeometry args={[0.2, 0.2, 0.1]} /><meshStandardMaterial color="#78350f" /></mesh>
      <mesh position={[0.3, 1.8, 0]}><boxGeometry args={[0.2, 0.2, 0.1]} /><meshStandardMaterial color="#78350f" /></mesh>
      {/* Snout */}
      <mesh position={[0, 1.3, 0.4]}><boxGeometry args={[0.3, 0.2, 0.1]} /><meshStandardMaterial color="#fcd34d" /></mesh>
    </group>
  );

  return (
    <group ref={ref}>
      {type === CharacterType.TURTLE ? <TurtleParams /> : <BearParams />}
      <pointLight distance={3} intensity={0.5} color="#ffffff" position={[0, 1, 0]} />
    </group>
  );
};

export default Player;
