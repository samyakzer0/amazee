
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Volume2, VolumeX, RotateCcw, Home as HomeIcon } from 'lucide-react';
import { Screen, CharacterType, GameState, MazeData } from './types';
import { generateMaze } from './services/mazeGenerator';
import { audioService } from './services/audioService';
import GameScene from './components/GameScene';

function App() {
  const [screen, setScreen] = useState<Screen>(Screen.SPLASH);
  const [character, setCharacter] = useState<CharacterType | null>(null);
  const [customMessage, setCustomMessage] = useState<string>("Island Conquered!");
  const [isMuted, setIsMuted] = useState(false);
  
  // Game Session State
  const [mazeData, setMazeData] = useState<MazeData | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const [gameKey, setGameKey] = useState(0);

  // Splash screen auto-transition
  useEffect(() => {
    if (screen === Screen.SPLASH) {
      const timer = setTimeout(() => {
        setScreen(Screen.HOME);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  const toggleMute = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  const startGame = useCallback(() => {
    if (!character) return;
    audioService.init();
    audioService.playSelect();
    
    setScreen(Screen.LOADING);

    // Simulate loading assets
    setTimeout(() => {
        // Generate new maze
        const newMaze = generateMaze(15, 15);
        setMazeData(newMaze);
        setCurrentScore(0);
        setElapsedTime(0);
        setGameKey(prev => prev + 1);
        
        setScreen(Screen.GAME);
    }, 2500);
  }, [character]);

  const handleFinish = useCallback(() => {
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }
    setScreen(Screen.RESULT);
  }, []);

  const handleScoreUpdate = useCallback((score: number) => {
    setCurrentScore(prev => prev + score);
  }, []);

  // Timer logic
  useEffect(() => {
    if (screen === Screen.GAME) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        const interval = window.setInterval(() => {
            setElapsedTime(p => p + 0.1);
        }, 100);
        intervalRef.current = interval;
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }
  }, [screen]);

  // Splash Screen - Cute turtle face
  const SplashScreen = () => (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-lime-500 relative overflow-hidden safe-area-inset">
      {/* Centered turtle emoji - responsive size */}
      <div className="text-[100px] sm:text-[120px] md:text-[150px] animate-pulse">
        🐢
      </div>
      
      {/* Logo at bottom - with safe area padding */}
      <div className="absolute bottom-16 sm:bottom-20 md:bottom-24 pb-safe">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          amazee
        </h1>
      </div>
    </div>
  );

  // Loading Screen Component  
  const LoadingScreen = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const startTime = Date.now();
        const duration = 2500;

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(newProgress);

            if (newProgress >= 100) {
                clearInterval(interval);
            }
        }, 16);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full bg-teal-500 relative overflow-hidden">
            <div className="w-72 relative">
                {/* Moving Character */}
                <div 
                    className="absolute -top-14 transition-all duration-75 ease-linear text-5xl transform -translate-x-1/2"
                    style={{ left: `${progress}%` }}
                >
                    {character === CharacterType.TURTLE ? '🐢' : '🐻'}
                </div>
                
                {/* Progress Bar Track */}
                <div className="h-4 w-full bg-teal-600 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                
                <div className="text-center mt-6 text-white/90 font-bold text-lg tracking-wide">
                    Loading...
                </div>
            </div>
        </div>
    );
  };

  // Home Screen - Duolingo inspired clean design
  const HomeScreen = () => (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden">
      {/* Main Content - Centered with flex-1 but constrained */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-12 min-h-0">
        {/* Mascot/Character Display */}
        <div className="mb-4 sm:mb-8 relative">
          {/* Shadow circle */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-6 sm:h-8 bg-gray-200 rounded-full blur-sm"></div>
          {/* Character - shows selected character or turtle by default */}
          <div className="text-6xl sm:text-7xl md:text-8xl animate-bounce" style={{ animationDuration: '2s' }}>
            {character === CharacterType.BEAR ? '🐻' : '🐢'}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-teal-500 tracking-tight mb-2 sm:mb-3">
          amazee
        </h1>
        
        {/* Tagline */}
        <p className="text-base sm:text-lg text-gray-500 font-medium">
          Collect items!
        </p>
      </div>

      {/* Bottom Section - Fixed buttons with safe area */}
      <div className="px-4 sm:px-6 pb-6 sm:pb-8 space-y-2 sm:space-y-3 max-w-md mx-auto w-full flex-shrink-0" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
        {/* Character Selection */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <button 
            onClick={() => { setCharacter(CharacterType.TURTLE); audioService.playSelect(); }}
            className={`py-3 sm:py-4 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-200 flex items-center justify-center gap-2 border-b-4 active:border-b-0 active:mt-1
              ${character === CharacterType.TURTLE 
                ? 'bg-teal-500 text-white border-teal-700' 
                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'}
            `}
          >
            <span className="text-xl sm:text-2xl">🐢</span>
            <span>S</span>
          </button>
          
          <button 
            onClick={() => { setCharacter(CharacterType.BEAR); audioService.playSelect(); }}
            className={`py-3 sm:py-4 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-200 flex items-center justify-center gap-2 border-b-4 active:border-b-0 active:mt-1
              ${character === CharacterType.BEAR 
                ? 'bg-amber-500 text-white border-amber-700' 
                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'}
            `}
          >
            <span className="text-xl sm:text-2xl">🐻</span>
            <span>Z</span>
          </button>
        </div>

        {/* Start Button */}
        <button 
          onClick={startGame}
          disabled={!character}
          className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg tracking-wide transition-all duration-200 flex items-center justify-center gap-2 border-b-4 active:border-b-0 active:mt-1 uppercase
            ${character 
              ? 'bg-teal-500 text-white border-teal-700 hover:bg-teal-600' 
              : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'}
          `}
        >
          PLAY!
        </button>

        {/* Secondary link style */}
        <button 
          onClick={() => {
            const msg = prompt("Enter your victory message:", customMessage);
            if (msg) setCustomMessage(msg);
          }}
          className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg text-teal-500 bg-white border-2 border-gray-200 hover:bg-gray-50 transition-all duration-200 border-b-4 border-b-gray-300 active:border-b-0 active:mt-1"
        >
       Finishing Message
        </button>
      </div>
    </div>
  );

  // Result Overlay
  const ResultOverlay = () => (
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center gap-6 text-center border-4 border-cyan-400 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 to-blue-400"></div>
              
              <div className="text-6xl animate-bounce mt-2">
                  {character === CharacterType.TURTLE ? '🐢' : '🐻'}
              </div>
              
              <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{customMessage}</h2>
                  <div className="h-1 w-12 bg-cyan-200 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-gray-50 p-3 rounded-xl">
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Time</div>
                      <div className="text-xl font-mono font-bold text-gray-800">{elapsedTime.toFixed(1)}s</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Items</div>
                      <div className="text-xl font-mono font-bold text-gray-800">
                          {currentScore} <span className="text-gray-400 text-sm">/ {mazeData?.collectibles.length || 0}</span>
                      </div>
                  </div>
              </div>

              <div className="flex gap-3 w-full mt-2">
                  <button 
                    onClick={() => { setScreen(Screen.HOME); audioService.playSelect(); }}
                    className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                     <HomeIcon size={18} /> Home
                  </button>
                  <button 
                    onClick={startGame}
                    className="flex-[2] py-3 px-4 rounded-xl bg-cyan-500 text-white font-semibold hover:bg-cyan-600 shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2"
                  >
                     <RotateCcw size={18} /> Replay
                  </button>
              </div>
          </div>
      </div>
  );

  return (
    <div className="w-full h-screen relative font-sans">
        {screen === Screen.SPLASH && <SplashScreen />}
        {screen === Screen.HOME && <HomeScreen />}
        {screen === Screen.LOADING && <LoadingScreen />}
        
        {(screen === Screen.GAME || screen === Screen.RESULT) && mazeData && character && (
            <div className="w-full h-full relative">
                {/* HUD */}
                <div className="absolute top-4 left-4 z-20 flex gap-3 pointer-events-none">
                     <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-3 text-gray-800">
                        <span className="text-2xl">{character === CharacterType.TURTLE ? '🐢' : '🐻'}</span>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Score</span>
                            <span className="text-lg leading-none font-bold text-teal-600">{currentScore}</span>
                        </div>
                        <div className="w-2"></div>
                        <div className="flex flex-col min-w-[3rem]">
                            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Time</span>
                            <span className="text-lg leading-none font-mono text-gray-800">{elapsedTime.toFixed(0)}s</span>
                        </div>
                     </div>
                </div>

                {/* Mobile Hint */}
                <div className="absolute bottom-8 left-0 w-full text-center z-20 pointer-events-none opacity-60 text-gray-500 text-sm md:hidden animate-pulse">
                    Swipe to move
                </div>

                {/* Controls */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <button 
                        onClick={() => setScreen(Screen.HOME)}
                        className="p-3 bg-black/5 hover:bg-black/10 backdrop-blur-md rounded-full text-gray-700 transition-colors"
                    >
                        <HomeIcon size={20} />
                    </button>
                    <button 
                        onClick={toggleMute}
                        className="p-3 bg-black/5 hover:bg-black/10 backdrop-blur-md rounded-full text-gray-700 transition-colors"
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                </div>

                <GameScene 
                    key={gameKey}
                    mazeData={mazeData} 
                    character={character} 
                    onScoreUpdate={handleScoreUpdate} 
                    onFinish={handleFinish}
                />

                {screen === Screen.RESULT && <ResultOverlay />}
            </div>
        )}
    </div>
  );
}

export default App;
