import { Ship } from "./game.js";
import { renderBoard } from "./grid.js";

function shipPlacement(gameboard, grid) {
  function validatePlacement(ship, x, y, direction) {
    //check if ship placement is valid
    if (!gameboard.validatePlacement(ship, x, y, direction)) return false;
    return true;
  }

  function placeShipOnGrid(ship, x, y, direction) {
    gameboard.placeShip(ship, x, y, direction);
    renderShips(gameboard, grid);
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
        new Ship("Carrier", 5),
        new Ship("Battleship", 4),
        new Ship("Destroyer", 3),
        new Ship("Submarine", 3),
        new Ship("Patrol Boat", 2),
      ];

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

      e.dataTransfer.setData(
        "text/plain",
        JSON.stringify({ shipName, shipLength, shipDirection, grabbedIndex })
      );
    }
  });

  document.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (e.target.classList.contains("cell")) {
      const x = parseInt(e.target.dataset.x);
      const y = parseInt(e.target.dataset.y);
      const shipData = JSON.parse(e.dataTransfer.getData("text/plain"));
      // validate if the x,y,direction,size is a valid position for ship
    }
  });

  document.addEventListener("dragend", (e) => {
    if (e.target.classList.contains("ship")) {
      e.target.style.opacity = "1";
    }
  });
}

export { shipPlacement };
