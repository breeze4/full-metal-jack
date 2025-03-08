// Define a Unit Class
class Unit {
  constructor(x, y, radius, label, isNPC = false, onMove = null) {
    this.x = x;
    this.y = y;
    this.radius = radius; // Defines the space occupied by the unit
    this.label = label; // New field to store the label of the unit
    this.isNPC = isNPC;
    this.color = isNPC ? '#333333' : '#2c8c2c'; // Black for NPCs, Green for players
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
      return true;
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
    this.movedUnits = new Set();
    this.moveValidators = [
      this.validateAllCurrentTurnUnitsMovedOnce.bind(this),
      // Add more validators here as needed
    ];
  }

  isPlayerTurn() {
    return this.currentTurn % 2 === 0;
  }

  // Track when a unit has moved
  recordUnitMove(unit) {
    this.movedUnits.add(unit);
    this.checkEndTurnConditions();
  }

  // Reset moved units tracking at start of turn
  startTurn() {
    this.movedUnits.clear();
  }

  // Validator: Check if all current turn's units have moved once
  validateAllCurrentTurnUnitsMovedOnce() {
    const isPlayerTurn = this.isPlayerTurn();
    const currentTurnUnits = this.map.units.filter(unit => 
      isPlayerTurn ? !unit.isNPC : unit.isNPC
    );
    
    const allUnitsMoved = currentTurnUnits.every(unit => this.movedUnits.has(unit));
    const turnOwner = isPlayerTurn ? "player" : "NPC";
    
    if (allUnitsMoved) {
      return {
        shouldEndTurn: true,
        message: `All ${turnOwner} units have moved. Turn will end automatically.`
      };
    }
    return {
      shouldEndTurn: false,
      message: `${this.movedUnits.size}/${currentTurnUnits.length} ${turnOwner} units moved`
    };
  }

  // Run all move validators
  checkEndTurnConditions() {
    for (const validator of this.moveValidators) {
      const result = validator();
      if (result.shouldEndTurn) {
        console.log(result.message);
        this.endTurn();
        return true;
      }
    }
    return false;
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

    // Create another player unit
    const unit2 = new Unit(140, 100, 20, 'Soldier 2', false, (context) => {
      return this.currentTurn % 2 === 0;
    });
    this.map.addUnit(unit2);

    // Create an NPC unit with custom move validation
    const npcUnit = new NPCUnit(300, 300, 20, 'Enemy Soldier', (context) => {
      // NPCs only move on odd turns
      return this.currentTurn % 2 === 1;
    });
    this.map.addUnit(npcUnit);

    // Create another NPC unit
    const npcUnit2 = new NPCUnit(340, 300, 20, 'Enemy Soldier 2', (context) => {
      return this.currentTurn % 2 === 1;
    });
    this.map.addUnit(npcUnit2);

    const obstacle1 = new Obstacle(200, 200, 30);
    this.map.addObstacle(obstacle1);
  }

  endTurn() {
    console.log("Ending turn", this.currentTurn);
    this.currentTurn++;
    this.startTurn();
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
