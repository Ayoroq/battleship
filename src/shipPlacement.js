import { Ship } from "./game.js";
import { renderBoard, renderShips } from "./grid.js";

function shipPlacement(gameboard, grid) {
  let currentDragData = null;

  function validatePlacement(ship, x, y, direction) {
    //check if ship placement is valid
    if (!gameboard.validatePlacement(ship, x, y, direction)) return false;
    return true;
  }

  function placeShipOnGrid(ship, x, y, direction) {
    gameboard.placeShip(ship, x, y, direction);
    renderShips(gameboard, grid);
  }

  function showShipPreview(cellX, cellY, shipLength, shipDirection, grabbedIndex) {
    // Calculate ship start position based on grabbed segment
    let startX, startY;
    if (shipDirection === "horizontal") {
      startX = cellX;
      startY = cellY - grabbedIndex;
    } else {
      startX = cellX - grabbedIndex;
      startY = cellY;
    }
    
    // Clear previous preview
    grid.querySelectorAll(".cell").forEach(cell => {
      cell.classList.remove("ship-preview", "invalid-preview");
    });
    
    // Create temporary ship for validation
    const tempShip = new Ship("temp", shipLength);
    const isValid = validatePlacement(tempShip, startX, startY, shipDirection);
    
    // Show preview
    for (let i = 0; i < shipLength; i++) {
      const previewX = shipDirection === "horizontal" ? startX : startX + i;
      const previewY = shipDirection === "horizontal" ? startY + i : startY;
      const previewCell = grid.querySelector(`[data-x="${previewX}"][data-y="${previewY}"]`);
      
      if (previewCell) {
        previewCell.classList.add(isValid ? "ship-preview" : "invalid-preview");
      }
    }
  }

  document.addEventListener("click", (e) => {
    // rotate the ships when the ship button is pressed
    if (e.target.classList.contains("rotate-ship")) {
      const ship = e.target.previousElementSibling;
      const currentDirection = ship.dataset.shipDirection;
      const newDirection =
        currentDirection === "horizontal" ? "vertical" : "horizontal";
      ship.dataset.shipDirection = newDirection;
    }

    // Place the ships randomly on the board
    if (e.target.classList.contains("random-placement-btn")) {
      gameboard.resetBoard();
      const ships = [
        new Ship("Dreadnought", 5),
        new Ship("Battlecruiser", 4),
        new Ship("Heavy Cruiser", 3),
        new Ship("Stealth Frigate", 3),
        new Ship("Interceptor", 2),
      ];

      gameboard.placeShipsRandomly(ships);
      document.querySelector('.space-port').style.display = "none";
      renderBoard(gameboard, grid);
      renderShips(gameboard, grid);
    }
  });

  // The drag and drop event listeners
  document.addEventListener("dragstart", (e) => {
    if (e.target.classList.contains("ship")) {
      e.target.style.opacity = "0.5";
      const shipName = e.target.dataset.shipName;
      const shipLength = parseInt(e.target.dataset.shipSize);
      const shipDirection = e.target.dataset.shipDirection;

      // This is used to determine what part of the ship was selected during dragging
      let grabbedIndex;
      if (shipDirection === "horizontal") {
        const segmentWidth = e.target.offsetWidth / shipLength;
        grabbedIndex = Math.floor(e.offsetX / segmentWidth);
      } else {
        const segmentHeight = e.target.offsetHeight / shipLength;
        grabbedIndex = Math.floor(e.offsetY / segmentHeight);
      }

      const dragData = { shipName, shipLength, shipDirection, grabbedIndex };
      currentDragData = dragData;
      e.dataTransfer.setData(
        "text/plain",
        JSON.stringify(dragData)
      );
    }
  });

  document.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (e.target.classList.contains("cell") && currentDragData) {
      const cellX = parseInt(e.target.dataset.x);
      const cellY = parseInt(e.target.dataset.y);
      const { shipLength, shipDirection, grabbedIndex } = currentDragData;
      
      showShipPreview(cellX, cellY, shipLength, shipDirection, grabbedIndex);
    }
  });

  document.addEventListener("drop", (e) => {
    e.preventDefault();
    if (e.target.classList.contains("cell") && currentDragData) {
      const cellX = parseInt(e.target.dataset.x);
      const cellY = parseInt(e.target.dataset.y);
      const { shipName, shipLength, shipDirection, grabbedIndex } = currentDragData;
      
      // Calculate ship start position
      let startX, startY;
      if (shipDirection === "horizontal") {
        startX = cellX;
        startY = cellY - grabbedIndex;
      } else {
        startX = cellX - grabbedIndex;
        startY = cellY;
      }
      
      // Create and place ship if valid
      const ship = new Ship(shipName, shipLength);
      if (validatePlacement(ship, startX, startY, shipDirection)) {
        placeShipOnGrid(ship, startX, startY, shipDirection);
        currentDragData = null;
        // remove the ship after it has been placed
        const shipElement = document.querySelector(`.ship[data-ship-name="${shipName}"]`);
        const shipClass = shipElement.parentElement
        shipClass.style.display = "none";
      }
    }
  });

  document.addEventListener("dragend", (e) => {
    if (e.target.classList.contains("ship")) {
      e.target.style.opacity = "1";
      currentDragData = null;
      // Clear preview on drag end
      grid.querySelectorAll(".cell").forEach(cell => {
        cell.classList.remove("ship-preview", "invalid-preview");
      });
    }
  });
}

export { shipPlacement };
