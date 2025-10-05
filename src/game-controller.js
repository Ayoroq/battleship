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
import { isMultiPlayer } from "./index.js";

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
  const currentPlayerTurn = document.querySelector(".current-player-turn");
  const winnerDisplay = document.querySelector(".winner");
  const winnerDialog = document.querySelector(".finish");

  // function that's used to convert the user's names
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  // Store player names
  let playerNames = {
    player1Name: "Player 1",
    player2Name: "Computer",
  };

  let currentTurn = playerNames.player1Name; // Track whose turn it is

  // function to get the player's names
  function getPlayerNames() {
    const nameForm = document.querySelector(".name-form");
    const player1Input = document.querySelector(".player1-name-input");
    const player2Input = document.querySelector(".player2-name-input");

    if (nameForm) {
      nameForm.addEventListener("submit", (e) => {
        e.preventDefault();

        if (player1Input && player1Input.value.trim() !== "") {
          playerNames.player1Name = capitalizeFirstLetter(
            player1Input.value.trim()
          );
          currentTurn = playerNames.player1Name; // Update currentTurn
        }

        if (isMultiPlayer && player2Input && player2Input.value.trim() !== "") {
          playerNames.player2Name = capitalizeFirstLetter(
            player2Input.value.trim()
          );
        }
      });
    }

    return playerNames;
  }

  function startGame() {
    const start = document.querySelector(".start-btn");
    start.addEventListener("click", () => {
      gameStarted = true;
      currentTurn = playerNames.player1Name; // Ensure currentTurn matches actual name
      currentPlayerTurn.textContent = `${playerNames.player1Name}'s turn`;
      const shipDeploymentTitle = document.querySelector(
        ".ship-placement-title"
      );
      shipDeploymentTitle.style.display = "none";
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
        currentTurn === playerNames.player1Name &&
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

    currentTurn = playerNames.player2Name;
    currentPlayerTurn.textContent = `${playerNames.player2Name}'s turn`;
    
    // Delay enemy attack for better UX
    setTimeout(() => {
      if (gameStarted) {
        enemyAttacker.makeRandomAttack();
        if (detectWinner()) {
          stopGame();
        } else {
          currentTurn = playerNames.player1Name;
          currentPlayerTurn.textContent = `${playerNames.player1Name}'s turn`;
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

  function displayWinner() {
    const winner = detectWinner();
    if (winner) {
      const winnerName = winner === "player" ? playerNames.player1Name : playerNames.player2Name;
      winnerDisplay.textContent = `${winnerName} wins!`;
      winnerDialog.showModal();
      
      if (winner === "player") {
        addConfetti();
      }
    }
  }

  function forfeitGame() {
    const forfeitButton = document.querySelector(".forfeit-btn");
    forfeitButton.addEventListener("click", () => {
      gameStarted = false;
      const winner = currentTurn === playerNames.player1Name ? playerNames.player2Name : playerNames.player1Name;
      winnerDisplay.textContent = `${winner} wins by forfeit!`;
      winnerDialog.showModal();
      handleRestart();
    });
  }

  function handleRestart() {
    if (confettiInterval) {
      clearInterval(confettiInterval);
    }
    const restartButton = document.querySelector(".restart");
    restartButton.addEventListener("click", () => {
      // Reset game state
      gameStarted = false;
      
      // Clear grids
      player.gridContainer.innerHTML = '';
      enemy.gridContainer.innerHTML = '';
      
      // Reset game boards
      player.gameBoard.board = Array(10).fill(null).map(() => Array(10).fill(null));
      player.gameBoard.ships = [];
      enemy.gameBoard.board = Array(10).fill(null).map(() => Array(10).fill(null));
      enemy.gameBoard.ships = [];
      
      // Show ship placement elements
      document.querySelector('.ship-placement-title').style.display = 'block';
      document.querySelector('.enemy-deployment').style.display = 'none';
      document.querySelector('.player-deployment').style.display = 'flex';
      
      winnerDialog.close();
      
      // Reinitialize game
      const newGame = gameController();
      newGame.startGame();
      newGame.getPlayerNames();
    });
  }

  function stopGame() {
    gameStarted = false;
    displayWinner();
    handleRestart();
  }

  handlePlayerAttack();
  forfeitGame();

  return {
    startGame,
    handlePlayerAttack,
    handleEnemyAttack,
    playRound,
    detectWinner,
    stopGame,
    forfeitGame,
    gameStarted,
    getPlayerNames,
  };
};

const game = gameController();
game.startGame();
game.getPlayerNames();

export { gameStarted, checkAllShipsPlaced };
