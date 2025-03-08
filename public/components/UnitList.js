import { h } from 'preact';
import htm from 'htm';

const html = htm.bind(h);

export function UnitList({ title, units }) {
  return html`
    <div class="unit-list">
      <div>${title}</div>
      ${units.map(unit => html`
        <div class=${`unit-item${unit.hasActed ? ' acted' : ''}`} key=${unit.label}>
          <div 
            class="unit-color" 
            style=${{ backgroundColor: unit.color }}
          />
          <span>${unit.label}</span>
          <span class="action-icon">
            ${unit.hasActed 
              ? (unit.actionType === 'move' ? '⟲' : '⚔️')
              : '•'
            }
          </span>
        </div>
      `)}
    </div>
  `;
} 