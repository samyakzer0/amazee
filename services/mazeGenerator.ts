import { CellType, MazeData, Position } from '../types';

export const generateMaze = (width: number, height: number): MazeData => {
  // Initialize grid with walls
  // Ensure odd dimensions for the algorithm to work correctly with walls surrounding paths
  const rows = height % 2 === 0 ? height + 1 : height;
  const cols = width % 2 === 0 ? width + 1 : width;

  const grid: CellType[][] = Array(rows).fill(null).map(() => Array(cols).fill('WALL'));

  const stack: Position[] = [];
  const start: Position = { x: 1, y: 1 };
  
  grid[start.y][start.x] = 'START';
  stack.push(start);

  const directions = [
    { x: 0, y: -2 }, // Up
    { x: 2, y: 0 },  // Right
    { x: 0, y: 2 },  // Down
    { x: -2, y: 0 }  // Left
  ];

  const shuffle = <T,>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors: Position[] = [];

    const shuffledDirs = shuffle([...directions]);

    for (const dir of shuffledDirs) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;

      if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && grid[ny][nx] === 'WALL') {
        neighbors.push({ x: nx, y: ny });
        // We break here to only pick one neighbor at a time in the loop below
        // Actually, we collect all valid neighbors then pick one.
      }
    }

    // Find first valid unvisited neighbor
    let found = false;
    for (const dir of shuffledDirs) {
       const nx = current.x + dir.x;
       const ny = current.y + dir.y;
       
       if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && grid[ny][nx] === 'WALL') {
          // Carve path
          grid[ny][nx] = 'PATH';
          grid[current.y + (dir.y / 2)][current.x + (dir.x / 2)] = 'PATH';
          stack.push({ x: nx, y: ny });
          found = true;
          break;
       }
    }

    if (!found) {
      stack.pop();
    }
  }

  // Determine End Point (furthest away roughly)
  // Simple heuristic: furthest bottom-right accessible point
  let end: Position = { x: 1, y: 1 };
  let maxDist = 0;

  const collectibles: Position[] = [];

  for (let y = 1; y < rows; y++) {
    for (let x = 1; x < cols; x++) {
      if (grid[y][x] === 'PATH') {
        const dist = Math.sqrt(Math.pow(x - start.x, 2) + Math.pow(y - start.y, 2));
        if (dist > maxDist) {
          maxDist = dist;
          end = { x, y };
        }
        
        // Randomly place collectibles
        if (Math.random() > 0.92) {
            collectibles.push({x, y});
        }
      }
    }
  }
  
  // Ensure end isn't a collectible
  const filteredCollectibles = collectibles.filter(c => c.x !== end.x || c.y !== end.y);

  grid[start.y][start.x] = 'START';
  grid[end.y][end.x] = 'END';

  return {
    grid,
    start,
    end,
    collectibles: filteredCollectibles
  };
};