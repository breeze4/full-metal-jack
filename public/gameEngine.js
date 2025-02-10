// Define a Unit Class
class Unit {
  constructor(x, y, radius, label) {
    this.x = x;
    this.y = y;
    this.radius = radius; // Defines the space occupied by the unit
    this.label = label; // New field to store the label of the unit
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


    const unit1 = new Unit(100, 100, 20, 'Soldier'); // Create a unit with radius 20 at position (100, 100) and label 'Soldier'
    this.map.addUnit(unit1);

    const obstacle1 = new Obstacle(200, 200, 30); // Create an obstacle with radius 30 at position (200, 200)
    this.map.addObstacle(obstacle1);

    // Try moving the unit
    // this.map.moveUnit(unit1, 150, 150); // Successful move

    // this.map.moveUnit(unit1, 190, 190); // Move fails due to collision with the obstacle at (200, 200)

  }

  endTurn() {
    console.log("Ending turn", this.currentTurn);
    // Stub: Handle end of turn logic, increment turn counter, etc.
  }

  getGameState() {
    // Return the current game state for saving purposes
    return this.gameStats;
  }
}
