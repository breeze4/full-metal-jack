import { Unit, NPCUnit } from "./entities/unit.js";
import { Obstacle } from "./entities/obstacle.js";

export class GameEngine {
  constructor(map) {
    this.map = map;
    // TODO: eventually set this in the gameSetup
    this.gridSize = map.gridSize;
    this.state = {
      units: [],
      obstacles: [],
    };
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
    this.state.units.forEach((unit) => {
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

  validateAllCurrentTurnUnitsMovedOnce() {
    const isPlayerTurn = this.isPlayerTurn();
    const currentTurnUnits = this.state.units.filter((unit) =>
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
    console.log("[gameEngine.js] Game initialized");

    // Create player units
    const unit1 = new Unit(100, 100, 20, "Soldier");
    this.addUnit(unit1);

    const unit2 = new Unit(140, 100, 20, "Soldier 2");
    this.addUnit(unit2);

    // Create NPC units
    const npcUnit = new NPCUnit(300, 300, 20, "Enemy Soldier");
    this.addUnit(npcUnit);

    const npcUnit2 = new NPCUnit(340, 300, 20, "Enemy Soldier 2");
    this.addUnit(npcUnit2);

    const obstacle1 = new Obstacle(200, 200, 30);
    this.addObstacle(obstacle1);
  }

  endTurn() {
    console.log("[gameEngine.js] Ending turn", this.currentTurn);
    this.currentTurn++;
    this.startTurn();
  }

  getGameState() {
    return this.state;
  }

  getCurrentTurn() {
    return this.currentTurn;
  }

  addUnit(unit) {
    const x = Math.round((unit.x / this.gridSize) * this.gridSize + this.gridSize / 2);
    const y = Math.round((unit.y / this.gridSize) * this.gridSize + this.gridSize / 2);
    if (this.isPositionValid({ x, y, radius: unit.radius })) {
      this.state.units.push(unit);
      console.log(`[gameEngine.js] Added unit at (${x}, ${y}) with radius ${unit.radius}`);
    } else {
      console.error("[gameEngine.js] Invalid position to add unit due to collision or out of bounds.");
    }
  }

  addObstacle(obstacle) {
    const x = Math.round((obstacle.x / this.gridSize) * this.gridSize + this.gridSize / 2);
    const y = Math.round((obstacle.y / this.gridSize) * this.gridSize + this.gridSize / 2);
    if (this.isPositionValid(obstacle)) {
      this.state.obstacles.push(obstacle);
      console.log(`[gameEngine.js] Added obstacle at (${x}, ${y}) with radius ${obstacle.radius}`);
    } else {
      console.error("[gameEngine.js] Invalid position to add obstacle due to collision or out of bounds.");
    }
  }

  moveUnit(unit, newX, newY) {
    const { cellX, cellY, centerX, centerY } = this.resolveCellFromPoint({ x: newX, y: newY });

    console.log('[gameEngine.js] Attempting to move unit:', {
      unit: unit.label,
      from: { x: unit.x, y: unit.y },
      to: { cellX, cellY, centerX, centerY }
    });
    
    if (this.isPositionValid({ x: centerX, y: centerY, radius: unit.radius })) {
      unit.x = centerX;
      unit.y = centerY;
      console.log('[gameEngine.js] Unit moved successfully:', {
        unit: unit.label,
        position: { x: centerX, y: centerY }
      });
    } else {
      console.error('[gameEngine.js] Invalid move:', {
        unit: unit.label,
        attempted: { x: centerX, y: centerY },
        reason: 'Collision or out of bounds'
      });

    }
  }

  isPositionValid({x, y, radius}, excludeUnit = null) {
    if (!this.map.isPointWithinMap({ x, y, radius })) {
      return false;
    }
    if (this.detectCollision({ x, y, radius }, excludeUnit)) {
      return false;
    }

    return true;
  }

  // Method to detect collisions
  detectCollision(x, y, radius, excludeUnit = null) {
    for (let obstacle of this.state.obstacles) {
      if (this.checkOverlap(x, y, radius, obstacle.x, obstacle.y, obstacle.radius)) {
        console.log('[map.js] Collision detected with obstacle:', {
          position: { x, y },
          obstacle: { x: obstacle.x, y: obstacle.y }
        });
        return true;
      }
    }
    for (let unit of this.state.units) {
      if (unit !== excludeUnit && this.checkOverlap(x, y, radius, unit.x, unit.y, unit.radius)) {
        console.log('[map.js] Collision detected with unit:', {
          position: { x, y },
          collidingUnit: unit.label
        });
        return true;
      }
    }
    return false;
  }

  // Utility method to check for overlap between two circles (used for collisions)
  checkOverlap(x1, y1, r1, x2, y2, r2) {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return distance < (r1 + r2);
  }

  resolveCellFromPoint({x, y}) {
    const cellX = Math.floor(x / this.gridSize);
    const cellY = Math.floor(y / this.gridSize);
    const centerX = (cellX * this.gridSize) + this.gridSize / 2;
    const centerY = (cellY * this.gridSize) + this.gridSize / 2;
    return { cellX, cellY, centerX, centerY };
  }
}
