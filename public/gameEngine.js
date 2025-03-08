// Define a Unit Class
class Unit {
  constructor(x, y, radius, label, isNPC = false, onMove = null) {
    this.x = x;
    this.y = y;
    this.radius = radius; // Defines the space occupied by the unit
    this.label = label; // New field to store the label of the unit
    this.isNPC = isNPC;
    this.onMove = onMove || ((context) => true); // Default to always allow movement
  }

  canMove(context) {
    return this.onMove(context);
  }
}

class NPCUnit extends Unit {
  constructor(x, y, radius, label, onMove = null) {
    super(x, y, radius, label, true, onMove || ((context) => {
      // By default, NPCs don't allow direct movement via clicks
      return false;
    }));
    this.behavior = 'idle'; // Can be used to define different NPC behaviors
    this.detectionRange = radius * 2; // NPCs can detect units within twice their radius
  }

  // Add NPC-specific methods
  updateBehavior(newBehavior) {
    this.behavior = newBehavior;
  }
}

// Define an Obstacle Class
class Obstacle {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius; // Defines the space occupied by the obstacle
  }
}

export class GameEngine {
  constructor(soldierConfig, weaponConfig, gameModeConfig, gameStats, map) {
    this.soldierConfig = soldierConfig;
    this.weaponConfig = weaponConfig;
    this.gameModeConfig = gameModeConfig;
    this.gameStats = gameStats;
    this.map = map;
    this.currentTurn = 0;
  }

  initializeGame() {
    console.log("Game initialized with config:", this.gameStats);
    // Stub: setup initial game state from configs

    // Create a player unit with move validation
    const unit1 = new Unit(100, 100, 20, 'Soldier', false, (context) => {
      // Example validation: Check if it's the player's turn
      return this.currentTurn % 2 === 0;
    });
    this.map.addUnit(unit1);

    // Create an NPC unit with custom move validation
    const npcUnit = new NPCUnit(300, 300, 20, 'Enemy Soldier', (context) => {
      // NPCs only move on odd turns
      return this.currentTurn % 2 === 1;
    });
    this.map.addUnit(npcUnit);

    const obstacle1 = new Obstacle(200, 200, 30);
    this.map.addObstacle(obstacle1);
  }

  endTurn() {
    console.log("Ending turn", this.currentTurn);
    this.currentTurn++;
    // Stub: Handle end of turn logic, increment turn counter, etc.
  }

  getGameState() {
    // Return the current game state for saving purposes
    return this.gameStats;
  }

  getCurrentTurn() {
    return this.currentTurn;
  }
}
