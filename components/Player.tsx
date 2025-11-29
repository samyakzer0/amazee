
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
      const targetPos = new Vector3(position.x, 0.25, position.y);
      ref.current.position.lerp(targetPos, 8 * delta);
      ref.current.position.y = 0.25 + Math.sin(state.clock.elapsedTime * 5) * 0.03;
    }
  });

  const TurtleParams = () => (
    <group scale={[0.4, 0.4, 0.4]}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1, 0.6, 1.2]} />
        <meshBasicMaterial color="#166534" />
      </mesh>
      <mesh position={[0, 0.5, 0.8]}>
         <boxGeometry args={[0.5, 0.4, 0.5]} />
         <meshBasicMaterial color="#a3e635" />
      </mesh>
      <mesh position={[-0.6, 0.2, 0.4]}><boxGeometry args={[0.3, 0.4, 0.3]} /><meshBasicMaterial color="#84cc16" /></mesh>
      <mesh position={[0.6, 0.2, 0.4]}><boxGeometry args={[0.3, 0.4, 0.3]} /><meshBasicMaterial color="#84cc16" /></mesh>
      <mesh position={[-0.6, 0.2, -0.4]}><boxGeometry args={[0.3, 0.4, 0.3]} /><meshBasicMaterial color="#84cc16" /></mesh>
      <mesh position={[0.6, 0.2, -0.4]}><boxGeometry args={[0.3, 0.4, 0.3]} /><meshBasicMaterial color="#84cc16" /></mesh>
    </group>
  );

  const BearParams = () => (
    <group scale={[0.45, 0.45, 0.45]}>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.9, 1.2, 0.6]} />
        <meshBasicMaterial color="#78350f" />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[0.8, 0.7, 0.7]} />
        <meshBasicMaterial color="#92400e" />
      </mesh>
      <mesh position={[-0.3, 1.8, 0]}><boxGeometry args={[0.2, 0.2, 0.1]} /><meshBasicMaterial color="#78350f" /></mesh>
      <mesh position={[0.3, 1.8, 0]}><boxGeometry args={[0.2, 0.2, 0.1]} /><meshBasicMaterial color="#78350f" /></mesh>
      <mesh position={[0, 1.3, 0.4]}><boxGeometry args={[0.3, 0.2, 0.1]} /><meshBasicMaterial color="#fcd34d" /></mesh>
    </group>
  );

  return (
    <group ref={ref}>
      {type === CharacterType.TURTLE ? <TurtleParams /> : <BearParams />}
    </group>
  );
};

export default Player;
