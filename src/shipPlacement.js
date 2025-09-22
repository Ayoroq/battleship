import { Ship } from "./game.js";
import { renderBoard, renderShips } from "./grid.js";

// Initialize ship placement functionality
function initShipPlacement(gameboard, grid) {
  const shipSelect = document.querySelector(".ship-selector");
  const orientation = document.querySelector(".orientation");

  // Track current ship selection
  let shipSize = parseInt(shipSelect.value) || 0;
  let selectedIndex = 0;
  let shipName = "";
  let orientationValue = orientation.value || "horizontal";

  // Remove green hover effects from all cells
  function clearHover() {
    document.querySelectorAll(".cell.hover").forEach((cell) => {
      cell.classList.remove("hover");
    });
  }

  // Show green preview of where ship will be placed
  function highlightShipPlacement(x, y) {
    clearHover();

    try {
      // Check if starting position is valid
      if (
        x < 0 ||
        y < 0 ||
        x >= gameboard.boardSize ||
        y >= gameboard.boardSize
      )
        return;

      // Calculate ship end position
      const endX = orientationValue === "vertical" ? x + shipSize - 1 : x;
      const endY = orientationValue === "horizontal" ? y + shipSize - 1 : y;

      // Check if ship fits within board
      if (endX >= gameboard.boardSize || endY >= gameboard.boardSize) return;

      // Check for overlaps with existing ships
      for (let i = 0; i < shipSize; i++) {
        const checkX = orientationValue === "vertical" ? x + i : x;
        const checkY = orientationValue === "horizontal" ? y + i : y;
        if (gameboard.board[checkX][checkY] !== null) return;
      }

      // Highlight valid placement with green hover effect
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

  // Place ship on board and render it
  function placeShip(x, y) {
    try {
      const ship = new Ship(`${shipName}`, shipSize);
      gameboard.placeShip(ship, x, y, orientationValue);
      renderShips(gameboard, grid);
      clearHover();
      return true; // Success
    } catch (error) {
      console.error(error.message);
      return false; // Failed
    }
  }

  // Remove placed ship from dropdown and update selection
  function removePlacedShip() {
    shipSelect.remove(selectedIndex);

    // Update to new selection after removal
    if (shipSelect.options.length > 1) {
      shipSize = parseInt(shipSelect.value) || 0;
      selectedIndex = shipSelect.selectedIndex;
      const fullText = shipSelect.options[selectedIndex].text;
      shipName = fullText.replace(/\s*\(\d+\)$/, ""); // Remove size from name
    } else {
      // All ships placed - hide placement interface
      shipSize = 0;
      shipName = "";
      // document.querySelector(".ship-placement").style.display = "none";
    }
  }

  // Get all valid positions for a ship of given size
  function getValidPositions(size) {
    const validPositions = [];

    for (let x = 0; x < gameboard.boardSize; x++) {
      for (let y = 0; y < gameboard.boardSize; y++) {
        // Check horizontal placement
        if (y + size <= gameboard.boardSize) {
          let canPlace = true;
          for (let i = 0; i < size; i++) {
            if (gameboard.board[x][y + i] !== null) {
              canPlace = false;
              break;
            }
          }
          if (canPlace)
            validPositions.push({ x, y, orientation: "horizontal" });
        }

        // Check vertical placement
        if (x + size <= gameboard.boardSize) {
          let canPlace = true;
          for (let i = 0; i < size; i++) {
            if (gameboard.board[x + i][y] !== null) {
              canPlace = false;
              break;
            }
          }
          if (canPlace) validPositions.push({ x, y, orientation: "vertical" });
        }
      }
    }

    return validPositions;
  }

  // Helper function to place ships randomly
  function placeShipsRandomly(ships) {
    Object.entries(ships).forEach(([name, size]) => {
      const validPositions = getValidPositions(size);
      if (validPositions.length > 0) {
        const randomPos =
          validPositions[Math.floor(Math.random() * validPositions.length)];
        const ship = new Ship(name, size);
        gameboard.placeShip(
          ship,
          randomPos.x,
          randomPos.y,
          randomPos.orientation
        );
      }
    });
  }

  // Randomly place all remaining ships
  function randomPlacement() {
    let shipsToPlace = {};

    if (shipSelect.options.length <= 1) {
      // Reset and place all ships
      gameboard.resetBoard();
      renderBoard(gameboard, grid);
      shipsToPlace = {
        Dreadnought: 5,
        Battlecruiser: 4,
        "Heavy Cruiser": 3,
        "Stealth Frigate": 3,
        Interceptor: 2,
      };
    } else {
      // Get remaining ships from dropdown
      const remainingShipsArray = Array.from(shipSelect.options).slice(1);
      remainingShipsArray.forEach((ship) => {
        const shipName = ship.text.replace(/\s*\(\d+\)$/, "");
        const shipSize = parseInt(ship.value);
        shipsToPlace[shipName] = shipSize;
      });
    }

    // Place the ships
    placeShipsRandomly(shipsToPlace);

    // Update UIB
    shipSelect.innerHTML =
      '<option value="" selected disabled>All ships deployed</option>';
    shipSize = 0;
    shipName = "";
    renderShips(gameboard, grid);
    // document.querySelector(".ship-placement").style.display = "none";
  }

  // Update ship selection when dropdown changes
  shipSelect.addEventListener("change", (e) => {
    shipSize = parseInt(e.target.value);
    selectedIndex = e.target.selectedIndex;
    const fullText = e.target.options[selectedIndex].text;
    shipName = fullText.replace(/\s*\(\d+\)$/, ""); // Clean ship name
  });

  // Update orientation when dropdown changes
  orientation.addEventListener("change", (e) => {
    orientationValue = e.target.value;
  });

  // Show placement preview on hover
  grid.addEventListener("mouseover", (e) => {
    if (e.target.classList.contains("cell") && shipSize > 0) {
      const x = parseInt(e.target.dataset.x);
      const y = parseInt(e.target.dataset.y);
      highlightShipPlacement(x, y);
    }
  });

  // Clear preview when mouse leaves grid
  grid.addEventListener("mouseleave", clearHover);

  // Place ship on click
  grid.addEventListener("click", (e) => {
    if (e.target.classList.contains("cell") && shipSize > 0) {
      const x = parseInt(e.target.dataset.x);
      const y = parseInt(e.target.dataset.y);
      if (placeShip(x, y)) {
        removePlacedShip(); // Remove from dropdown if placement successful
      }
    }
  });

  // Random placement button
  const randomBtn = document.querySelector(".random-placement-btn");
  if (randomBtn) {
    randomBtn.addEventListener("click", randomPlacement);
  }

  // Drag and drop functionality
  grid.addEventListener("dragstart", (e) => {
    const shipName = e.target.dataset.shipName;
    if (!shipName) return; // only act on ship cells

    // Store the ship name in the drag data
    e.dataTransfer.setData("text/plain", shipName);
  });

  grid.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
}

export { initShipPlacement };
