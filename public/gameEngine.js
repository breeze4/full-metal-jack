// Define a Unit Class
class Unit {
  constructor(x, y, radius, label, isNPC = false) {
    this.x = x;
    this.y = y;
    this.radius = radius; // Defines the space occupied by the unit
    this.label = label; // New field to store the label of the unit
    this.isNPC = isNPC;
    this.color = isNPC ? '#333333' : '#2c8c2c'; // Black for NPCs, Green for players
    this.hasMoved = false; // Track if unit has moved this turn
  }

  canMove(context) {
    // Player units can only move on even turns (0, 2, 4...)
    const isCorrectTurn = this.isNPC ? 
      context.currentTurn % 2 === 1 : // NPC turns are odd
      context.currentTurn % 2 === 0;  // Player turns are even
    
    return !this.hasMoved && isCorrectTurn;
  }

  resetMoveState() {
    this.hasMoved = false;
  }
}

class NPCUnit extends Unit {
  constructor(x, y, radius, label) {
    super(x, y, radius, label, true);
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
    ];
  }

  isPlayerTurn() {
    return this.currentTurn % 2 === 0;
  }

  // Reset moved units tracking at start of turn
  startTurn() {
    this.movedUnits.clear();
    // Reset all units' move states
    this.map.units.forEach(unit => unit.resetMoveState());
  }

  // Track when a unit has moved
  recordUnitMove(unit) {
    unit.hasMoved = true; // Mark the unit as moved
    this.movedUnits.add(unit);
    this.checkEndTurnConditions();
  }

  // Validator: Check if all current turn's units have moved once
  validateAllCurrentTurnUnitsMovedOnce() {
    const isPlayerTurn = this.isPlayerTurn();
    const currentTurnUnits = this.map.units.filter(unit => 
      isPlayerTurn ? !unit.isNPC : unit.isNPC
    );
    
    const allUnitsMoved = currentTurnUnits.every(unit => unit.hasMoved);
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
    
    // Create player units
    const unit1 = new Unit(100, 100, 20, 'Soldier');
    this.map.addUnit(unit1);

    const unit2 = new Unit(140, 100, 20, 'Soldier 2');
    this.map.addUnit(unit2);

    // Create NPC units
    const npcUnit = new NPCUnit(300, 300, 20, 'Enemy Soldier');
    this.map.addUnit(npcUnit);

    const npcUnit2 = new NPCUnit(340, 300, 20, 'Enemy Soldier 2');
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
