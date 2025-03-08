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

// FPS tracking variables
let lastFrameTime = performance.now();
let frameCount = 0;
let lastFpsUpdate = performance.now();
const FPS_UPDATE_INTERVAL = 500; // Update FPS every 500ms

// UI Elements
const fpsCounter = document.getElementById('fps-counter');
const mouseCoords = document.getElementById('mouse-coords');
const canvasCoords = document.getElementById('canvas-coords');
const gridCoords = document.getElementById('grid-coords');

// Create turn counter display
const turnCounter = document.createElement('div');
turnCounter.id = 'turn-counter';
turnCounter.style.position = 'fixed';
turnCounter.style.top = '20px';
turnCounter.style.right = '20px';
turnCounter.style.padding = '10px';
turnCounter.style.borderRadius = '5px';
turnCounter.style.fontFamily = 'Arial, sans-serif';
turnCounter.style.fontWeight = 'bold';
document.body.appendChild(turnCounter);

function updateTurnCounter() {
  const turn = gameEngine.getCurrentTurn();
  const isPlayerTurn = turn % 2 === 0;
  turnCounter.style.backgroundColor = isPlayerTurn ? '#2c8c2c' : '#333333';
  turnCounter.style.color = isPlayerTurn ? '#000000' : '#FFFFFF';
  turnCounter.textContent = `Turn: ${turn}`;
}

// Bind UI elements
document.getElementById('save-state-button').addEventListener('click', () => {
  storageManager.saveState(gameEngine.getGameState());
});

document.getElementById('end-turn-button').addEventListener('click', () => {
  gameEngine.endTurn();
  updateTurnCounter();
});

let selectedUnit = null;
let moveMode = false;

// Start the rendering loop
function renderLoop() {
  const currentTime = performance.now();
  frameCount++;

  // Update FPS counter every 500ms
  if (currentTime - lastFpsUpdate > FPS_UPDATE_INTERVAL) {
    const fps = Math.round((frameCount * 1000) / (currentTime - lastFpsUpdate));
    fpsCounter.textContent = `FPS: ${fps}`;
    frameCount = 0;
    lastFpsUpdate = currentTime;
  }

  map.renderMap(); // Re-render the map each frame
  requestAnimationFrame(renderLoop);
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize game
  gameEngine.initializeGame();
  updateTurnCounter();
  renderLoop();
});

map.canvas.addEventListener('mousemove', (event) => {
  if (!moveMode || !selectedUnit) return;

  const { x, y } = getCursorPosition(event);
  const movePositions = {
    startX: selectedUnit.x,
    startY: selectedUnit.y,
    endX: x,
    endY: y,
    unit: selectedUnit
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
            endY: y,
            unit: selectedUnit
          };
          map.updateUnitMove(movePositions);
          map.startUnitMove();
        }
        break;
      }
    }
  } else {
    // Check if clicked on an enemy unit during movement
    let hitEnemy = false;
    for (let unit of map.units) {
      if (unit.isDead()) continue; // Skip dead units
      
      if (Math.abs(unit.x - x) <= unit.radius && Math.abs(unit.y - y) <= unit.radius) {
        // If clicked on enemy unit (different isNPC status)
        if (unit.isNPC !== selectedUnit.isNPC) {
          // Apply damage
          const isDead = unit.takeDamage(selectedUnit.damage);
          console.log(`${selectedUnit.label} attacks ${unit.label} for ${selectedUnit.damage} damage! ${unit.health}hp remaining`);
          if (isDead) {
            console.log(`${unit.label} has been defeated!`);
          }
          hitEnemy = true;
          break;
        }
      }
    }

    // If didn't hit an enemy, move the unit
    if (!hitEnemy && selectedUnit) {
      map.moveUnit(selectedUnit, x, y);
      gameEngine.recordUnitMove(selectedUnit);
    }

    // End movement mode
    selectedUnit = null;
    moveMode = false;
    map.endUnitMove();
    updateTurnCounter();
  }
});

// Track mouse movement across entire window
document.addEventListener('mousemove', (event) => {
  const x = event.clientX;
  const y = event.clientY;
  mouseCoords.textContent = `Mouse: (${x}, ${y})`;

  // Calculate grid coordinates if mouse is over canvas
  const rect = map.canvas.getBoundingClientRect();
  if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
    const canvasX = Math.round(x - rect.left);
    const canvasY = Math.round(y - rect.top);
    canvasCoords.textContent = `Canvas: (${canvasX}, ${canvasY})`;
    
    const gridX = Math.floor(canvasX / map.gridSize);
    const gridY = Math.floor(canvasY / map.gridSize);
    gridCoords.textContent = `Grid: (${gridX}, ${gridY})`;
  } else {
    canvasCoords.textContent = 'Canvas: (--,--)';
    gridCoords.textContent = 'Grid: (--,--)';
  }
});
