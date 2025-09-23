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

function renderShips(gameboard, gameboardContainer) {
  // Clear existing ship elements
  gameboardContainer.querySelectorAll('.ship-element').forEach(ship => ship.remove());
  
  const processedShips = new Set();
  
  for (let x = 0; x < gameboard.boardSize; x++) {
    for (let y = 0; y < gameboard.boardSize; y++) {
      const ship = gameboard.board[x][y];
      if (ship && !processedShips.has(ship)) {
        processedShips.add(ship);
        
        // Find ship direction and start position
        let direction = 'horizontal';
        let startX = x, startY = y;
        
        // Check if ship extends vertically
        if (x + 1 < gameboard.boardSize && gameboard.board[x + 1][y] === ship) {
          direction = 'vertical';
        }
        
        // Create ship element
        const shipElement = document.createElement('div');
        shipElement.className = 'ship-element';
        //shipElement.classList.add('ship');
        shipElement.draggable = true;
        shipElement.dataset.shipName = ship.name;
        shipElement.dataset.shipSize = ship.length;
        shipElement.dataset.shipDirection = direction;
        shipElement.textContent = `${ship.name}`;
        
        // Position the ship absolutely
        const containerWidth = gameboardContainer.clientWidth;
        const containerHeight = gameboardContainer.clientHeight;
        const cellWidth = containerWidth / gameboard.boardSize;
        const cellHeight = containerHeight / gameboard.boardSize;
        
        shipElement.style.position = 'absolute';
        shipElement.style.left = `${startY * cellWidth + 1}px`;
        shipElement.style.top = `${startX * cellHeight + 1}px`;
        
        if (direction === 'horizontal') {
          shipElement.style.width = `${ship.length * cellWidth - 2}px`;
          shipElement.style.height = `${cellHeight - 2}px`;
        } else {
          shipElement.style.width = `${cellWidth - 2}px`;
          shipElement.style.height = `${ship.length * cellHeight - 2}px`;
        }
        
        gameboardContainer.appendChild(shipElement);
      }
    }
  }
}

export { renderBoard, renderShips };