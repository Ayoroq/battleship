// This is the module that handles the movement of ships, the drag and drops and the repositioning
import { Ship, Gameboard, Player } from "./game";

// Create all 5 ships
const shipData = [
  { name: "Dreadnought", size: 5 },
  { name: "Battlecruiser", size: 4 },
  { name: "Heavy Cruiser", size: 3 },
  { name: "Stealth Frigate", size: 3 },
  { name: "Interceptor", size: 2 },
];

let draggedShip = null;
let draggedCellIndex = null;
let isFromSpacePort = false;

function isValidPlacement(ship, x, y, direction, gameboard) {
  return gameboard.validatePlacement(ship, x, y, direction);
}

function shipRotation(spacePort) {
  spacePort.addEventListener("click", (e) => {
    if (e.target.classList.contains("rotate-ship")) {
      const ship = e.target.previousElementSibling;
      const currentDirection = ship.getAttribute("data-ship-direction");
      const newDirection =
        currentDirection === "horizontal" ? "vertical" : "horizontal";
      ship.setAttribute("data-ship-direction", newDirection);
    }
  });
}

function setupRandomPlacement(randomizeButton, gameboard, gridContainer, spacePort) {
  randomizeButton.addEventListener("click", () => {
    if (gameboard.ships.length === 5 || gameboard.ships.length === 0) {
      // All ships placed - reset and place all randomly
      gameboard.resetBoard();
      clearVisualShips(gridContainer, spacePort);
      placeAllShipsRandomly(gameboard, gridContainer);
    } else {
      // Some ships placed - keep existing, place remaining randomly
      placeRemainingShipsRandomly(gameboard, gridContainer);
    }
    spacePort.style.display = "none";
  });
}

function clearVisualShips(gridContainer, spacePort) {
  const placedShips = gridContainer.querySelectorAll(".ship");
  placedShips.forEach((ship) => ship.remove());

  // Show all ships back in space-port
  const hiddenShips = spacePort.querySelectorAll(
    '.ship[style*="display: none"]'
  );
  hiddenShips.forEach((ship) => (ship.style.display = ""));
}

function createVisualShip(placement, gridContainer, spacePort) {
  const { ship, x, y, direction } = placement;
  
  const newShip = document.createElement("div");
  newShip.classList.add("ship");
  newShip.setAttribute("data-ship-name", ship.name);
  newShip.setAttribute("data-ship-size", ship.length);
  newShip.setAttribute("data-ship-direction", direction);
  newShip.draggable = true;
  newShip.textContent = ship.name;
  newShip.style.position = "absolute";
  newShip.style.left = `${y * 3}rem`;
  newShip.style.top = `${x * 3}rem`;
  newShip.style.zIndex = "10";
  newShip.style.opacity = "1";
  
  // Add grid position attributes
  newShip.setAttribute("grid-row", x);
  newShip.setAttribute("grid-col", y);
  
  gridContainer.appendChild(newShip);
  
  // Hide corresponding ship in space-port
  if (spacePort) {
    const spacePortShip = spacePort.querySelector(`[data-ship-name="${ship.name}"]`);
    if (spacePortShip) spacePortShip.style.display = "none";
  }
}

function placeAllShipsRandomly(gameboard, gridContainer, spacePort = null) {
  const ships = shipData.map((data) => new Ship(data.name, data.size));
  gameboard.placeShipsRandomly(ships);
  
  const shipPlacements = gameboard.getShipPlacements();
  shipPlacements.forEach(placement => createVisualShip(placement, gridContainer, spacePort));
}

function placeRemainingShipsRandomly(gameboard, gridContainer, spacePort = null) {
  const currentPlacements = gameboard.getShipPlacements();
  const missingShips = shipData.filter(
    (shipData) =>
      !currentPlacements.some((placement) => placement.ship.name === shipData.name)
  );

  // Create Ship objects and place them randomly
  const shipsToPlace = missingShips.map(data => new Ship(data.name, data.size));
  gameboard.placeShipsRandomly(shipsToPlace);

  // Get the new placements and create visuals
  const newPlacements = gameboard.getShipPlacements().filter(
    placement => missingShips.some(data => data.name === placement.ship.name)
  );

  newPlacements.forEach(placement => createVisualShip(placement, gridContainer, spacePort));
}

function clearPreviewHighlights(gridContainer) {
  const previewCells = gridContainer.querySelectorAll('.ship-preview, .invalid-preview');
  previewCells.forEach(cell => cell.remove());
}

function highlightShipCells(startX, startY, size, direction, isValid, gridContainer) {
  const className = isValid ? 'ship-preview' : 'invalid-preview';
  
  for (let i = 0; i < size; i++) {
    let cellX, cellY;
    if (direction === 'horizontal') {
      cellX = startX;
      cellY = startY + i;
    } else {
      cellX = startX + i;
      cellY = startY;
    }
    
    // Only highlight if within bounds
    if (cellX >= 0 && cellX < 10 && cellY >= 0 && cellY < 10) {
      // Create a temporary highlight div
      const highlight = document.createElement('div');
      highlight.classList.add(className);
      highlight.style.position = 'absolute';
      highlight.style.left = `${cellY * 3}rem`;
      highlight.style.top = `${cellX * 3}rem`;
      highlight.style.width = '3rem';
      highlight.style.height = '3rem';
      highlight.style.pointerEvents = 'none';
      highlight.style.zIndex = '5';
      isValid ? highlight.classList.add('valid-preview') : highlight.classList.add('invalid-preview');
      highlight.style.border = isValid ? '2px solid green' : '2px solid red';
      
      gridContainer.appendChild(highlight);
    }
  }
}

function calculateDropPosition(e, gridContainer) {
  const gridRect = gridContainer.getBoundingClientRect();
  const offsetX = e.clientX - gridRect.left;
  const offsetY = e.clientY - gridRect.top;
  
  const cellSize = gridRect.width / 10;
  const dropGridX = Math.floor(offsetY / cellSize);
  const dropGridY = Math.floor(offsetX / cellSize);
  
  const shipSize = parseInt(draggedShip.getAttribute("data-ship-size"));
  const shipDirection = draggedShip.getAttribute("data-ship-direction");
  
  // Calculate ship start position
  let shipStartX, shipStartY;
  if (shipDirection === "horizontal") {
    shipStartX = dropGridX;
    shipStartY = dropGridY - draggedCellIndex;
  } else {
    shipStartX = dropGridX - draggedCellIndex;
    shipStartY = dropGridY;
  }
  
  return { shipStartX, shipStartY, shipSize, shipDirection };
}

function getShipCellIndex(e) {
  if (e.target.classList.contains("ship")) {
    const ship = e.target;
    const shipRect = ship.getBoundingClientRect();
    const shipSize = parseInt(ship.getAttribute("data-ship-size"));
    const shipDirection = ship.getAttribute("data-ship-direction");

    // Mouse position relative to ship's top-left corner
    const offsetX = e.clientX - shipRect.left;
    const offsetY = e.clientY - shipRect.top;

    // Calculate cell size based on ship dimensions
    if (shipDirection === "horizontal") {
      const cellSize = shipRect.width / shipSize;
      const cellIndex = Math.floor(offsetX / cellSize);
      return cellIndex;
    } else {
      const cellSize = shipRect.height / shipSize;
      const cellIndex = Math.floor(offsetY / cellSize);
      return cellIndex;
    }
  }
  return null;
}

function shipGridRotation(gridContainer, gameboard) {
  gridContainer.addEventListener("dblclick", (e) => {
    if (e.target.classList.contains("ship")) {
      const ship = e.target;
      const shipName = ship.getAttribute("data-ship-name");
      const currentDirection = ship.getAttribute("data-ship-direction");
      const newDirection = currentDirection === "horizontal" ? "vertical" : "horizontal";
      const currentX = parseInt(ship.getAttribute("grid-row"));
      const currentY = parseInt(ship.getAttribute("grid-col"));
      const shipSize = parseInt(ship.getAttribute("data-ship-size"));
      
      // Remove ship from gameboard temporarily
      const shipToRemove = gameboard.ships.find(s => s.name === shipName);
      if (shipToRemove) {
        gameboard.removeShip(shipToRemove);
      }
      
      // Create temporary ship for validation
      const tempShip = new Ship(shipName, shipSize);
      
      // Check if rotation is valid
      if (isValidPlacement(tempShip, currentX, currentY, newDirection, gameboard)) {
        // Update gameboard with new direction
        gameboard.placeShip(tempShip, currentX, currentY, newDirection);
        
        // Update visual ship
        ship.setAttribute("data-ship-direction", newDirection);
      } else {
        // Restore original placement if rotation invalid
        gameboard.placeShip(shipToRemove, currentX, currentY, currentDirection);
        
        // Flash red to indicate invalid rotation
        const originalBackground = ship.style.backgroundColor;
        ship.style.backgroundColor = "red";
        setTimeout(() => {
          ship.style.backgroundColor = originalBackground;
        }, 200);
      }
    }
  });
}

function shipDragAndDrop(spacePort, gridContainer, gameboard) {
  // Handle dragging from space-port
  spacePort.addEventListener("dragstart", (e) => {
    if (e.target.classList.contains("ship")) {
      e.target.style.opacity = "0.5";
      draggedShip = e.target;
      draggedCellIndex = getShipCellIndex(e);
      isFromSpacePort = true;
      e.dataTransfer.setData("text/plain", e.target.outerHTML);
    }
  });

  spacePort.addEventListener("dragend", (e) => {
    if (e.target.classList.contains("ship")) {
      if (e.target.style.display !== "none") {
        e.target.style.opacity = "1";
      }
      draggedShip = null;
      draggedCellIndex = null;
      isFromSpacePort = false;
      clearPreviewHighlights(gridContainer);
    }
  });

  // Handle dragging ships on grid for repositioning
  gridContainer.addEventListener("dragstart", (e) => {
    if (e.target.classList.contains("ship")) {
      e.target.style.opacity = "0.5";
      draggedShip = e.target;
      draggedCellIndex = getShipCellIndex(e);
      isFromSpacePort = false;
      
      // Remove ship from gameboard temporarily
      const shipName = e.target.getAttribute("data-ship-name");
      const shipToRemove = gameboard.ships.find(ship => ship.name === shipName);
      if (shipToRemove) {
        gameboard.removeShip(shipToRemove);
      }
      
      e.dataTransfer.setData("text/plain", e.target.outerHTML);
    }
  });

  gridContainer.addEventListener("dragend", (e) => {
    if (e.target.classList.contains("ship")) {
      e.target.style.opacity = "1";
      draggedShip = null;
      draggedCellIndex = null;
      isFromSpacePort = false;
      clearPreviewHighlights(gridContainer);
    }
  });

  gridContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    
    if (!draggedShip) return;
    
    // Clear previous highlights
    clearPreviewHighlights(gridContainer);
    
    const { shipStartX, shipStartY, shipSize, shipDirection } = calculateDropPosition(e, gridContainer);
    
    // Create temporary ship for validation
    const shipName = draggedShip.getAttribute("data-ship-name");
    const tempShip = new Ship(shipName, shipSize);
    
    const isValid = isValidPlacement(tempShip, shipStartX, shipStartY, shipDirection, gameboard);
    
    // Highlight the cells
    highlightShipCells(shipStartX, shipStartY, shipSize, shipDirection, isValid, gridContainer);
  });

  gridContainer.addEventListener("drop", (e) => {
    e.preventDefault();

    if (!draggedShip) return;

    const { shipStartX, shipStartY, shipSize, shipDirection } = calculateDropPosition(e, gridContainer);

    // Create ship object for validation and placement
    const shipName = draggedShip.getAttribute("data-ship-name");
    const ship = new Ship(shipName, shipSize);

    const isValid = isValidPlacement(
      ship,
      shipStartX,
      shipStartY,
      shipDirection,
      gameboard
    );

    // Validate placement
    if (isValid) {
      // Update gameboard with ship placement
      gameboard.placeShip(ship, shipStartX, shipStartY, shipDirection);

      // Check if dragging from space-port or repositioning on grid
      if (isFromSpacePort) {
        // Create new ship on grid
        const newShip = draggedShip.cloneNode(true);
        newShip.style.position = "absolute";
        newShip.style.left = `${shipStartY * 3}rem`;
        newShip.style.top = `${shipStartX * 3}rem`;
        newShip.style.zIndex = "10";
        newShip.style.opacity = "1";

        // Add grid position attributes
        newShip.setAttribute("data-ship-direction", shipDirection);
        newShip.setAttribute("grid-row", shipStartX);
        newShip.setAttribute("grid-col", shipStartY);

        gridContainer.appendChild(newShip);

        // Hide original ship
        draggedShip.parentElement.style.display = "none";
      } else {
        // Repositioning existing ship on grid
        draggedShip.style.left = `${shipStartY * 3}rem`;
        draggedShip.style.top = `${shipStartX * 3}rem`;
        draggedShip.setAttribute("data-ship-direction", shipDirection);
        draggedShip.setAttribute("grid-row", shipStartX);
        draggedShip.setAttribute("grid-col", shipStartY);
      }
    } else {
      // Reset opacity if placement failed
      draggedShip.style.opacity = "1";
      
      // If repositioning failed, restore ship to gameboard
      if (draggedShip.parentElement === gridContainer) {
        const oldX = parseInt(draggedShip.getAttribute("grid-row"));
        const oldY = parseInt(draggedShip.getAttribute("grid-col"));
        const oldDirection = draggedShip.getAttribute("data-ship-direction");
        gameboard.placeShip(ship, oldX, oldY, oldDirection);
      }
    }
  });
}



export { 
  shipRotation, 
  shipDragAndDrop, 
  shipGridRotation, 
  setupRandomPlacement,
  placeAllShipsRandomly,
  createVisualShip,
  shipData
};