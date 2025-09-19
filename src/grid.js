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
  const cells = gameboardContainer.querySelectorAll('.cell');
  
  cells.forEach(cell => {
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);
    
    if (gameboard.board[x][y] !== null) {
      cell.classList.add('ship');
    }
  });
}

export { renderBoard, renderShips };