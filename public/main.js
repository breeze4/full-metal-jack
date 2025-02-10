import { SoldierConfig } from './configs/soldierConfig.js';
import { WeaponConfig } from './configs/weaponConfig.js';
import { GameModeConfig } from './configs/gameModeConfig.js';
import { GameStats } from './configs/gameStats.js';
import { StorageManager } from './storageManager.js';
import { Map } from './map.js';
import { GameEngine } from './gameEngine.js';

const storageManager = new StorageManager();
const map = new Map(1000, 800); // Define a map of size 1000x1000
const gameEngine = new GameEngine(SoldierConfig, WeaponConfig, GameModeConfig, GameStats, map);

// Bind UI elements
document.getElementById('save-state-button').addEventListener('click', () => {
  storageManager.saveState(gameEngine.getGameState());
});

document.getElementById('end-turn-button').addEventListener('click', () => {
  gameEngine.endTurn();
});

// Initialize game
gameEngine.initializeGame();

document.addEventListener('DOMContentLoaded', () => {
  map.renderMap();
});

let selectedUnit = null;
let moveMode = false;

map.canvas.addEventListener('mousemove', (event) => {
  if (!moveMode || !selectedUnit) return;

  const rect = map.canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Clear previous line and circle
  map.ctx.clearRect(0, 0, map.width, map.height);
  map.renderMap();

  // Draw the small circle around the cursor
  map.drawCircle(x, y, 5, 'green');

  // Draw a line from the cursor to the unit
  map.ctx.beginPath();
  map.ctx.moveTo(x, y);
  map.ctx.lineTo(selectedUnit.x, selectedUnit.y);
  map.ctx.strokeStyle = 'green';
  map.ctx.stroke();

  // Log cell coordinates when clicking in move mode
  const cellX = Math.floor(x / map.gridSize);
  const cellY = Math.floor(y / map.gridSize);
  console.log(`Cursor on cell (${cellX}, ${cellY})`);
});

map.canvas.addEventListener('click', (event) => {
  const rect = map.canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (!moveMode) {
    // Check if a unit is clicked
    for (let unit of map.units) {
      if (Math.abs(unit.x - x) <= unit.radius && Math.abs(unit.y - y) <= unit.radius) {
        selectedUnit = unit;
        moveMode = true;
        break;
      }
    }
  } else {
    // Move the selected unit to the clicked position
    if (selectedUnit) {
      map.moveUnit(selectedUnit, x, y);
      map.renderMap();
      selectedUnit = null;
      moveMode = false;
    }

    // Log cell coordinates when clicking in move mode
    const cellX = Math.floor(x / map.gridSize);
    const cellY = Math.floor(y / map.gridSize);
    console.log(`Clicked on cell (${cellX}, ${cellY})`);
  }
});
