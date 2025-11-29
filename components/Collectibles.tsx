
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

// Helper to create an emoji texture
const useEmojiTexture = (emoji: string) => {
  return useMemo(() => {
    const size = 128; // Power of 2 for better GPU handling
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = `${size * 0.75}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Clear background (transparent)
      ctx.clearRect(0, 0, size, size);
      ctx.fillText(emoji, size / 2, size / 2 + (size * 0.05)); // Slight offset for baseline
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
      // Bobbing animation
      ref.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
      // Billboard-ish rotation (always face roughly towards camera or spin)
      ref.current.rotation.y += 0.02;
    }
  });

  return (
    <group ref={ref} position={[position.x, 0.5, position.y]}>
      <sprite scale={[0.8, 0.8, 0.8]}>
        <spriteMaterial map={texture} transparent={true} alphaTest={0.5} />
      </sprite>
      <pointLight 
        distance={2} 
        intensity={1} 
        color={type === CharacterType.TURTLE ? "#fbbf24" : "#f43f5e"} 
        decay={2}
      />
    </group>
  );
};

export const FinishGate: React.FC<{ position: Position; type: CharacterType }> = ({ position, type }) => {
    const ref = useRef<Group>(null);
    const characterRef = useRef<Group>(null);
    
    // Get the OPPOSITE character emoji
    const oppositeEmoji = type === CharacterType.TURTLE ? '🐻' : '🐢';
    const texture = useEmojiTexture(oppositeEmoji);
    
    useFrame((state) => {
        if(ref.current) {
            // Pulse effect
            const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
            ref.current.scale.set(scale, 1, scale);
        }
        if(characterRef.current) {
            // Bobbing and rotation for the character
            characterRef.current.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
            characterRef.current.rotation.y += 0.02;
        }
    })

    return (
        <group position={[position.x, 0, position.y]}>
            {/* Floor Marker */}
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.02, 0]}>
                <planeGeometry args={[0.9, 0.9]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            
            {/* Opposite Character Sprite at the finish */}
            <group ref={characterRef} position={[0, 1.2, 0]}>
                <sprite scale={[1.2, 1.2, 1.2]}>
                    <spriteMaterial map={texture} transparent={true} alphaTest={0.5} />
                </sprite>
            </group>
            
            {/* Pillars - Matte Mint */}
            <group ref={ref}>
                <mesh position={[-0.45, 1, -0.45]}>
                    <boxGeometry args={[0.1, 2, 0.1]} />
                    <meshStandardMaterial color="#2dd4bf" />
                </mesh>
                <mesh position={[0.45, 1, -0.45]}>
                    <boxGeometry args={[0.1, 2, 0.1]} />
                    <meshStandardMaterial color="#2dd4bf" />
                </mesh>
                <mesh position={[-0.45, 1, 0.45]}>
                    <boxGeometry args={[0.1, 2, 0.1]} />
                    <meshStandardMaterial color="#2dd4bf" />
                </mesh>
                <mesh position={[0.45, 1, 0.45]}>
                    <boxGeometry args={[0.1, 2, 0.1]} />
                    <meshStandardMaterial color="#2dd4bf" />
                </mesh>
            </group>
            
            {/* Central Light Source - slightly softer */}
            <pointLight position={[0, 1.5, 0]} distance={4} intensity={2} color="#2dd4bf" />
        </group>
    )
}

export default Item;
