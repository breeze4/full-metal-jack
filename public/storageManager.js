export class StorageManager {
  constructor() {
    this.gameState = {};
  }

  saveState(gameState) {
    console.log("Game state saved:", gameState);
    this.gameState = gameState;
  }

  resetState() {
    console.log("Resetting game state to default.");
    this.gameState = {};
  }
}