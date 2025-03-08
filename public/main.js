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
  console.log('[main.js] Save state button clicked');
  storageManager.saveState(gameEngine.getGameState());
});

document.getElementById('end-turn-button').addEventListener('click', () => {
  console.log('[main.js] End turn button clicked - Current turn:', gameEngine.getCurrentTurn());
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