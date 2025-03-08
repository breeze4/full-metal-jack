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

let selectedUnit = null;
let moveMode = false;

// Start the rendering loop
function renderLoop() {
  map.renderMap(); // Re-render the map each frame
  requestAnimationFrame(renderLoop); // Schedule the next frame
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize game
  gameEngine.initializeGame();

  renderLoop();
});

map.canvas.addEventListener('mousemove', (event) => {
  if (!moveMode || !selectedUnit) return;

  const { x, y } = getCursorPosition(event);
  const movePositions = {
    startX: selectedUnit.x,
    startY: selectedUnit.y,
    endX: x,
    endY: y
  };
  map.updateUnitMove(movePositions);

});

function getCursorPosition(event) {
  const rect = map.canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  return {
    x, y
  }
}

map.canvas.addEventListener('click', (event) => {
  const rect = map.canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (!moveMode) {
    // Check if a unit is clicked
    for (let unit of map.units) {
      if (Math.abs(unit.x - x) <= unit.radius && Math.abs(unit.y - y) <= unit.radius) {
        // Create context object with relevant information
        const context = {
          currentTurn: gameEngine.currentTurn,
          x: x,
          y: y,
          unit: unit,
          gameState: gameEngine.getGameState()
        };

        // Check if the unit allows movement
        if (unit.canMove(context)) {
          selectedUnit = unit;
          moveMode = true;
          const movePositions = {
            startX: selectedUnit.x,
            startY: selectedUnit.y,
            endX: x,
            endY: y
          };
          map.updateUnitMove(movePositions);
          map.startUnitMove();
        }
        break;
      }
    }
  } else {
    // Move the selected unit to the clicked position
    if (selectedUnit) {
      map.moveUnit(selectedUnit, x, y);
      selectedUnit = null;
      moveMode = false;
      map.endUnitMove();
    }

    // Log cell coordinates when clicking in move mode
    const cellX = Math.floor(x / map.gridSize);
    const cellY = Math.floor(y / map.gridSize);
    console.log(`Clicked on cell (${cellX}, ${cellY})`);
  }
});
