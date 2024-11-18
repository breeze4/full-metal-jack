
const specificUnits = [
  { id: "soldier_1", type: "rifleman", currentXP: 0, level: 1, location: [0, 0] },
  { id: "soldier_2", type: "grenadier", currentXP: 0, level: 1, location: [1, 1] },
]

export const GameStats = {
  soldiers: specificUnits,
  enemyUnits: [],
  turnOrder: [], // Placeholder for turn order logic
  map: {
    width: 10,
    height: 10,
    cells: [], // Stub: Placeholder for map cells
  },
};
