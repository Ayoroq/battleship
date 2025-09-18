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
  }else{
        console.log("Grid container found");
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

export { renderBoard };