
import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree, ThreeElements } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { Vector3, Raycaster, Vector2, Plane } from 'three';
import { CharacterType, MazeData, Position } from '../types';
import MazeRenderer from './MazeRenderer';
import Player from './Player';
import Item, { FinishGate } from './Collectibles';
import { audioService } from '../services/audioService';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface GameSceneProps {
  mazeData: MazeData;
  character: CharacterType;
  onScoreUpdate: (score: number) => void;
  onFinish: () => void;
}

// Simple camera controller that follows player (no orbit controls for mobile performance)
const CameraController: React.FC<{ playerPos: Position }> = ({ playerPos }) => {
    const { camera } = useThree();
    const currentTarget = useRef(new Vector3(playerPos.x, 0, playerPos.y));
    const initialized = useRef(false);
    
    // Initialize camera position on mount
    useEffect(() => {
        if (!initialized.current) {
            const startVec = new Vector3(playerPos.x, 0, playerPos.y);
            currentTarget.current.copy(startVec);
            camera.position.set(startVec.x + 6, 10, startVec.z + 6);
            camera.lookAt(startVec);
            initialized.current = true;
        }
    }, [playerPos, camera]);

    useFrame((state, delta) => {
        const targetV = new Vector3(playerPos.x, 0, playerPos.y);
        // Smooth follow
        currentTarget.current.lerp(targetV, 6 * delta);
        
        // Update camera position to follow player
        camera.position.set(
            currentTarget.current.x + 6,
            10,
            currentTarget.current.z + 6
        );
        camera.lookAt(currentTarget.current);
    });

    return null;
}

const GameLogic: React.FC<GameSceneProps> = ({ mazeData, character, onScoreUpdate, onFinish }) => {
  const [playerPos, setPlayerPos] = useState<Position>(mazeData.start);
  const [items, setItems] = useState<Position[]>(mazeData.collectibles);
  const { camera, gl } = useThree();
  
  // Input handling refs
  const touchStart = useRef<{x: number, y: number, time: number} | null>(null);
  const raycaster = useRef(new Raycaster());
  const groundPlane = useRef(new Plane(new Vector3(0, 1, 0), 0));

  const movePlayer = useCallback((dx: number, dy: number) => {
    setPlayerPos((prev) => {
        const nextX = Math.round(prev.x + dx);
        const nextY = Math.round(prev.y + dy);

        if (
            nextY >= 0 && nextY < mazeData.grid.length &&
            nextX >= 0 && nextX < mazeData.grid[0].length &&
            mazeData.grid[nextY][nextX] !== 'WALL'
        ) {
            return { x: nextX, y: nextY };
        }
        return prev;
    });
  }, [mazeData]);

  // Move towards a target position (for tap-to-move)
  const moveTowards = useCallback((targetX: number, targetY: number) => {
    setPlayerPos((prev) => {
        const dx = targetX - prev.x;
        const dy = targetY - prev.y;
        
        // Determine primary direction
        let moveX = 0, moveY = 0;
        if (Math.abs(dx) >= Math.abs(dy)) {
            moveX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
        } else {
            moveY = dy > 0 ? 1 : dy < 0 ? -1 : 0;
        }
        
        const nextX = prev.x + moveX;
        const nextY = prev.y + moveY;
        
        if (
            nextY >= 0 && nextY < mazeData.grid.length &&
            nextX >= 0 && nextX < mazeData.grid[0].length &&
            mazeData.grid[nextY][nextX] !== 'WALL'
        ) {
            return { x: nextX, y: nextY };
        }
        return prev;
    });
  }, [mazeData]);

  // Effect to play step sound when player actually moves
  useEffect(() => {
      audioService.playStep();
  }, [playerPos]);

  // Check collisions (Collectibles & End)
  useEffect(() => {
    const itemIndex = items.findIndex(i => i.x === playerPos.x && i.y === playerPos.y);
    if (itemIndex !== -1) {
        audioService.playPickup();
        const newItems = [...items];
        newItems.splice(itemIndex, 1);
        setItems(newItems);
        onScoreUpdate(1);
    }

    if (playerPos.x === mazeData.end.x && playerPos.y === mazeData.end.y) {
        audioService.playWin();
        onFinish();
    }
  }, [playerPos, items, mazeData.end, onFinish, onScoreUpdate]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        switch(e.key) {
            case 'w': case 'ArrowUp': movePlayer(0, -1); break;
            case 's': case 'ArrowDown': movePlayer(0, 1); break;
            case 'a': case 'ArrowLeft': movePlayer(-1, 0); break;
            case 'd': case 'ArrowRight': movePlayer(1, 0); break;
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  // Touch controls - tap to move towards touch, swipe for direction
  useEffect(() => {
      const canvas = gl.domElement;
      
      const handleTouchStart = (e: TouchEvent) => {
          e.preventDefault();
          touchStart.current = { 
              x: e.touches[0].clientX, 
              y: e.touches[0].clientY,
              time: Date.now()
          };
      };
      
      const handleTouchEnd = (e: TouchEvent) => {
          e.preventDefault();
          if (!touchStart.current) return;
          
          const endX = e.changedTouches[0].clientX;
          const endY = e.changedTouches[0].clientY;
          const diffX = endX - touchStart.current.x;
          const diffY = endY - touchStart.current.y;
          const elapsed = Date.now() - touchStart.current.time;
          
          const swipeThreshold = 30;
          const tapThreshold = 15;
          
          // Check if it's a swipe
          if (Math.abs(diffX) > swipeThreshold || Math.abs(diffY) > swipeThreshold) {
              // Swipe - move in swipe direction
              if (Math.abs(diffX) > Math.abs(diffY)) {
                  movePlayer(diffX > 0 ? 1 : -1, 0);
              } else {
                  movePlayer(0, diffY > 0 ? 1 : -1);
              }
          } else if (Math.abs(diffX) < tapThreshold && Math.abs(diffY) < tapThreshold && elapsed < 300) {
              // Tap - move towards tapped position
              const rect = canvas.getBoundingClientRect();
              const x = ((endX - rect.left) / rect.width) * 2 - 1;
              const y = -((endY - rect.top) / rect.height) * 2 + 1;
              
              raycaster.current.setFromCamera(new Vector2(x, y), camera);
              const intersection = new Vector3();
              raycaster.current.ray.intersectPlane(groundPlane.current, intersection);
              
              if (intersection) {
                  const targetX = Math.round(intersection.x);
                  const targetY = Math.round(intersection.z);
                  moveTowards(targetX, targetY);
              }
          }
          
          touchStart.current = null;
      };

      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      return () => {
          canvas.removeEventListener('touchstart', handleTouchStart);
          canvas.removeEventListener('touchend', handleTouchEnd);
      }
  }, [movePlayer, moveTowards, camera, gl]);

  return (
    <>
        <OrthographicCamera makeDefault position={[8, 10, 8]} zoom={55} near={-50} far={200} />
        <CameraController playerPos={playerPos} />
        
        {/* Single ambient light only - no shadows */}
        <ambientLight intensity={1.2} />
        
        {/* Plain sky blue background */}
        <color attach="background" args={['#bae6fd']} />

        <MazeRenderer mazeData={mazeData} />
        <Player position={playerPos} type={character} />
        
        {items.map((pos) => (
            <Item key={`${pos.x}-${pos.y}`} position={pos} type={character} />
        ))}
        
        <FinishGate position={mazeData.end} type={character} />
    </>
  );
};

const GameScene: React.FC<GameSceneProps> = (props) => {
  return (
    <div className="w-full h-full relative bg-blue-50">
        <Canvas dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: 'high-performance' }}>
            <Suspense fallback={null}>
                <GameLogic {...props} />
            </Suspense>
        </Canvas>
    </div>
  );
};

// Memoize GameScene to prevent re-renders when parent timer updates
export default React.memo(GameScene);
