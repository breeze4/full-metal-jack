import { h } from 'preact';
import htm from 'htm';
import { UnitList } from './UnitList.js';

const html = htm.bind(h);

export function LeftPanel({  mousePos, canvasPos, gridPos, units, isPlayerTurn }) { 
  const playerUnits = units.filter(unit => !unit.isNPC && !unit.isDead());
  const npcUnits = units.filter(unit => unit.isNPC && !unit.isDead());

  return html`
    <div id="left-panel">
      <div id="mouse-coords">Mouse: (${mousePos.x}, ${mousePos.y})</div>
      <div id="canvas-coords">Canvas: (${canvasPos.x}, ${canvasPos.y})</div>
      <div id="grid-coords">Grid: (${gridPos.x}, ${gridPos.y})</div>
      
      <div class="turn-order-section">
        <div>Turn Order</div>
        <div 
          id="current-phase"
          style=${{ color: isPlayerTurn ? '#90EE90' : '#FFFFFF' }}
        >
          Current Phase: ${isPlayerTurn ? 'Player' : 'NPC'} Turn
        </div>
        
        <${UnitList} title="Player Units:" units=${playerUnits} />
        <${UnitList} title="NPC Units:" units=${npcUnits} />
      </div>
    </div>
  `;
} 