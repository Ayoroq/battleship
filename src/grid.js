import { Gameboard } from "./game.js";

function clearGrid(gridSelector) {
  gridSelector.innerHTML = "";
}

// render the game board
function renderBoard(gameboard, gameboardContainer) {
  if (!gameboardContainer) {
    console.error("Grid container not found");
    return;
  }

  clearGrid(gameboardContainer);

  for (let i = 0; i < gameboard.boardSize; i++) {
    for (let j = 0; j < gameboard.boardSize; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.x = i;
      cell.dataset.y = j;
      gameboardContainer.appendChild(cell);
    }
  }
}

function renderShips(gameboard, gameboardContainer) {
  // Clear existing ship styling and elements
  gameboardContainer.querySelectorAll(".cell").forEach(cell => {
    cell.classList.remove("ship");
    delete cell.dataset.shipName;
    delete cell.dataset.shipSegment;
    cell.querySelector(".ship-element")?.remove();
  });

  const processedShips = new Set();

  for (let x = 0; x < gameboard.boardSize; x++) {
    for (let y = 0; y < gameboard.boardSize; y++) {
      const ship = gameboard.board[x][y];
      if (ship && !processedShips.has(ship)) {
        processedShips.add(ship);
        
        // Find ship direction
        let direction = "horizontal";
        if (x + 1 < gameboard.boardSize && gameboard.board[x + 1][y] === ship) {
          direction = "vertical";
        }

        // Add ship element to first cell with proper spanning
        const firstCell = gameboardContainer.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        const shipElement = document.createElement("div");
        shipElement.classList.add("ship-element");
        shipElement.draggable = true;
        shipElement.dataset.shipName = ship.name;
        shipElement.dataset.shipSize = ship.length;
        shipElement.dataset.shipDirection = direction;
        shipElement.textContent = ship.name;
        
        // Position ship element to span across cells
        shipElement.style.position = "absolute";
        shipElement.style.zIndex = "10";
        
        if (direction === "horizontal") {
          shipElement.style.width = `calc(100% * ${ship.length})`;
          shipElement.style.height = "100%";
        } else {
          shipElement.style.width = "100%";
          shipElement.style.height = `calc(100% * ${ship.length})`;
        }
        
        firstCell.style.position = "relative";
        firstCell.appendChild(shipElement);

        // Add ship class and data to all cells occupied by ship
        for (let i = 0; i < ship.length; i++) {
          const cellX = direction === "horizontal" ? x : x + i;
          const cellY = direction === "horizontal" ? y + i : y;
          const cell = gameboardContainer.querySelector(`[data-x="${cellX}"][data-y="${cellY}"]`);
          if (cell) {
            cell.classList.add("ship");
            cell.dataset.shipName = ship.name;
            cell.dataset.shipSegment = i;
          }
        }
      }
    }
  }
}

export { renderBoard, renderShips };
