import { render, h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import htm from 'htm';
import { LeftPanel } from './LeftPanel.js';
import { TurnCounter } from './TurnCounter.js';
import { GameControls } from './GameControls.js';
import { gameEngine, map, storageManager } from '../gameSetup.js';

// Initialize htm with Preact's h function
const html = htm.bind(h);

function App() {
  const [gameState, setGameState] = useState({
    turn: gameEngine.getCurrentTurn(),
    fps: 0,
    mousePos: { x: 0, y: 0 },
    canvasPos: { x: '--', y: '--' },
    gridPos: { x: '--', y: '--' },
    units: [],
    selectedUnit: null,
    moveMode: false
  });

  useEffect(() => {
    let frameCount = 0;
    let lastFpsUpdate = performance.now();
    const FPS_UPDATE_INTERVAL = 500;

    function updateGameState() {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastFpsUpdate > FPS_UPDATE_INTERVAL) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastFpsUpdate));
        frameCount = 0;
        lastFpsUpdate = currentTime;

        setGameState(prev => ({
          ...prev,
          fps,
          turn: gameEngine.getCurrentTurn(),
          units: [...gameEngine.map.units]
        }));
      }

      requestAnimationFrame(updateGameState);
    }

    updateGameState();
  }, []);

  useEffect(() => {
    function handleMouseMove(event) {
      const mousePos = { x: event.clientX, y: event.clientY };
      const rect = map.canvas.getBoundingClientRect();

      let canvasPos = { x: '--', y: '--' };
      let gridPos = { x: '--', y: '--' };

      if (event.clientX >= rect.left && event.clientX <= rect.right &&
          event.clientY >= rect.top && event.clientY <= rect.bottom) {
        const canvasX = Math.round(event.clientX - rect.left);
        const canvasY = Math.round(event.clientY - rect.top);
        canvasPos = { x: canvasX, y: canvasY };
        
        const gridX = Math.floor(canvasX / map.gridSize);
        const gridY = Math.floor(canvasY / map.gridSize);
        gridPos = { x: gridX, y: gridY };

        if (gameState.moveMode && gameState.selectedUnit) {
          const movePositions = {
            startX: gameState.selectedUnit.x,
            startY: gameState.selectedUnit.y,
            endX: canvasX,
            endY: canvasY,
            unit: gameState.selectedUnit
          };
          map.updateUnitMove(movePositions);
        }
      }

      setGameState(prev => ({
        ...prev,
        mousePos,
        canvasPos,
        gridPos
      }));
    }

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [gameState.moveMode, gameState.selectedUnit]);

  useEffect(() => {
    function handleCanvasClick(event) {
      const rect = map.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (!gameState.moveMode) {
        for (let unit of map.units) {
          if (Math.abs(unit.x - x) <= unit.radius && Math.abs(unit.y - y) <= unit.radius) {
            const context = {
              currentTurn: gameEngine.currentTurn,
              x: x,
              y: y,
              unit: unit,
              gameState: gameEngine.getGameState()
            };

            if (unit.canMove(context)) {
              setGameState(prev => ({ ...prev, selectedUnit: unit, moveMode: true }));
              const movePositions = {
                startX: unit.x,
                startY: unit.y,
                endX: x,
                endY: y,
                unit: unit
              };
              map.updateUnitMove(movePositions);
              map.startUnitMove();
            } else if (unit.hasActed) {
              console.log(`${unit.label} has already ${unit.actionType}d this turn!`);
            }
            break;
          }
        }
      } else {
        let hitEnemy = false;
        for (let unit of map.units) {
          if (unit.isDead()) continue;
          
          if (Math.abs(unit.x - x) <= unit.radius && Math.abs(unit.y - y) <= unit.radius) {
            if (unit.isNPC !== gameState.selectedUnit.isNPC) {
              if (gameState.selectedUnit.canAttack({ currentTurn: gameEngine.currentTurn })) {
                const isDead = unit.takeDamage(gameState.selectedUnit.damage);
                console.log(`${gameState.selectedUnit.label} attacks ${unit.label} for ${gameState.selectedUnit.damage} damage! ${unit.health}hp remaining`);
                if (isDead) {
                  console.log(`${unit.label} has been defeated!`);
                }
                gameState.selectedUnit.performAction('attack');
                gameEngine.recordUnitMove(gameState.selectedUnit);
                hitEnemy = true;
              }
              break;
            }
          }
        }

        if (!hitEnemy && gameState.selectedUnit) {
          map.moveUnit(gameState.selectedUnit, x, y);
          gameState.selectedUnit.performAction('move');
          gameEngine.recordUnitMove(gameState.selectedUnit);
        }

        setGameState(prev => ({ ...prev, selectedUnit: null, moveMode: false }));
        map.endUnitMove();
      }
    }

    map.canvas.addEventListener('click', handleCanvasClick);
    return () => map.canvas.removeEventListener('click', handleCanvasClick);
  }, [gameState.moveMode, gameState.selectedUnit]);

  return html`
    <div id="app-root">
      <${LeftPanel}
        fps=${gameState.fps}
        mousePos=${gameState.mousePos}
        canvasPos=${gameState.canvasPos}
        gridPos=${gameState.gridPos}
        units=${gameState.units}
        currentTurn=${gameState.turn}
      />
      <${TurnCounter} turn=${gameState.turn} />
      <${GameControls}
        onSave=${() => storageManager.saveState(gameEngine.getGameState())}
        onEndTurn=${() => {
          gameEngine.endTurn();
          setGameState(prev => ({ ...prev, turn: gameEngine.getCurrentTurn() }));
        }}
      />
    </div>
  `;
}

render(html`<${App} />`, document.getElementById('ui-root'));

export default App; 