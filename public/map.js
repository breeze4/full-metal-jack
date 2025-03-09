// Define the Map Data Structure
export class Map {
  constructor(width, height) {
    this.width = width;
    this.height = height;
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

  isPointWithinMap(point) {
    const { x, y, radius } = point;
    return x - radius >= 0 && x + radius <= this.width && y - radius >= 0 && y + radius <= this.height;
  }

  // Method to render the map on the canvas
  renderMap(gameState) {
    const { units, obstacles } = gameState;
    const currentTime = performance.now();
    this.fps = Math.round(1000 / (currentTime - this.lastFrameTime));
    this.lastFrameTime = currentTime;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw living units
    for (let unit of units.filter(u => !u.isDead())) {
      // Draw unit with dimmed color if it has acted
      const unitColor = unit.hasActed ? this.getDimmedColor(unit.color) : unit.color;
      this.drawCircle(unit.x, unit.y, unit.radius, unitColor);
      this.drawHealthBar(unit);
      this.drawUnitText(unit);
      if (unit.hasActed) {
        this.drawActionIndicator(unit);
      }
    }

    for (let obstacle of obstacles) {
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
    console.log('[map.js] Starting unit move mode');
    this.showCursorLine = true;
  }

  endUnitMove() {
    console.log('[map.js] Ending unit move mode');
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
    // console.log(`Cursor on cell (${cellX}, ${cellY})`);
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
  drawUnitText(unit) {
    const {label, x, y} = unit;
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(label, x, y + 30);
    
    // Add health text and action status
    this.ctx.font = '8px Arial';
    const healthText = `${unit.label} (${Math.round(unit?.health || 0)}hp)`;
    this.ctx.fillText(healthText, x, y - 15);
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

  // New method to get dimmed color for units that have acted
  getDimmedColor(color) {
    // Convert hex to RGB and reduce brightness
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
  }

  // New method to draw action indicator
  drawActionIndicator(unit) {
    const text = unit.actionType === 'move' ? '⟲' : '⚔️';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(text, unit.x, unit.y - unit.radius - 20);
  }
}
