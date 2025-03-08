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
const currentPhase = document.getElementById('current-phase');
const playerUnitsList = document.getElementById('player-units');
const npcUnitsList = document.getElementById('npc-units');

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
  updateTurnOrder();
}

function updateTurnOrder() {
  const isPlayerTurn = gameEngine.isPlayerTurn();
  
  // Update current phase
  currentPhase.textContent = `Current Phase: ${isPlayerTurn ? 'Player' : 'NPC'} Turn`;
  currentPhase.style.color = isPlayerTurn ? '#90EE90' : '#FFFFFF';

  // Clear existing lists
  while (playerUnitsList.childNodes.length > 1) {
    playerUnitsList.removeChild(playerUnitsList.lastChild);
  }
  while (npcUnitsList.childNodes.length > 1) {
    npcUnitsList.removeChild(npcUnitsList.lastChild);
  }

  // Update unit lists
  gameEngine.map.units.forEach(unit => {
    if (unit.isDead()) return; // Skip dead units

    const unitElement = document.createElement('div');
    unitElement.className = `unit-item${unit.hasActed ? ' acted' : ''}`;
    
    const colorDot = document.createElement('div');
    colorDot.className = 'unit-color';
    colorDot.style.backgroundColor = unit.color;
    
    const nameSpan = document.createElement('span');
    nameSpan.textContent = unit.label;
    
    const actionSpan = document.createElement('span');
    actionSpan.className = 'action-icon';
    actionSpan.textContent = unit.hasActed ? (unit.actionType === 'move' ? '⟲' : '⚔️') : '•';
    
    unitElement.appendChild(colorDot);
    unitElement.appendChild(nameSpan);
    unitElement.appendChild(actionSpan);
    
    if (unit.isNPC) {
      npcUnitsList.appendChild(unitElement);
    } else {
      playerUnitsList.appendChild(unitElement);
    }
  });
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

  if (currentTime - lastFpsUpdate > FPS_UPDATE_INTERVAL) {
    const fps = Math.round((frameCount * 1000) / (currentTime - lastFpsUpdate));
    fpsCounter.textContent = `FPS: ${fps}`;
    frameCount = 0;
    lastFpsUpdate = currentTime;
  }

  map.renderMap();
  updateTurnOrder(); // Add turn order update to render loop
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
