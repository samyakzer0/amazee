import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Environment, Stars } from '@react-three/drei';
import { CharacterType } from '../types';
import Player from './Player';

const FloatingBlock = ({ position, color, delay = 0, scale = 1 }: { position: [number, number, number], color: string, delay?: number, scale?: number }) => {
  const ref = useRef<any>(null);
  
  useFrame((state) => {
    if (ref.current) {
      // Gentle floating animation
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.2;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3 + delay) * 0.1;
      ref.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.2 + delay) * 0.1;
    }
  });

  return (
    <mesh ref={ref} position={position} scale={scale} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
    </mesh>
  );
};

const SceneContent = () => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <directionalLight position={[-5, 10, -5]} intensity={0.8} color="#bae6fd" />
      
      {/* Stars for a magical feel */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Decorative Maze Blocks - Left Side */}
        <FloatingBlock position={[-4, 1, -2]} color="#6ee7b7" delay={0} />
        <FloatingBlock position={[-3, -1, -1]} color="#2dd4bf" delay={1} scale={0.8} />
        <FloatingBlock position={[-5, 0, -4]} color="#99f6e4" delay={2} scale={1.2} />

        {/* Decorative Maze Blocks - Right Side */}
        <FloatingBlock position={[4, 1, -2]} color="#6ee7b7" delay={3} />
        <FloatingBlock position={[3, -1.5, -1]} color="#2dd4bf" delay={4} scale={0.8} />
        <FloatingBlock position={[5, 0.5, -3]} color="#99f6e4" delay={5} scale={1.2} />
        
        {/* Characters on display - positioned to flank the UI */}
        <group position={[-3.5, -0.5, 1]} rotation={[0, 0.5, 0]}>
            <Player position={{x:0, y:0}} type={CharacterType.TURTLE} />
        </group>
        
        <group position={[3.5, -0.5, 1]} rotation={[0, -0.5, 0]}>
            <Player position={{x:0, y:0}} type={CharacterType.BEAR} />
        </group>
      </Float>

      {/* Water Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#bae6fd" roughness={0.1} metalness={0.5} opacity={0.8} transparent />
      </mesh>
      
      <ContactShadows position={[0, -2.9, 0]} opacity={0.4} scale={20} blur={2} far={4} />
      <Environment preset="city" />
    </>
  );
};

const HomeBackground = () => {
  return (
    <div className="absolute inset-0 w-full h-full z-0 bg-gradient-to-b from-blue-100 to-blue-50">
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 45 }}>
        <SceneContent />
      </Canvas>
    </div>
  );
};

export default HomeBackground;
