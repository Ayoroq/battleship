// This is the module that handles the movement of ships, the drag and drops and the repositioning
import { Ship, Gameboard, Player } from "./game";

const spacePort = document.querySelector(".space-port");
const gridContainer = document.querySelector(".grid-container-1");
const gameBoard = new Gameboard();
const randomizeButton = document.querySelector(".random-placement-btn");

// Create all 5 ships
const shipData = [
  { name: "Dreadnought", size: 5 },
  { name: "Battlecruiser", size: 4 },
  { name: "Heavy Cruiser", size: 3 },
  { name: "Stealth Frigate", size: 3 },
  { name: "Interceptor", size: 2 },
];

function isValidPlacement(ship, x, y, direction) {
  return gameBoard.validatePlacement(ship, x, y, direction);
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

// Randomizing the ship placement
randomizeButton.addEventListener("click", () => {
  if (gameBoard.ships.length === 5 || gameBoard.ships.length === 0) {
    // All ships placed - reset and place all randomly
    gameBoard.resetBoard();
    clearVisualShips();
    placeAllShipsRandomly();
  } else {
    // Some ships placed - keep existing, place remaining randomly
    placeRemainingShipsRandomly();
  }
});

function clearVisualShips() {
  const placedShips = gridContainer.querySelectorAll(".ship");
  placedShips.forEach((ship) => ship.remove());

  // Show all ships back in space-port
  const hiddenShips = spacePort.querySelectorAll(
    '.ship[style*="display: none"]'
  );
  hiddenShips.forEach((ship) => (ship.style.display = ""));
}

function createVisualShip(placement) {
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
  const spacePortShip = spacePort.querySelector(`[data-ship-name="${ship.name}"]`);
  if (spacePortShip) spacePortShip.style.display = "none";
}

function placeAllShipsRandomly() {
  const ships = shipData.map((data) => new Ship(data.name, data.size));
  gameBoard.placeShipsRandomly(ships);
  
  const shipPlacements = gameBoard.getShipPlacements();
  shipPlacements.forEach(createVisualShip);
}

function placeRemainingShipsRandomly() {
  const currentPlacements = gameBoard.getShipPlacements();
  const missingShips = shipData.filter(
    (shipData) =>
      !currentPlacements.some((placement) => placement.ship.name === shipData.name)
  );

  // Create Ship objects and place them randomly
  const shipsToPlace = missingShips.map(data => new Ship(data.name, data.size));
  gameBoard.placeShipsRandomly(shipsToPlace);

  // Get the new placements and create visuals
  const newPlacements = gameBoard.getShipPlacements().filter(
    placement => missingShips.some(data => data.name === placement.ship.name)
  );

  newPlacements.forEach(createVisualShip);
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
      if (e.target.style.display !== "none") {
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
    // Fix coordinate system: X = rows (top/bottom), Y = columns (left/right)
    const dropGridX = Math.floor(offsetY / cellSize); // X = row (vertical position)
    const dropGridY = Math.floor(offsetX / cellSize); // Y = column (horizontal position)

    const shipSize = parseInt(draggedShip.getAttribute("data-ship-size"));
    const shipDirection = draggedShip.getAttribute("data-ship-direction");

    // Adjust placement based on which cell was dragged
    let shipStartX, shipStartY;
    if (shipDirection === "horizontal") {
      shipStartX = dropGridX; // Row stays same for horizontal
      shipStartY = dropGridY - draggedCellIndex; // Adjust column
    } else {
      shipStartX = dropGridX - draggedCellIndex; // Adjust row
      shipStartY = dropGridY; // Column stays same for vertical
    }

    // Create ship object for validation and placement
    const shipName = draggedShip.getAttribute("data-ship-name");
    const ship = new Ship(shipName, shipSize);

    const isValid = isValidPlacement(
      ship,
      shipStartX,
      shipStartY,
      shipDirection
    );

    // Validate placement
    if (isValid) {
      // Update gameboard with ship placement
      gameBoard.placeShip(ship, shipStartX, shipStartY, shipDirection);

      // Create new ship on grid
      const newShip = draggedShip.cloneNode(true);
      newShip.style.position = "absolute";
      newShip.style.left = `${shipStartY * 3}rem`;
      newShip.style.top = `${shipStartX * 3}rem`;
      newShip.style.zIndex = "10";
      newShip.style.opacity = "1";

      // Add grid position attributes
      newShip.setAttribute("grid-row", shipStartX);
      newShip.setAttribute("grid-col", shipStartY);

      gridContainer.appendChild(newShip);

      // Hide original ship
      draggedShip.style.display = "none";
    } else {
      // Reset opacity if placement failed
      draggedShip.style.opacity = "1";
    }
  });
}

export { shipRotation, shipDragAndDrop };
