import { render, h } from "preact";
import { useState, useEffect } from "preact/hooks";
import htm from "htm";
import { LeftPanel } from "./LeftPanel.js";
import { TurnCounter } from "./TurnCounter.js";
import { GameControls } from "./GameControls.js";
import { gameEngine, map, storageManager } from "../gameSetup.js";

// Initialize htm with Preact's h function
const html = htm.bind(h);

function App() {
  const [gameState, setGameState] = useState({
    turn: gameEngine.getCurrentTurn(),
    fps: 0,
    mousePos: { x: 0, y: 0 },
    canvasPos: { x: "--", y: "--" },
    gridPos: { x: "--", y: "--" },
    units: [],
    selectedUnit: null,
    moveMode: false,
  });

  useEffect(() => {
    let frameCount = 0;
    let lastFpsUpdate = performance.now();
    const FPS_UPDATE_INTERVAL = 500;

    function updateGameState() {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastFpsUpdate > FPS_UPDATE_INTERVAL) {
        const fps = Math.round(
          (frameCount * 1000) / (currentTime - lastFpsUpdate)
        );
        frameCount = 0;
        lastFpsUpdate = currentTime;

        setGameState((prev) => ({
          ...prev,
          fps,
          turn: gameEngine.getCurrentTurn(),
          units: [...gameEngine.map.units],
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

      let canvasPos = { x: "--", y: "--" };
      let gridPos = { x: "--", y: "--" };

      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {
        const canvasX = Math.round(event.clientX - rect.left);
        const canvasY = Math.round(event.clientY - rect.top);
        canvasPos = { x: canvasX, y: canvasY };

        const gridX = Math.floor(canvasX / map.gridSize);
        const gridY = Math.floor(canvasY / map.gridSize);
        gridPos = { x: gridX, y: gridY };

        if (gameState.moveMode && gameState.selectedUnit) {
          // console.log('[App.js] Move mode active:', {
          //   unit: gameState.selectedUnit.label,
          //   from: { x: gameState.selectedUnit.x, y: gameState.selectedUnit.y },
          //   to: { x: canvasX, y: canvasY }
          // });

          const movePositions = {
            startX: gameState.selectedUnit.x,
            startY: gameState.selectedUnit.y,
            endX: canvasX,
            endY: canvasY,
            unit: gameState.selectedUnit,
          };
          map.updateUnitMove(movePositions);
        }
      }

      setGameState((prev) => ({
        ...prev,
        mousePos,
        canvasPos,
        gridPos,
      }));
    }

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [gameState.moveMode, gameState.selectedUnit]);

  useEffect(() => {
    function handleCanvasClick(event) {
      const rect = map.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      console.log("[App.js] Canvas clicked:", {
        x,
        y,
        moveMode: gameState.moveMode,
      });

      if (!gameState.moveMode) {
        for (let unit of map.units) {
          if (
            Math.abs(unit.x - x) <= unit.radius &&
            Math.abs(unit.y - y) <= unit.radius
          ) {
            console.log("[App.js] Unit selected:", {
              unit: unit.label,
              position: { x: unit.x, y: unit.y },
              hasActed: unit.hasActed,
              actionType: unit.actionType,
            });

            const context = {
              currentTurn: gameEngine.currentTurn,
              x: x,
              y: y,
              unit: unit,
              gameState: gameEngine.getGameState(),
            };

            if (unit.canMove(context)) {
              console.log("[App.js] Unit can move:", { unit: unit.label });
              setGameState((prev) => ({
                ...prev,
                selectedUnit: unit,
                moveMode: true,
              }));
              const movePositions = {
                startX: unit.x,
                startY: unit.y,
                endX: x,
                endY: y,
                unit: unit,
              };
              map.updateUnitMove(movePositions);
              map.startUnitMove();
            } else if (unit.hasActed) {
              console.log("[App.js] Unit has already acted:", {
                unit: unit.label,
                actionType: unit.actionType,
              });
            }
            break;
          }
        }
      } else {
        let hitEnemy = false;
        for (let unit of map.units) {
          if (unit.isDead()) continue;

          if (
            Math.abs(unit.x - x) <= unit.radius &&
            Math.abs(unit.y - y) <= unit.radius
          ) {
            if (unit.isNPC !== gameState.selectedUnit.isNPC) {
              console.log("[App.js] Enemy unit targeted:", {
                attacker: gameState.selectedUnit.label,
                target: unit.label,
                targetHealth: unit.health,
              });

              if (
                gameState.selectedUnit.canAttack({
                  currentTurn: gameEngine.currentTurn,
                })
              ) {
                const isDead = unit.takeDamage(gameState.selectedUnit.damage);
                console.log("[App.js] Attack result:", {
                  damage: gameState.selectedUnit.damage,
                  remainingHealth: unit.health,
                  targetDefeated: isDead,
                });

                gameState.selectedUnit.performAction("attack");
                gameEngine.recordUnitMove(gameState.selectedUnit);
                hitEnemy = true;
              }
              break;
            }
          }
        }

        if (!hitEnemy && gameState.selectedUnit) {
          console.log("[App.js] Moving unit:", {
            unit: gameState.selectedUnit.label,
            from: { x: gameState.selectedUnit.x, y: gameState.selectedUnit.y },
            to: { x, y },
          });

          map.moveUnit(gameState.selectedUnit, x, y);
          gameState.selectedUnit.performAction("move");
          gameEngine.recordUnitMove(gameState.selectedUnit);
        }

        setGameState((prev) => ({
          ...prev,
          selectedUnit: null,
          moveMode: false,
        }));
        map.endUnitMove();
      }
    }

    map.canvas.addEventListener("click", handleCanvasClick);
    return () => map.canvas.removeEventListener("click", handleCanvasClick);
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
          setGameState((prev) => ({
            ...prev,
            turn: gameEngine.getCurrentTurn(),
          }));
        }}
      />
    </div>
  `;
}

render(html`<${App} />`, document.getElementById("ui-root"));

export default App;
