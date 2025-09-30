// Game controller that manages the overall game state and initialization
import { Gameboard } from "./game.js";
import { placeComputerShipsRandomly } from "./ship-movement.JS";
import { 
  shipRotation, 
  shipDragAndDrop, 
  shipGridRotation, 
  setupRandomPlacement,
  placeAllShipsRandomly,
  createGridCells 
} from "./ship-movement.JS";

// Initialize player and enemy ship movement
function initializeGame() {
  // Player setup
  const spacePort = document.querySelector(".space-port");
  const playerGridContainer = document.querySelector(".grid-container-1");
  const playerGameBoard = new Gameboard();
  const randomizeButton = document.querySelector(".random-placement-btn");

  shipRotation(spacePort);
  setupRandomPlacement(randomizeButton, playerGameBoard, playerGridContainer, spacePort);
  shipDragAndDrop(spacePort, playerGridContainer, playerGameBoard);
  shipGridRotation(playerGridContainer, playerGameBoard);
  createGridCells(playerGridContainer);
  
  // Enemy setup
  const enemyGridContainer = document.querySelector(".grid-container-2");
  const enemyGameBoard = new Gameboard();
  createGridCells(enemyGridContainer);
  
  // Place enemy ships randomly
  placeComputerShipsRandomly(enemyGameBoard);
  
  return { 
    player: { gameBoard: playerGameBoard, gridContainer: playerGridContainer, spacePort },
    enemy: { gameBoard: enemyGameBoard, gridContainer: enemyGridContainer }
  };
}


let gameStarted = false;

const gameController = () => {
  const gameState = initializeGame();
  const { player, enemy } = gameState;

  function startGame(){
    const start = document.querySelector(".start-btn");
    start.addEventListener("click", () => {
      gameStarted = true;
      const randomizeButton = document.querySelector(".random-placement-btn");
      randomizeButton.style.display = "none";
      start.style.display = "none";
    })
  }

  const handlePlayerAttack = () => {
    enemy.gridContainer.addEventListener("click", (e) => {
      if (gameStarted && e.target.classList.contains("grid-cell")) {
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);
        const attackResult = enemy.gameBoard.receiveAttack(x, y);
        if (attackResult.result === "hit") {
          e.target.classList.add("hit");
          console.log(`Hit ${attackResult.ship.name} at cell index ${attackResult.cellIndex}`);
        } else if (attackResult.result === "miss") {
          e.target.classList.add("miss");
        }
      }
    })
  }

  const handleEnemyAttack = () => {
    const makeRandomAttack = () => {
      let x, y;
      do {
        x = Math.floor(Math.random() * 10);
        y = Math.floor(Math.random() * 10);
      } while (player.gameBoard.board[x][y] === 'hit' || player.gameBoard.board[x][y] === 'miss');
      
      const attackResult = player.gameBoard.receiveAttack(x, y);
      const targetCell = player.gridContainer.querySelector(`[data-x="${x}"][data-y="${y}"]`);
      
      if (attackResult.result === "hit") {
        targetCell.classList.add("hit");
        console.log(`Enemy hit your ${attackResult.ship.name} at cell index ${attackResult.cellIndex}`);
        return { hit: true, ship: attackResult.ship, cellIndex: attackResult.cellIndex };
      } else if (attackResult.result === "miss") {
        targetCell.classList.add("miss");
        return { hit: false };
      }
    }
    
    return { makeRandomAttack };
  }

  return {startGame, handlePlayerAttack, handleEnemyAttack, gameStarted };
}

const game = gameController();
game.startGame();


export { gameStarted };