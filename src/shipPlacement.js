import { Ship } from "./game.js";
import { renderShips } from "./grid.js";

function initShipPlacement(gameboard, grid) {
  const shipSelect = document.querySelector(".ship-selector");
  const orientation = document.querySelector(".orientation");

  let shipSize = parseInt(shipSelect.value) || 0;
  let selectedIndex = 0
  let shipName = ''
  let orientationValue = orientation.value || "horizontal";

  function clearHover() {
    document.querySelectorAll(".cell.hover").forEach((cell) => {
      cell.classList.remove("hover");
    });
  }

  function highlightShipPlacement(x, y) {
    clearHover();

    try {
      if (
        x < 0 ||
        y < 0 ||
        x >= gameboard.boardSize ||
        y >= gameboard.boardSize
      )
        return;

      const endX = orientationValue === "vertical" ? x + shipSize - 1 : x;
      const endY = orientationValue === "horizontal" ? y + shipSize - 1 : y;

      if (endX >= gameboard.boardSize || endY >= gameboard.boardSize) return;

      for (let i = 0; i < shipSize; i++) {
        const checkX = orientationValue === "vertical" ? x + i : x;
        const checkY = orientationValue === "horizontal" ? y + i : y;
        if (gameboard.board[checkX][checkY] !== null) return;
      }

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

  function placeShip(x, y) {
    try {
      const ship = new Ship(`${shipName}`, shipSize);
      console.log(`ship name is ${ship.name} and length is ${ship.length}`);
      gameboard.placeShip(ship, x, y, orientationValue);
      renderShips(gameboard, grid);
      clearHover();
    } catch (error) {
      console.error(error.message);
    }
  }

  function removePlacedShip() {
    shipSelect.remove(selectedIndex)
  }

  // Event listeners
  shipSelect.addEventListener("change", (e) => {
    shipSize = parseInt(e.target.value);
    selectedIndex = e.target.selectedIndex;
    const fullText = e.target.options[selectedIndex].text;
    shipName = fullText.replace(/\s*\(\d+\)$/, '');
  });

  orientation.addEventListener("change", (e) => {
    orientationValue = e.target.value;
  });

  grid.addEventListener("mouseover", (e) => {
    if (e.target.classList.contains("cell") && shipSize > 0) {
      const x = parseInt(e.target.dataset.x);
      const y = parseInt(e.target.dataset.y);
      highlightShipPlacement(x, y);
    }
  });

  grid.addEventListener("mouseleave", clearHover);

  grid.addEventListener("click", (e) => {
    if (e.target.classList.contains("cell") && shipSize > 0) {
      const x = parseInt(e.target.dataset.x);
      const y = parseInt(e.target.dataset.y);
      placeShip(x, y);
      removePlacedShip();
    }
  });
}

export { initShipPlacement };
