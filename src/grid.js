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
  // Clear existing ship elements
  gameboardContainer
    .querySelectorAll(".ship-element")
    .forEach((ship) => ship.remove());

  const processedShips = new Set();

  for (let x = 0; x < gameboard.boardSize; x++) {
    for (let y = 0; y < gameboard.boardSize; y++) {
      const ship = gameboard.board[x][y];
      if (ship && !processedShips.has(ship)) {
        processedShips.add(ship);
        
        // Find ship direction and start position
        let direction = "horizontal";
        let startX = x, startY = y;

        // Check if ship extends vertically
        if (x + 1 < gameboard.boardSize && gameboard.board[x + 1][y] === ship) {
          direction = "vertical";
        }

        // Get the cell with the starting position
        const startCell = gameboardContainer.querySelector(
          `[data-x="${startX}"][data-y="${startY}"]`
        );

        if (startCell) {
          startCell.classList.add("ship-element");
        }
      }
    }
  }
}

export { renderBoard, renderShips };
