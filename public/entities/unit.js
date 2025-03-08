class Unit {
  constructor(x, y, radius, label, isNPC = false) {
    this.x = x;
    this.y = y;
    this.radius = radius; // Defines the space occupied by the unit
    this.label = label; // New field to store the label of the unit
    this.isNPC = isNPC;
    this.color = isNPC ? "#333333" : "#2c8c2c"; // Black for NPCs, Green for players
    this.maxHealth = 30;
    this.health = this.maxHealth;
    this.damage = Math.floor(Math.random() * 5) + 5; // Random damage between 5-10
    this.hasActed = false; // Track if unit has performed any action this turn
    this.actionType = null; // 'move' or 'attack' or null
  }

  canMove(context) {
    // Dead units can't move
    if (this.health <= 0) return false;

    // Check turn ownership
    const isCorrectTurn = this.isNPC
      ? context.currentTurn % 2 === 1
      : context.currentTurn % 2 === 0;

    // Can only move if hasn't acted this turn
    return !this.hasActed && isCorrectTurn;
  }

  canAttack(context) {
    // Dead units can't attack
    if (this.health <= 0) return false;

    // Check turn ownership
    const isCorrectTurn = this.isNPC
      ? context.currentTurn % 2 === 1
      : context.currentTurn % 2 === 0;

    // Can only attack if hasn't acted this turn
    return !this.hasActed && isCorrectTurn;
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    return this.health <= 0; // Return true if unit is dead
  }

  performAction(actionType) {
    this.hasActed = true;
    this.actionType = actionType;
  }

  resetMoveState() {
    this.hasActed = false;
    this.actionType = null;
  }

  isDead() {
    return this.health <= 0;
  }
}

class NPCUnit extends Unit {
  constructor(x, y, radius, label) {
    super(x, y, radius, label, true);
    this.behavior = "idle"; // Can be used to define different NPC behaviors
    this.detectionRange = radius * 2; // NPCs can detect units within twice their radius
  }

  // Add NPC-specific methods
  updateBehavior(newBehavior) {
    this.behavior = newBehavior;
  }
}

export { Unit, NPCUnit };
