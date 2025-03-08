import { Unit, NPCUnit } from "./entities/unit.js";
import { Obstacle } from "./entities/obstacle.js";

export class GameEngine {
  constructor(map) {
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
    // Reset all units' states for the new turn
    this.map.units.forEach((unit) => {
      unit.resetMoveState();
      unit.hasActed = false; // Ensure hasActed is explicitly reset
      unit.actionType = null; // Clear the action type
    });
  }

  // Track when a unit has moved or acted
  recordUnitMove(unit) {
    unit.hasActed = true; // Ensure hasActed is set
    this.movedUnits.add(unit);
    this.checkEndTurnConditions();
  }

  // Validator: Check if all current turn's units have moved once
  validateAllCurrentTurnUnitsMovedOnce() {
    const isPlayerTurn = this.isPlayerTurn();
    const currentTurnUnits = this.map.units.filter((unit) =>
      isPlayerTurn ? !unit.isNPC : unit.isNPC
    );

    const allUnitsMoved = currentTurnUnits.every((unit) => unit.hasActed); // Check hasActed instead of movedUnits
    const turnOwner = isPlayerTurn ? "player" : "NPC";

    if (allUnitsMoved) {
      return {
        shouldEndTurn: true,
        message: `All ${turnOwner} units have moved. Turn will end automatically.`,
      };
    }
    return {
      shouldEndTurn: false,
      message: `${this.movedUnits.size}/${currentTurnUnits.length} ${turnOwner} units moved`,
    };
  }

  // Run all move validators
  checkEndTurnConditions() {
    for (const validator of this.moveValidators) {
      const result = validator();
      if (result.shouldEndTurn) {
        console.log("[gameEngine.js] End turn conditions met:", result.message);
        this.endTurn();
        return true;
      }
    }
    return false;
  }

  initializeGame() {
    console.log(
      "[gameEngine.js] Game initialized with config:",
      this.gameStats
    );

    // Create player units
    const unit1 = new Unit(100, 100, 20, "Soldier");
    this.map.addUnit(unit1);

    const unit2 = new Unit(140, 100, 20, "Soldier 2");
    this.map.addUnit(unit2);

    // Create NPC units
    const npcUnit = new NPCUnit(300, 300, 20, "Enemy Soldier");
    this.map.addUnit(npcUnit);

    const npcUnit2 = new NPCUnit(340, 300, 20, "Enemy Soldier 2");
    this.map.addUnit(npcUnit2);

    const obstacle1 = new Obstacle(200, 200, 30);
    this.map.addObstacle(obstacle1);
  }

  endTurn() {
    console.log("[gameEngine.js] Ending turn", this.currentTurn);
    this.currentTurn++;
    this.startTurn();
  }

  getGameState() {
    // Return the current game state for saving purposes
    return this.gameStats;
  }

  getCurrentTurn() {
    return this.currentTurn;
  }
}
