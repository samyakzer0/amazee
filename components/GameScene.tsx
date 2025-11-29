
import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree, ThreeElements } from '@react-three/fiber';
import { OrthographicCamera, OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
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

// Camera controller that follows player but allows Orbit/Zoom/Pan
const CameraController: React.FC<{ playerPos: Position }> = ({ playerPos }) => {
    const { camera, gl } = useThree();
    const controlsRef = useRef<any>(null);
    
    // We track the smoothed visual position of the player to sync camera movement
    const currentLookAt = useRef(new Vector3(playerPos.x, 0, playerPos.y));
    const initialized = useRef(false);
    
    // Initialize camera target on mount
    useEffect(() => {
        if (!initialized.current && controlsRef.current) {
             const startVec = new Vector3(playerPos.x, 0, playerPos.y);
             controlsRef.current.target.copy(startVec);
             // Shift camera to maintain the default relative offset
             camera.position.add(startVec);
             initialized.current = true;
        }
    }, [playerPos, camera]);

    useFrame((state, delta) => {
        if (!controlsRef.current) return;

        const targetV = new Vector3(playerPos.x, 0, playerPos.y);
        // Smoothly interpolate current look target to player position
        const nextSmoothed = currentLookAt.current.clone().lerp(targetV, 5 * delta);
        
        // Determine how much we moved this frame
        const moveDelta = nextSmoothed.clone().sub(currentLookAt.current);
        
        // Drag both camera and controls target by this delta
        camera.position.add(moveDelta);
        controlsRef.current.target.add(moveDelta);
        
        currentLookAt.current.copy(nextSmoothed);
    });

    return <OrbitControls 
        ref={controlsRef} 
        args={[camera, gl.domElement]} 
        makeDefault 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        zoomSpeed={0.5}
        panSpeed={0.5}
        rotateSpeed={0.5}
        minZoom={10}
        maxZoom={100}
        maxPolarAngle={Math.PI / 2 - 0.05} // Prevent going below ground
    />;
}

const GameLogic: React.FC<GameSceneProps> = ({ mazeData, character, onScoreUpdate, onFinish }) => {
  const [playerPos, setPlayerPos] = useState<Position>(mazeData.start);
  const [items, setItems] = useState<Position[]>(mazeData.collectibles);
  
  // Input handling refs
  const touchStart = useRef<{x: number, y: number} | null>(null);

  const movePlayer = useCallback((dx: number, dy: number) => {
    setPlayerPos((prev) => {
        const nextX = Math.round(prev.x + dx);
        const nextY = Math.round(prev.y + dy);

        // Check bounds and walls
        if (
            nextY >= 0 && nextY < mazeData.grid.length &&
            nextX >= 0 && nextX < mazeData.grid[0].length &&
            mazeData.grid[nextY][nextX] !== 'WALL'
        ) {
            // Valid move: Play sound immediately (side effect safely outside render logic mostly,
            // but for stricter purity we should do this in a useEffect, strictly speaking.
            // However, doing it here ensures immediate feedback before render).
            // To be perfectly React clean, we can do it in useEffect based on change, 
            // but this is acceptable for game input handlers usually.
            // BETTER: Return new state, use useEffect to play sound.
            return { x: nextX, y: nextY };
        }
        return prev;
    });
  }, [mazeData]);

  // Effect to play step sound when player actually moves
  useEffect(() => {
      // Avoid playing on mount
      // We can check if it matches start pos, but simple way:
      audioService.playStep();
  }, [playerPos]);

  // Check collisions (Collectibles & End)
  useEffect(() => {
    // Check item pickup
    const itemIndex = items.findIndex(i => i.x === playerPos.x && i.y === playerPos.y);
    if (itemIndex !== -1) {
        audioService.playPickup();
        const newItems = [...items];
        newItems.splice(itemIndex, 1);
        setItems(newItems);
        onScoreUpdate(1); // Increment score by 1
    }

    // Check finish
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

  // Swipe controls
  useEffect(() => {
      const handleTouchStart = (e: TouchEvent) => {
          touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      };
      const handleTouchEnd = (e: TouchEvent) => {
          if (!touchStart.current) return;
          const endX = e.changedTouches[0].clientX;
          const endY = e.changedTouches[0].clientY;
          const diffX = endX - touchStart.current.x;
          const diffY = endY - touchStart.current.y;
          
          const threshold = 15;
          
          if (Math.abs(diffX) > Math.abs(diffY)) {
              if (Math.abs(diffX) > threshold) movePlayer(diffX > 0 ? 1 : -1, 0);
          } else {
              if (Math.abs(diffY) > threshold) movePlayer(0, diffY > 0 ? 1 : -1);
          }
          touchStart.current = null;
      };

      window.addEventListener('touchstart', handleTouchStart);
      window.addEventListener('touchend', handleTouchEnd);
      return () => {
          window.removeEventListener('touchstart', handleTouchStart);
          window.removeEventListener('touchend', handleTouchEnd);
      }
  }, [movePlayer]);

  return (
    <>
        <OrthographicCamera makeDefault position={[20, 20, 20]} zoom={40} near={-50} far={200} />
        <CameraController playerPos={playerPos} />
        
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 20, 10]} intensity={0.5} castShadow />
        <directionalLight position={[-10, 20, -10]} intensity={0.3} castShadow />
        
        <color attach="background" args={['#bae6fd']} />
        <fog attach="fog" args={['#bae6fd', 20, 60]} />

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
        <Canvas shadows dpr={[1, 2]}>
            <Suspense fallback={null}>
                <GameLogic {...props} />
            </Suspense>
        </Canvas>
    </div>
  );
};

// Memoize GameScene to prevent re-renders when parent timer updates
export default React.memo(GameScene);
