import { jsx } from 'preact/jsx-runtime';
import { UnitList } from './UnitList.jsx';

export function LeftPanel({ fps, mousePos, canvasPos, gridPos, units, currentTurn }) {
  const isPlayerTurn = currentTurn % 2 === 0;
  const playerUnits = units.filter(unit => !unit.isNPC && !unit.isDead());
  const npcUnits = units.filter(unit => unit.isNPC && !unit.isDead());

  return jsx('div', {
    id: 'left-panel',
    children: [
      jsx('div', { id: 'fps-counter', children: `FPS: ${fps}` }),
      jsx('div', { id: 'mouse-coords', children: `Mouse: (${mousePos.x}, ${mousePos.y})` }),
      jsx('div', { id: 'canvas-coords', children: `Canvas: (${canvasPos.x}, ${canvasPos.y})` }),
      jsx('div', { id: 'grid-coords', children: `Grid: (${gridPos.x}, ${gridPos.y})` }),
      jsx('div', {
        className: 'turn-order-section',
        children: [
          jsx('div', { children: 'Turn Order' }),
          jsx('div', {
            id: 'current-phase',
            style: { color: isPlayerTurn ? '#90EE90' : '#FFFFFF' },
            children: `Current Phase: ${isPlayerTurn ? 'Player' : 'NPC'} Turn`
          }),
          jsx(UnitList, { title: 'Player Units:', units: playerUnits }),
          jsx(UnitList, { title: 'NPC Units:', units: npcUnits })
        ]
      })
    ]
  });
} 