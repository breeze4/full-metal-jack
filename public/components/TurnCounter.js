import { h } from 'preact';
import htm from 'htm';

const html = htm.bind(h);

export function TurnCounter({ turn, isPlayerTurn }) {
  
  return html`
    <div 
      id="turn-counter"
      style=${{
        backgroundColor: isPlayerTurn ? '#2c8c2c' : '#333333',
        color: isPlayerTurn ? '#000000' : '#FFFFFF'
      }}
    >
      Turn: ${turn}
    </div>
  `;
} 