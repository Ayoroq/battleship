import { Ship } from "./game.js";
import { renderBoard, renderShips } from "./grid.js";

function initShipPlacement(gameboard, grid) {
  let draggedShip = null;

  // Clear hover effects
  function clearHover() {
    document.querySelectorAll(".cell.hover, .cell.invalid").forEach((cell) => {
      cell.classList.remove("hover", "invalid");
    });
  }

  // Check if placement is valid
  function isValidPlacement(x, y, size, direction) {
    if (x < 0 || y < 0 || x >= gameboard.boardSize || y >= gameboard.boardSize) {
      return false;
    }

    const endX = direction === "vertical" ? x + size - 1 : x;
    const endY = direction === "horizontal" ? y + size - 1 : y;

    if (endX >= gameboard.boardSize || endY >= gameboard.boardSize) {
      return false;
    }

    for (let i = 0; i < size; i++) {
      const checkX = direction === "vertical" ? x + i : x;
      const checkY = direction === "horizontal" ? y + i : y;
      if (gameboard.board[checkX][checkY] !== null) {
        return false;
      }
    }

    return true;
  }

  // Highlight placement preview
  function showPlacementPreview(x, y, size, direction, isValid) {
    clearHover();
    
    for (let i = 0; i < size; i++) {
      const cellX = direction === "vertical" ? x + i : x;
      const cellY = direction === "horizontal" ? y + i : y;
      
      if (cellX >= 0 && cellX < gameboard.boardSize && cellY >= 0 && cellY < gameboard.boardSize) {
        const cell = document.querySelector(`[data-x="${cellX}"][data-y="${cellY}"]`);
        if (cell) {
          cell.classList.add(isValid ? "hover" : "invalid");
        }
      }
    }
  }

  // Place ship on board
  function placeShip(x, y, shipData) {
    try {
      const ship = new Ship(shipData.name, shipData.size);
      gameboard.placeShip(ship, x, y, shipData.direction);
      renderShips(gameboard, grid);
      clearHover();
      return true;
    } catch (error) {
      console.error(error.message);
      return false;
    }
  }

  // Spaceport drag events
  const spacePort = document.querySelector(".space-port");
  
  spacePort.addEventListener("dragstart", (e) => {
    if (e.target.classList.contains("ship")) {
      draggedShip = {
        name: e.target.dataset.shipName,
        size: parseInt(e.target.dataset.shipSize),
        direction: e.target.dataset.shipDirection
      };
      
      e.dataTransfer.setData("text/plain", draggedShip.name);
      e.target.style.opacity = "0.4";
    }
  });

  spacePort.addEventListener("dragend", (e) => {
    if (e.target.classList.contains("ship")) {
      e.target.style.opacity = "1";
      draggedShip = null;
      clearHover();
    }
  });

  // Grid drag events
  grid.addEventListener("dragover", (e) => {
    e.preventDefault();
    
    if (e.target.classList.contains("cell") && draggedShip) {
      const x = parseInt(e.target.dataset.x);
      const y = parseInt(e.target.dataset.y);
      
      const isValid = isValidPlacement(x, y, draggedShip.size, draggedShip.direction);
      showPlacementPreview(x, y, draggedShip.size, draggedShip.direction, isValid);
    }
  });

  grid.addEventListener("drop", (e) => {
    e.preventDefault();
    
    if (e.target.classList.contains("cell") && draggedShip) {
      const x = parseInt(e.target.dataset.x);
      const y = parseInt(e.target.dataset.y);
      
      if (placeShip(x, y, draggedShip)) {
        // Remove ship from spaceport
        const shipElement = spacePort.querySelector(`[data-ship-name="${draggedShip.name}"]`);
        if (shipElement) {
          shipElement.parentElement.remove();
        }
      }
    }
  });

  // Ship rotation in spaceport
  spacePort.addEventListener("click", (e) => {
    if (e.target.classList.contains("rotate-ship")) {
      const shipElement = e.target.parentElement.querySelector(".ship");
      if (shipElement) {
        const currentDirection = shipElement.dataset.shipDirection;
        const newDirection = currentDirection === "horizontal" ? "vertical" : "horizontal";
        shipElement.dataset.shipDirection = newDirection;
      }
    }
  });

  // Random placement
  const randomBtn = document.querySelector(".random-placement-btn");
  if (randomBtn) {
    randomBtn.addEventListener("click", () => {
      gameboard.resetBoard();
      renderBoard(gameboard, grid);
      
      const ships = [
        { name: "Dreadnought", size: 5 },
        { name: "Battlecruiser", size: 4 },
        { name: "Heavy Cruiser", size: 3 },
        { name: "Stealth Frigate", size: 3 },
        { name: "Interceptor", size: 2 }
      ];
      
      ships.forEach(({ name, size }) => {
        const validPositions = [];
        
        for (let x = 0; x < gameboard.boardSize; x++) {
          for (let y = 0; y < gameboard.boardSize; y++) {
            ["horizontal", "vertical"].forEach(direction => {
              if (isValidPlacement(x, y, size, direction)) {
                validPositions.push({ x, y, direction });
              }
            });
          }
        }
        
        if (validPositions.length > 0) {
          const randomPos = validPositions[Math.floor(Math.random() * validPositions.length)];
          const ship = new Ship(name, size);
          gameboard.placeShip(ship, randomPos.x, randomPos.y, randomPos.direction);
        }
      });
      
      renderShips(gameboard, grid);
      
      // Hide all ships from spaceport
      document.querySelectorAll(".ship-class").forEach(container => {
        container.style.display = "none";
      });
    });
  }
}

export { initShipPlacement };