export const SoldierConfig = {
  baseTypes: {
    rifleman: {
      movementSpeed: 30,
      actionPoints: 7,
      health: 100,
      levelUpIncrease: {
        movementSpeed: 5,
        health: 10,
      },
    },
    grenadier: {
      movementSpeed: 25,
      actionPoints: 7,
      health: 120,
      levelUpIncrease: {
        movementSpeed: 3,
        health: 15,
      },
    },
  },
};