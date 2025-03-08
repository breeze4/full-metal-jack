import { h } from 'preact';
import htm from 'htm';

const html = htm.bind(h);

export function GameControls({ onSave, onEndTurn }) {
  return html`
    <div class="game-controls">
      <button id="save-state-button" onClick=${onSave}>Save Game State</button>
      <button id="end-turn-button" onClick=${onEndTurn}>End Turn</button>
    </div>
  `;
} 