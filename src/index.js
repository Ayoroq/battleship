import "./reset.css";
import "./style.css";
import { Ship, Gameboard, Player } from "./game.js";
import { renderBoard, renderShips } from "./grid.js";

const gameboard = new Gameboard();
const grid = document.querySelector(".grid-container-1");

// listen for when a user selects a ship
const shipSelect = document.querySelector(".ship-selector");
const orientation = document.querySelector(".orientation");

let shipSize = parseInt(shipSelect.value) || 0;
let orientationValue = orientation.value || "horizontal";

shipSelect.addEventListener("change", (e) => {
  shipSize = parseInt(e.target.value);
  console.log("Ship size:", shipSize);
  console.log(shipSelect);
});

orientation.addEventListener("change", (e) => {
  orientationValue = e.target.value;
  console.log("Orientation:", orientationValue);
});

renderBoard(gameboard, grid);
renderShips(gameboard, grid);

function clearHover() {
  document.querySelectorAll(".cell.hover").forEach((cell) => {
    cell.classList.remove("hover");
  });
}

function highlightShipPlacement(x, y) {
  clearHover();

  try {
    // Quick validation
    if (x < 0 || y < 0 || x >= gameboard.boardSize || y >= gameboard.boardSize)
      return;

    const endX = orientationValue === "vertical" ? x + shipSize - 1 : x;
    const endY = orientationValue === "horizontal" ? y + shipSize - 1 : y;

    if (endX >= gameboard.boardSize || endY >= gameboard.boardSize) return;

    // Check for overlaps
    for (let i = 0; i < shipSize; i++) {
      const checkX = orientationValue === "vertical" ? x + i : x;
      const checkY = orientationValue === "horizontal" ? y + i : y;
      if (gameboard.board[checkX][checkY] !== null) return;
    }

    // Highlight valid placement
    for (let i = 0; i < shipSize; i++) {
      const cellX = orientationValue === "vertical" ? x + i : x;
      const cellY = orientationValue === "horizontal" ? y + i : y;
      const cell = document.querySelector(
        `[data-x="${cellX}"][data-y="${cellY}"]`
      );
      if (cell) cell.classList.add("hover");
    }
  } catch (error) {}
}

grid.addEventListener("mouseover", (e) => {
  if (e.target.classList.contains("cell") && shipSize > 0) {
    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);
    highlightShipPlacement(x, y);
  }
});

grid.addEventListener("mouseleave", clearHover);
