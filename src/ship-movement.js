// This is the module that handles the movement of ships, the drag and drops and the repositioning
import { Ship, Gameboard, Player } from "./game";

const spacePort = document.querySelector(".space-port");
const gridContainer = document.querySelector(".grid-container-1");

function isValidPlacement(gridX, gridY, shipLength, direction) {
  if (direction === "horizontal") {
    return gridX + shipLength <= 10 && gridY < 10 && gridX >= 0 && gridY >= 0;
  } else {
    return gridY + shipLength <= 10 && gridX < 10 && gridX >= 0 && gridY >= 0;
  }
}

function shipRotation() {
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

function shipDragAndDrop() {
  let draggedShip = null;
  let draggedCellIndex = null;

  spacePort.addEventListener("dragstart", (e) => {
    if (e.target.classList.contains("ship")) {
      e.target.style.opacity = "0.5";
      draggedShip = e.target;
      draggedCellIndex = getShipCellIndex(e);
      e.dataTransfer.setData("text/plain", e.target.outerHTML);
    }
  });

  spacePort.addEventListener("dragend", (e) => {
    if (e.target.classList.contains("ship")) {
      if (e.target.style.display !== 'none') {
        e.target.style.opacity = "1";
      }
      draggedShip = null;
      draggedCellIndex = null;
    }
  });

  gridContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  gridContainer.addEventListener("drop", (e) => {
    e.preventDefault();
    
    if (!draggedShip) return;

    const gridRect = gridContainer.getBoundingClientRect();
    const offsetX = e.clientX - gridRect.left;
    const offsetY = e.clientY - gridRect.top;

    const cellSize = gridRect.width / 10;
    const dropGridX = Math.floor(offsetX / cellSize);
    const dropGridY = Math.floor(offsetY / cellSize);

    const shipSize = parseInt(draggedShip.getAttribute("data-ship-size"));
    const shipDirection = draggedShip.getAttribute("data-ship-direction");

    // Adjust placement based on which cell was dragged
    let shipStartX, shipStartY;
    if (shipDirection === "horizontal") {
      shipStartX = dropGridX - draggedCellIndex;
      shipStartY = dropGridY;
    } else {
      shipStartX = dropGridX;
      shipStartY = dropGridY - draggedCellIndex;
    }

    // Validate placement
    if (isValidPlacement(shipStartX, shipStartY, shipSize, shipDirection)) {
      // Create new ship on grid
      const newShip = draggedShip.cloneNode(true);
      newShip.style.position = 'absolute';
      newShip.style.left = `${shipStartX * 3}rem`;
      newShip.style.top = `${shipStartY * 3}rem`;
      newShip.style.zIndex = '10';
      newShip.style.opacity = '1';
      
      gridContainer.appendChild(newShip);
      
      // Hide original ship
      draggedShip.style.opacity = "1";
      draggedShip.style.display = 'none';
    } else {
      // Reset opacity if placement failed
      draggedShip.style.opacity = "1";
    }
  });
}

export { shipRotation, shipDragAndDrop };
