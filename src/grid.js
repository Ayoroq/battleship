import { Gameboard } from "./game.js";

// const gameboard = new Gameboard();
// const grid = document.querySelector(".grid-container-1");

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

// render ships on the board if the gameboard contains a ship
function renderShips(gameboard, gameboardContainer) {
  for (let x = 0; x < gameboard.boardSize; x++) {
    for (let y = 0; y < gameboard.boardSize; y++) {
      if (gameboard.board[x][y] !== null) {
        const ship = gameboard.getShipAt(x, y);
        const cell = gameboardContainer.querySelector(
          `[data-x="${x}"][data-y="${y}"]`
        );
        if (cell) {
          cell.classList.add("ship");
          cell.dataset.shipName = ship.name;
          cell.setAttribute("draggable", "true");
        }
      }
    }
  }
}

export { renderBoard, renderShips };