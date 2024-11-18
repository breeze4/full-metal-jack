import { SoldierConfig } from './configs/soldierConfig.js';
import { WeaponConfig } from './configs/weaponConfig.js';
import { GameModeConfig } from './configs/gameModeConfig.js';
import { GameStats } from './configs/gameStats.js';
import { StorageManager } from './storageManager.js';
import { GameEngine } from './gameEngine.js';

const storageManager = new StorageManager();
const gameEngine = new GameEngine(SoldierConfig, WeaponConfig, GameModeConfig, GameStats);

// Bind UI elements
document.getElementById('save-state-button').addEventListener('click', () => {
  storageManager.saveState(gameEngine.getGameState());
});

document.getElementById('end-turn-button').addEventListener('click', () => {
  gameEngine.endTurn();
});

// Initialize game
gameEngine.initializeGame();