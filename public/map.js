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
    this.gridSize = 40; // Grid size in pixels
    this.showGrid = true; // Toggle for grid visibility
  }

  // Method to add a unit to the map
  addUnit(unit) {
    const x = Math.round((unit.x / this.gridSize) * this.gridSize + this.gridSize / 2);
    const y = Math.round((unit.y / this.gridSize) * this.gridSize + this.gridSize / 2);
    if (this.isPositionValid(x, y, unit.radius)) {
      this.units.push(new Unit(x, y, unit.radius, unit.label));
      console.log(`Added unit at (${x}, ${y}) with radius ${unit.radius}`);
    } else {
      console.error('Invalid position to add unit due to collision or out of bounds.');
    }
  }

  // Method to add an obstacle to the map
  addObstacle(obstacle) {
    const x = Math.round((obstacle.x / this.gridSize) * this.gridSize + this.gridSize / 2);
    const y = Math.round((obstacle.y / this.gridSize) * this.gridSize + this.gridSize / 2);
    if (this.isPositionValid(x, y, obstacle.radius)) {
      this.obstacles.push(new Obstacle(x, y, 20)); // Set radius to half of the grid size
      console.log(`Added obstacle at (${x}, ${y}) with radius ${obstacle.radius}`);
    } else {
      console.error('Invalid position to add obstacle due to collision or out of bounds.');
    }
  }

  // Method to move a unit to a new position
  moveUnit(unit, newX, newY) {
    const snappedX = this.snapToGrid(newX);
    const snappedY = this.snapToGrid(newY);

    if (this.isPositionValid(snappedX, snappedY, unit.radius, unit)) {
      unit.x = snappedX;
      unit.y = snappedY;
      console.log(`Moved unit to (${snappedX}, ${snappedY})`);
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
      this.drawCircle(obstacle.x, obstacle.y, 20, 'red'); // Set radius to half of the grid size
    }

    if (this.showGrid) {
      this.drawGrid();
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
    this.ctx.fillText(text, x, y + 30); // Draw text slightly below the unit for better visibility
  }

  // Utility method to draw grid on the canvas
  drawGrid() {
    this.ctx.strokeStyle = 'gray';
    this.ctx.lineWidth = 1;

    for (let x = 0; x <= this.width; x += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= this.height; y += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  // Utility method to snap a position to the nearest grid cell
  snapToGrid(position) {
    return Math.round(position / this.gridSize) * this.gridSize;
  }
}
