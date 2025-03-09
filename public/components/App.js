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
  const [appState, setAppState] = useState({
    turn: gameEngine.getCurrentTurn(),
    fps: 0,
    mousePos: { x: 0, y: 0 },
    canvasPos: { x: "--", y: "--" },
    gridPos: { x: "--", y: "--" },
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

        setAppState((prev) => ({
          ...prev,
          fps,
          turn: gameEngine.getCurrentTurn(),
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

        if (appState.moveMode && appState.selectedUnit) {
          // console.log('[App.js] Move mode active:', {
          //   unit: appState.selectedUnit.label,
          //   from: { x: appState.selectedUnit.x, y: appState.selectedUnit.y },
          //   to: { x: canvasX, y: canvasY }
          // });

          const movePositions = {
            startX: appState.selectedUnit.x,
            startY: appState.selectedUnit.y,
            endX: canvasX,
            endY: canvasY,
            unit: appState.selectedUnit,
          };
          map.updateUnitMove(movePositions);
        }
      }

      setAppState((prev) => ({
        ...prev,
        mousePos,
        canvasPos,
        gridPos,
      }));
    }

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [appState.moveMode, appState.selectedUnit]);

  useEffect(() => {
    function handleCanvasClick(event) {
      const rect = map.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      console.log("[App.js] Canvas clicked:", {
        x,
        y,
        moveMode: appState.moveMode,
      });

      const gameState = gameEngine.getGameState();
      if (!appState.moveMode) {
        for (let unit of gameState.units) {
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
              appState: appState,
              gameState: gameState,
            };

            if (unit.canMove(context)) {
              console.log("[App.js] Unit can move:", { unit: unit.label });
              setAppState((prev) => ({
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
        for (let unit of gameState.units) {
          if (unit.isDead()) continue;

          if (
            Math.abs(unit.x - x) <= unit.radius &&
            Math.abs(unit.y - y) <= unit.radius
          ) {
            if (unit.isNPC !== appState.selectedUnit.isNPC) {
              console.log("[App.js] Enemy unit targeted:", {
                attacker: appState.selectedUnit.label,
                target: unit.label,
                targetHealth: unit.health,
              });

              if (
                appState.selectedUnit.canAttack({
                  currentTurn: gameEngine.currentTurn,
                })
              ) {
                const isDead = unit.takeDamage(appState.selectedUnit.damage);
                console.log("[App.js] Attack result:", {
                  damage: appState.selectedUnit.damage,
                  remainingHealth: unit.health,
                  targetDefeated: isDead,
                });

                appState.selectedUnit.performAction("attack");
                gameEngine.recordUnitMove(appState.selectedUnit);
                hitEnemy = true;
              }
              break;
            }
          }
        }

        if (!hitEnemy && appState.selectedUnit) {
          console.log("[App.js] Moving unit:", {
            unit: appState.selectedUnit.label,
            from: { x: appState.selectedUnit.x, y: appState.selectedUnit.y },
            to: { x, y },
          });

          gameEngine.moveUnit(appState.selectedUnit, x, y);
          appState.selectedUnit.performAction("move");
          gameEngine.recordUnitMove(appState.selectedUnit);
        }

        setAppState((prev) => ({
          ...prev,
          selectedUnit: null,
          moveMode: false,
        }));
        map.endUnitMove();
      }
    }

    map.canvas.addEventListener("click", handleCanvasClick);
    return () => map.canvas.removeEventListener("click", handleCanvasClick);
  }, [appState.moveMode, appState.selectedUnit]);

  return html`
    <div id="app-root">
      <${LeftPanel}
        fps=${appState.fps}
        mousePos=${appState.mousePos}
        canvasPos=${appState.canvasPos}
        gridPos=${appState.gridPos}
        units=${gameEngine.getGameState().units}
        currentTurn=${appState.turn}
      />
      <${TurnCounter} turn=${appState.turn} />
      <${GameControls}
        onSave=${() => storageManager.saveState(gameEngine.getGameState())}
        onEndTurn=${() => {
          gameEngine.endTurn();
          setAppState((prev) => ({
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
