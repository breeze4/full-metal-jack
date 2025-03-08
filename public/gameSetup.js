import { StorageManager } from './storageManager.js';
import { Map } from './map.js';
import { GameEngine } from './gameEngine.js';

export const storageManager = new StorageManager();
export const map = new Map(1000, 800);
export const gameEngine = new GameEngine(map);

// Initialize game
gameEngine.initializeGame();

// Start the rendering loop for the map
function renderLoop() {
  map.renderMap();
  requestAnimationFrame(renderLoop);
}

renderLoop(); 