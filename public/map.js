

// Define the Map Data Structure
export class Map {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.units = []; // List of units on the map
    this.obstacles = []; // List of obstacles on the map
  }

  // Method to add a unit to the map
  addUnit(unit) {
    if (this.isPositionValid(unit.x, unit.y, unit.radius)) {
      this.units.push(unit);
      console.log(`Added unit at (${unit.x}, ${unit.y}) with radius ${unit.radius}`);
    } else {
      console.error('Invalid position to add unit due to collision or out of bounds.');
    }
  }

  // Method to add an obstacle to the map
  addObstacle(obstacle) {
    if (this.isPositionValid(obstacle.x, obstacle.y, obstacle.radius)) {
      this.obstacles.push(obstacle);
      console.log(`Added obstacle at (${obstacle.x}, ${obstacle.y}) with radius ${obstacle.radius}`);
    } else {
      console.error('Invalid position to add obstacle due to collision or out of bounds.');
    }
  }

  // Method to move a unit to a new position
  moveUnit(unit, newX, newY) {
    if (this.isPositionValid(newX, newY, unit.radius, unit)) {
      unit.x = newX;
      unit.y = newY;
      console.log(`Moved unit to (${newX}, ${newY})`);
    } else {
      console.error('Invalid move due to collision or out of bounds.');
    }
  }

  // Method to detect collisions
  detectCollision(x, y, radius, excludeUnit = null) {
    for (let obstacle of this.obstacles) {
      if (this.checkOverlap(x, y, radius, obstacle.x, obstacle.y, obstacle.radius)) {
        return true;
      }
    }
    for (let unit of this.units) {
      if (unit !== excludeUnit && this.checkOverlap(x, y, radius, unit.x, unit.y, unit.radius)) {
        return true;
      }
    }
    return false;
  }

  // Utility method to check if a position is valid (no collisions and within bounds)
  isPositionValid(x, y, radius, excludeUnit = null) {
    const inBounds = x - radius >= 0 && x + radius <= this.width && y - radius >= 0 && y + radius <= this.height;
    const noCollision = !this.detectCollision(x, y, radius, excludeUnit);
    return inBounds && noCollision;
  }

  // Utility method to check for overlap between two circles (used for collisions)
  checkOverlap(x1, y1, r1, x2, y2, r2) {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return distance < (r1 + r2);
  }

  // Method to render the map in the browser
  renderMap() {
    const gridSize = 20; // Define how fine-grained the grid should be for visual representation
    let mapRepresentation = '';

    for (let y = 0; y < this.height; y += gridSize) {
      for (let x = 0; x < this.width; x += gridSize) {
        let symbol = '.'; // Default empty space

        for (let unit of this.units) {
          if (Math.abs(unit.x - x) < unit.radius && Math.abs(unit.y - y) < unit.radius) {
            symbol = 'U';
            break;
          }
        }
        for (let obstacle of this.obstacles) {
          if (Math.abs(obstacle.x - x) < obstacle.radius && Math.abs(obstacle.y - y) < obstacle.radius) {
            symbol = 'O';
            break;
          }
        }
        mapRepresentation += symbol + ' ';
      }
      mapRepresentation += '<br/>';
    }

    document.getElementById('map').innerHTML = mapRepresentation;
  }
}