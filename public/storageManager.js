export class StorageManager {
  constructor() {
    this.gameState = {};
  }

  saveState(gameState) {
    console.log("[storageManager.js] Game state saved:", gameState);
    this.gameState = gameState;
  }

  resetState() {
    console.log("[storageManager.js] Resetting game state to default.");
    this.gameState = {};
  }
}