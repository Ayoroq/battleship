// Game controller that manages the overall game state and initialization
import { Gameboard } from "./game.js";
import { placeComputerShipsRandomly } from "./ship-movement.JS";
import {
  shipRotation,
  shipDragAndDrop,
  shipGridRotation,
  setupRandomPlacement,
  placeAllShipsRandomly,
  createGridCells,
} from "./ship-movement.JS";

// Initialize player and enemy ship movement
function initializeGame() {
  // Player setup
  const spacePort = document.querySelector(".space-port");
  const playerGridContainer = document.querySelector(".grid-container-player");
  const playerGameBoard = new Gameboard();
  const randomizeButton = document.querySelector(".random-placement-btn");

  shipRotation(spacePort);
  setupRandomPlacement(
    randomizeButton,
    playerGameBoard,
    playerGridContainer,
    spacePort
  );
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
    player: {
      gameBoard: playerGameBoard,
      gridContainer: playerGridContainer,
      spacePort,
    },
    enemy: { gameBoard: enemyGameBoard, gridContainer: enemyGridContainer },
  };
}

let gameStarted = false;

function checkAllShipsPlaced(gameboard) {
  const startButton = document.querySelector(".start-btn");
  const shipPlacement = document.querySelector(".ship-placement");
  const allShipsPlaced = gameboard.ships.length === 5;
  if (startButton && !gameStarted) {
    startButton.style.display = allShipsPlaced ? "block" : "none";
  }
  if (shipPlacement && allShipsPlaced) {
    shipPlacement.remove(); // Remove space-port after all ships are placed
  }
}

const gameController = () => {
  const gameState = initializeGame();
  const { player, enemy } = gameState;
  const enemyAttacker = handleEnemyAttack();

  function startGame() {
    const start = document.querySelector(".start-btn");
    start.addEventListener("click", () => {
      gameStarted = true;
      const buttonContainer = document.querySelector(".button-container");
      buttonContainer.remove();
    });
  }

  function markShipHit(gridContainer, ship, cellIndex) {
    const shipElement = gridContainer.querySelector(
      `[data-ship-name="${ship.name}"]`
    );
    if (shipElement) {
      const cell = shipElement.querySelector(
        `[data-cell-index="${cellIndex}"]`
      );
      if (cell) {
        cell.style.backgroundColor = "red";
        cell.classList.add("hit");
      }
    }
  }

  function handlePlayerAttack() {
    enemy.gridContainer.addEventListener("click", (e) => {
      if (
        gameStarted &&
        e.target.classList.contains("grid-cell") &&
        !e.target.classList.contains("hit") &&
        !e.target.classList.contains("miss")
      ) {
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);
        const attackResult = enemy.gameBoard.receiveAttack(x, y);
        if (attackResult.result === "hit") {
          e.target.classList.add("hit");
          markShipHit(
            enemy.gridContainer,
            attackResult.ship,
            attackResult.cellIndex
          );
          console.log(
            `Hit ${attackResult.ship.name} at cell index ${attackResult.cellIndex}`
          );
        } else if (attackResult.result === "miss") {
          e.target.classList.add("miss");
        }
        playRound();
      }
    });
  }

  function handleEnemyAttack() {
    const makeRandomAttack = () => {
      let x, y;
      do {
        x = Math.floor(Math.random() * 10);
        y = Math.floor(Math.random() * 10);
      } while (
        player.gameBoard.board[x][y] === "hit" ||
        player.gameBoard.board[x][y] === "miss"
      );

      const attackResult = player.gameBoard.receiveAttack(x, y);
      const targetCell = player.gridContainer.querySelector(
        `[data-x="${x}"][data-y="${y}"]`
      );

      if (attackResult.result === "hit") {
        targetCell.classList.add("hit");
        markShipHit(
          player.gridContainer,
          attackResult.ship,
          attackResult.cellIndex
        );
        console.log(
          `Enemy hit your ${attackResult.ship.name} at cell index ${attackResult.cellIndex}`
        );
        return {
          hit: true,
          ship: attackResult.ship,
          cellIndex: attackResult.cellIndex,
        };
      } else if (attackResult.result === "miss") {
        targetCell.classList.add("miss");
        return { hit: false };
      }
    };

    return { makeRandomAttack };
  }

  function playRound() {
    if (detectWinner()) {
      stopGame();
      return;
    }

    setTimeout(() => {
      if (gameStarted) {
        enemyAttacker.makeRandomAttack();
        if (detectWinner()) {
          stopGame();
        }
      }
    }, 1000);
  }

  let confettiInterval;

  function addConfetti() {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    confettiInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(confettiInterval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }

  function detectWinner() {
    if (player.gameBoard.allShipsSunk()) {
      return "enemy";
    } else if (enemy.gameBoard.allShipsSunk()) {
      return "player";
    }
    return null;
  }

  function displayWinner(){
    const winner = detectWinner();
    const winnerDisplay = document.querySelector(".winner-display");
    if (winner) {
      winnerDisplay.textContent = `${winner} wins!`;
      winnerDisplay.style.display = "block";
    }

    if (winner === "player") {
      addConfetti();
    }
  }

  function handleRestart(){
    if(confettiInterval){
      clearInterval(confettiInterval);
    }
    const restartButton = document.querySelector(".restart-btn");

  }

  function stopGame() {
    gameStarted = false;
    const winner = detectWinner();
    console.log(`Game Over! Winner: ${winner}`);
  }

  handlePlayerAttack();

  return {
    startGame,
    handlePlayerAttack,
    handleEnemyAttack,
    playRound,
    detectWinner,
    stopGame,
    gameStarted,
  };
};

const game = gameController();
game.startGame();

export { gameStarted, checkAllShipsPlaced };
