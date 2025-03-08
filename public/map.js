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
    this.showCellNumbers = true; // New toggle for cell number debugging
    this.lastFrameTime = performance.now(); // Initialize last frame time
    this.fps = 0; // Initialize FPS counter
  }

  // Method to add a unit to the map
  addUnit(unit) {
    const x = Math.round((unit.x / this.gridSize) * this.gridSize + this.gridSize / 2);
    const y = Math.round((unit.y / this.gridSize) * this.gridSize + this.gridSize / 2);
    if (this.isPositionValid(x, y, unit.radius)) {
      this.units.push(unit);
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
      this.obstacles.push(obstacle); // Set radius to half of the grid size
      console.log(`Added obstacle at (${x}, ${y}) with radius ${obstacle.radius}`);
    } else {
      console.error('Invalid position to add obstacle due to collision or out of bounds.');
    }
  }

  // Method to move a unit to a new position
  moveUnit(unit, newX, newY) {
    const cellX = Math.floor(newX / this.gridSize);
    const cellY = Math.floor(newY / this.gridSize);
    const centerX = (cellX * this.gridSize) + this.gridSize / 2;
    const centerY = (cellY * this.gridSize) + this.gridSize / 2;

    console.log(`Moving unit to cell (${cellX}, ${cellY}) at position (${centerX}, ${centerY})`);

    if (this.isPositionValid(centerX, centerY, unit.radius)) {
      unit.x = centerX;
      unit.y = centerY;
      console.log(`Moved unit to (${centerX}, ${centerY})`);
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
    const currentTime = performance.now();
    this.fps = Math.round(1000 / (currentTime - this.lastFrameTime)); // Calculate FPS
    this.lastFrameTime = currentTime; // Update last frame time

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw living units
    for (let unit of this.units.filter(u => !u.isDead())) {
      this.drawCircle(unit.x, unit.y, unit.radius, unit.color);
      this.drawHealthBar(unit);
      this.drawText(unit.label, unit.x, unit.y); // Draw the label on top of the unit
    }

    for (let obstacle of this.obstacles) {
      this.drawCircle(obstacle.x, obstacle.y, obstacle.radius, 'red');
    }

    if (this.showGrid) {
      this.drawGrid();
    }

    if (this.showCellNumbers) {
      this.drawCellNumbers();
    }

    if (this.showCursorLine) {
      this.drawCursorLine();
    }
  }

  startUnitMove() {
    this.showCursorLine = true;
  }

  endUnitMove() {
    this.showCursorLine = false;
  }

  updateUnitMove(positions) {
    this.cursorLinePositions = positions;
  }

  drawCursorLine() {
    const { startX, startY, endX, endY, unit } = this.cursorLinePositions;

    // Use the unit's color for the cursor line
    const lineColor = unit && unit.color || 'black';

    // Draw the small circle around the cursor
    this.drawCircle(endX, endY, 5, lineColor);

    // Draw a line from the cursor to the unit
    this.ctx.beginPath();
    this.ctx.moveTo(endX, endY);
    this.ctx.lineTo(startX, startY);
    this.ctx.strokeStyle = lineColor;
    this.ctx.stroke();

    // Log cell coordinates when clicking in move mode
    const cellX = Math.floor(endX / this.gridSize);
    const cellY = Math.floor(endY / this.gridSize);
    console.log(`Cursor on cell (${cellX}, ${cellY})`);
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
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(text, x, y + 30);
    
    // Add health text
    this.ctx.font = '8px Arial';
    this.ctx.fillText(`${text} (${Math.round(this.units.find(u => u.label === text)?.health || 0)}hp)`, x, y - 15);
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

  // New method to draw cell numbers on the canvas
  drawCellNumbers() {
    this.ctx.font = '10px Arial'; // Set font size and family
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = 'black';

    for (let x = 0; x < this.width; x += this.gridSize) {
      for (let y = 0; y < this.height; y += this.gridSize) {
        const cellX = Math.round(x + this.gridSize / 2);
        const cellY = Math.round(y + this.gridSize / 2);
        const cellNumber = `${Math.floor(x / this.gridSize)},${Math.floor(y / this.gridSize)}`;
        this.ctx.fillText(cellNumber, cellX, cellY);
      }
    }
  }

  // Method to toggle the display of cell numbers
  toggleCellNumbers() {
    this.showCellNumbers = !this.showCellNumbers;
  }

  // New method to draw health bar
  drawHealthBar(unit) {
    const barWidth = 40;
    const barHeight = 4;
    const x = unit.x - barWidth / 2;
    const y = unit.y - unit.radius - 10;

    // Draw background (empty health bar)
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(x, y, barWidth, barHeight);

    // Draw current health
    const healthWidth = (unit.health / unit.maxHealth) * barWidth;
    this.ctx.fillStyle = '#00ff00';
    this.ctx.fillRect(x, y, healthWidth, barHeight);
  }
}
