// Game controller that manages the overall game state and initialization
import { Gameboard } from "./game.js";
import { placeComputerShipsRandomly } from "./ship-movement.JS";
import { 
  shipRotation, 
  shipDragAndDrop, 
  shipGridRotation, 
  setupRandomPlacement,
  placeAllShipsRandomly 
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
  
  // Enemy setup
  const enemyGridContainer = document.querySelector(".grid-container-2");
  const enemyGameBoard = new Gameboard();
  
  // Place enemy ships randomly
  placeComputerShipsRandomly(enemyGameBoard);
  
  return { 
    player: { gameBoard: playerGameBoard, gridContainer: playerGridContainer, spacePort },
    enemy: { gameBoard: enemyGameBoard, gridContainer: enemyGridContainer }
  };
}

let gameStarted = false;

function playGame(){
  const start = document.querySelector(".start-btn");
  start.addEventListener("click", () => {
    gameStarted = true;
    const randomizeButton = document.querySelector(".random-placement-btn");
    randomizeButton.style.display = "none";
    start.style.display = "none";
  })
}

playGame();

export { initializeGame, gameStarted };