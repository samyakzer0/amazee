
import React, { useRef, useMemo } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { Group, CanvasTexture, NearestFilter } from 'three';
import { CharacterType, Position } from '../types';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface CollectibleProps {
  position: Position;
  type: CharacterType;
}

// Helper to create an emoji texture - smaller size for mobile
const useEmojiTexture = (emoji: string) => {
  return useMemo(() => {
    const size = 64; // Smaller for mobile performance
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = `${size * 0.75}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.clearRect(0, 0, size, size);
      ctx.fillText(emoji, size / 2, size / 2 + (size * 0.05));
    }
    const texture = new CanvasTexture(canvas);
    texture.minFilter = NearestFilter;
    texture.magFilter = NearestFilter;
    return texture;
  }, [emoji]);
};

const Item: React.FC<CollectibleProps> = ({ position, type }) => {
  const ref = useRef<Group>(null);
  const emoji = type === CharacterType.TURTLE ? '🍪' : '❤️';
  const texture = useEmojiTexture(emoji);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group ref={ref} position={[position.x, 0.5, position.y]}>
      <sprite scale={[0.7, 0.7, 0.7]}>
        <spriteMaterial map={texture} transparent={true} alphaTest={0.5} />
      </sprite>
    </group>
  );
};

export const FinishGate: React.FC<{ position: Position; type: CharacterType }> = ({ position, type }) => {
    const characterRef = useRef<Group>(null);
    
    const oppositeEmoji = type === CharacterType.TURTLE ? '🐻' : '🐢';
    const texture = useEmojiTexture(oppositeEmoji);
    
    useFrame((state) => {
        if(characterRef.current) {
            characterRef.current.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.08;
        }
    })

    return (
        <group position={[position.x, 0, position.y]}>
            {/* Floor Marker */}
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.02, 0]}>
                <planeGeometry args={[0.9, 0.9]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
            
            {/* Opposite Character Sprite at the finish */}
            <group ref={characterRef} position={[0, 1.2, 0]}>
                <sprite scale={[1.0, 1.0, 1.0]}>
                    <spriteMaterial map={texture} transparent={true} alphaTest={0.5} />
                </sprite>
            </group>
            
            {/* Simple Pillars */}
            <group>
                <mesh position={[-0.45, 1, -0.45]}>
                    <boxGeometry args={[0.1, 2, 0.1]} />
                    <meshBasicMaterial color="#2dd4bf" />
                </mesh>
                <mesh position={[0.45, 1, -0.45]}>
                    <boxGeometry args={[0.1, 2, 0.1]} />
                    <meshBasicMaterial color="#2dd4bf" />
                </mesh>
                <mesh position={[-0.45, 1, 0.45]}>
                    <boxGeometry args={[0.1, 2, 0.1]} />
                    <meshBasicMaterial color="#2dd4bf" />
                </mesh>
                <mesh position={[0.45, 1, 0.45]}>
                    <boxGeometry args={[0.1, 2, 0.1]} />
                    <meshBasicMaterial color="#2dd4bf" />
                </mesh>
            </group>
        </group>
    )
}

export default Item;
