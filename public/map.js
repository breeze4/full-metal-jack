// Define the Map Data Structure
export class Map {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.units = []; // List of units on the map
    this.obstacles = []; // List of obstacles on the map
    this.canvas = document.getElementById('map');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = width;
    this.canvas.height = height;
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

  // Method to render the map on the canvas
  renderMap() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let unit of this.units) {
      this.drawCircle(unit.x, unit.y, unit.radius, 'blue');
      this.drawText(unit.label, unit.x, unit.y); // Draw the label on top of the unit
    }
    for (let obstacle of this.obstacles) {
      this.drawCircle(obstacle.x, obstacle.y, obstacle.radius, 'red');
    }
  }

  // Utility method to draw a circle on the canvas
  drawCircle(x, y, radius, color) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.closePath();
  }

  // Utility method to draw text on the canvas
  drawText(text, x, y) {
    this.ctx.font = '10px Arial'; // Set font size and family
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, x, y - 5); // Draw text slightly above the unit for better visibility
  }
}
