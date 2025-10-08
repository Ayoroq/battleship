// Game controller that manages the overall game state and initialization
import { Gameboard } from "./game.js";
import { placeComputerShipsRandomly } from "./ship-movement.js";
import {
  shipRotation,
  shipDragAndDrop,
  shipGridRotation,
  setupRandomPlacement,
  createGridCells,
} from "./ship-movement.js";

// Constants
const SHIP_PLACEMENT_TEMPLATE = `
  <div class="grid-container">
    <div class="grid-container-player grid"></div>
    <div class="button-container">
      <div class="random-placement">
        <button class="random-placement-btn clickable" type="button">
          Random Placement
        </button>
      </div>
      <div class="start-game">
        <button class="start-btn clickable" type="button" style="display: none;">
          Start Game
        </button>
      </div>
    </div>
  </div>
  <div class="ship-placement">
    <div class="space-port">
      <div class="ship-class">
        <div class="ship" data-ship-name="Dreadnought" draggable="true" data-ship-size="5" data-ship-direction="horizontal"></div>
        <button class="rotate-ship" type="button">
          <img src="0318bfb7c1037aa6bc68.svg" alt="">
        </button>
      </div>
      <div class="ship-class">
        <div class="ship" data-ship-name="Battlecruiser" draggable="true" data-ship-size="4" data-ship-direction="horizontal"></div>
        <button class="rotate-ship" type="button">
          <img src="0318bfb7c1037aa6bc68.svg" alt="">
        </button>
      </div>
      <div class="ship-class">
        <div class="ship" data-ship-name="Heavy Cruiser" draggable="true" data-ship-size="3" data-ship-direction="horizontal"></div>
        <button class="rotate-ship" type="button">
          <img src="0318bfb7c1037aa6bc68.svg" alt="">
        </button>
      </div>
      <div class="ship-class">
        <div class="ship" data-ship-name="Stealth Frigate" draggable="true" data-ship-size="3" data-ship-direction="horizontal"></div>
        <button class="rotate-ship" type="button">
          <img src="0318bfb7c1037aa6bc68.svg" alt="">
        </button>
      </div>
      <div class="ship-class">
        <div class="ship" data-ship-name="Interceptor" draggable="true" data-ship-size="2" data-ship-direction="horizontal"></div>
        <button class="rotate-ship" type="button">
          <img src="0318bfb7c1037aa6bc68.svg" alt="">
        </button>
      </div>
    </div>
  </div>
`;

// Helper functions
function safeQuerySelector(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    console.warn(`Element not found: ${selector}`);
  }
  return element;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

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
let isMultiPlayer = false;

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

import { createSinglePlayerController } from './single-player-controller.js';
import { createMultiPlayerController } from './multiplayer-controller.js';

const gameController = () => {
  let gameController = null;

  // DOM elements cache
  const elements = {
    loadingScreen: safeQuerySelector(".loading-screen"),
    main: safeQuerySelector(".main"),
    shipPlacementScreen: safeQuerySelector(".ship-placement-screen"),
    gameModeSelectionScreen: safeQuerySelector(".game-mode-selection-screen"),
    nameScreen: safeQuerySelector(".name-screen"),
    startGameBtn: safeQuerySelector(".start-btn"),
    shipDeploymentTitle: safeQuerySelector(".ship-placement-title"),
    enemyDeployment: safeQuerySelector(".enemy-deployment"),
    shipPlacementHeader: safeQuerySelector(".ship-placement-header"),
    userPlacementScreen: safeQuerySelector(".user-ship-placement"),
    turnsController: safeQuerySelector(".turns-controller"),
    rulesDialog: safeQuerySelector(".rules-dialog"),
    viewRulesBtn: safeQuerySelector(".show-rules-btn"),
    beginMission: safeQuerySelector(".continue-btn"),
    endGame: safeQuerySelector(".end"),
    currentPlayerTurn: safeQuerySelector(".current-player-turn"),
    winnerDisplay: safeQuerySelector(".winner"),
    winnerDialog: safeQuerySelector(".finish"),
  };

  // Game state
  let playerNames = {
    player1Name: "Player 1",
    player2Name: "Computer",
  };
  let currentTurn = playerNames.player1Name;
  let confettiInterval;

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
  
  // Initialize game functions
  getPlayerNames();
  startGame();
  handlePlayerAttack();
  handlePlayerShipMovement();
  forfeitGame();
  handleEndGame();

  function startGame() {
    const start = safeQuerySelector(".start-btn");
    if (!start) return;
    
    start.addEventListener("click", () => {
      gameStarted = true;
      currentTurn = playerNames.player1Name;
      if (elements.currentPlayerTurn) {
        elements.currentPlayerTurn.textContent = `${playerNames.player1Name}'s turn`;
      }
      if (elements.shipDeploymentTitle) {
        elements.shipDeploymentTitle.style.display = "none";
      }
      const buttonContainer = safeQuerySelector(".button-container");
      if (buttonContainer) {
        buttonContainer.remove();
      }
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
  
  function handlePlayerShipMovement() {
    let shipMoved = false;
    
    player.gridContainer.addEventListener("drop", (e) => {
      if (gameStarted && currentTurn === playerNames.player1Name) {
        shipMoved = true;
      }
    });
    
    player.gridContainer.addEventListener("dragend", (e) => {
      if (gameStarted && currentTurn === playerNames.player1Name && e.target.classList.contains("ship") && shipMoved) {
        shipMoved = false;
        playRound();
      }
    });
    
    player.gridContainer.addEventListener("dblclick", (e) => {
      if (gameStarted && currentTurn === playerNames.player1Name && e.target.classList.contains("ship")) {
        playRound();
      }
    });
  }

  function handleEnemyAttack() {
    let huntTargets = [];
    
    const makeSmartAttack = () => {
      let x, y;
      
      if (huntTargets.length > 0) {
        // Target mode: attack adjacent cells
        const target = huntTargets.shift();
        x = target.x;
        y = target.y;
      } else {
        // Hunt mode: checkerboard pattern, then random
        let attempts = 0;
        do {
          x = Math.floor(Math.random() * 10);
          y = Math.floor(Math.random() * 10);
          attempts++;
        } while (
          (player.gameBoard.board[x][y] === "hit" ||
           player.gameBoard.board[x][y] === "miss" ||
           (attempts < 50 && (x + y) % 2 !== 0)) &&
          attempts < 100
        );
      }

      const attackResult = player.gameBoard.receiveAttack(x, y);
      if (attackResult.result === "already_attacked") {
        return makeSmartAttack();
      }
      
      const targetCell = player.gridContainer.querySelector(
        `[data-x="${x}"][data-y="${y}"]`
      );
      
      if (!targetCell) {
        return { hit: false };
      }

      if (attackResult.result === "hit") {
        targetCell.classList.add("hit");
        markShipHit(player.gridContainer, attackResult.ship, attackResult.cellIndex);
        
        if (!attackResult.ship.isSunk()) {
          // Add adjacent cells to hunt targets
          const adjacent = [
            {x: x-1, y}, {x: x+1, y}, {x, y: y-1}, {x, y: y+1}
          ].filter(pos => 
            pos.x >= 0 && pos.x < 10 && pos.y >= 0 && pos.y < 10 &&
            player.gameBoard.board[pos.x][pos.y] !== "hit" &&
            player.gameBoard.board[pos.x][pos.y] !== "miss"
          );
          huntTargets.unshift(...adjacent);
        } else {
          huntTargets = [];
        }
        
        return { hit: true, ship: attackResult.ship, cellIndex: attackResult.cellIndex };
      } else if (attackResult.result === "miss") {
        targetCell.classList.add("miss");
        return { hit: false };
      }
    };
    
    return { makeSmartAttack };
  }

  function playRound() {
    if (detectWinner()) {
      stopGame();
      return;
    }

    currentTurn = playerNames.player2Name;
    if (elements.currentPlayerTurn) {
      elements.currentPlayerTurn.textContent = `${playerNames.player2Name}'s turn`;
    }

    // Delay enemy attack for better UX
    setTimeout(() => {
      if (gameStarted) {
        enemyAttacker.makeSmartAttack();
        if (detectWinner()) {
          stopGame();
        } else {
          currentTurn = playerNames.player1Name;
          if (elements.currentPlayerTurn) {
            elements.currentPlayerTurn.textContent = `${playerNames.player1Name}'s turn`;
          }
        }
      }
    }, 1000);
  }

  function addConfetti() {
    if (typeof confetti === "undefined") {
      console.error("Confetti library not loaded");
      return;
    }

    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 99999,
    };

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
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() * 0.3 + 0.1 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() * 0.3 + 0.1 },
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

    if (winner && elements.winnerDisplay && elements.winnerDialog) {
      const winnerName =
        winner === "player" ? playerNames.player1Name : playerNames.player2Name;
      elements.winnerDisplay.textContent = `${winnerName} wins!`;
      elements.winnerDialog.showModal();

      if (winner === "player") {
        addConfetti();
      }
    }
  }

  function forfeitGame() {
    const forfeitButton = safeQuerySelector(".forfeit-btn");
    if (!forfeitButton) return;
    
    forfeitButton.addEventListener("click", () => {
      gameStarted = false;
      const winner =
        currentTurn === playerNames.player1Name
          ? playerNames.player2Name
          : playerNames.player1Name;
      
      if (elements.winnerDisplay && elements.winnerDialog) {
        elements.winnerDisplay.textContent = `${winner} wins by forfeit!`;
        elements.winnerDialog.showModal();
      }

      const isHumanWinner =
        winner === playerNames.player1Name ||
        (isMultiPlayer && winner === playerNames.player2Name);
      if (isHumanWinner) {
        addConfetti();
      }
    });
  }

  function handleEndGame() {
    if (!elements.endGame) return;
    
    elements.endGame.addEventListener("click", () => {
      sessionStorage.setItem('skipLoading', 'true');
      location.reload();
    });
  }

  function resetGameState() {
    if (confettiInterval) {
      clearInterval(confettiInterval);
    }
    gameStarted = false;
    currentTurn = playerNames.player1Name;
    player.gameBoard.resetBoard();
    enemy.gameBoard.resetBoard();
  }

  function resetPlayerDeployment() {
    const playerDeployment = safeQuerySelector(".player-deployment");
    if (playerDeployment) {
      playerDeployment.innerHTML = SHIP_PLACEMENT_TEMPLATE;
    }
  }

  function reinitializeGameComponents() {
    enemy.gridContainer.innerHTML = "";
    createGridCells(enemy.gridContainer);
    if (!isMultiPlayer) {
      placeComputerShipsRandomly(enemy.gameBoard);
    }

    const newSpacePort = safeQuerySelector(".space-port");
    const newPlayerGrid = safeQuerySelector(".grid-container-player");
    
    if (newSpacePort && newPlayerGrid) {
      createGridCells(newPlayerGrid);
      player.gridContainer = newPlayerGrid;
      player.spacePort = newSpacePort;

      shipRotation(newSpacePort);
      shipDragAndDrop(newSpacePort, newPlayerGrid, player.gameBoard);
      shipGridRotation(newPlayerGrid, player.gameBoard);

      const randomizeButton = safeQuerySelector(".random-placement-btn");
      if (randomizeButton) {
        setupRandomPlacement(randomizeButton, player.gameBoard, newPlayerGrid, newSpacePort);
      }

      startGame();

      const newStartBtn = safeQuerySelector(".start-btn");
      if (newStartBtn) {
        newStartBtn.addEventListener("click", () => {
          if (elements.enemyDeployment) elements.enemyDeployment.style.display = "flex";
          if (elements.userPlacementScreen) elements.userPlacementScreen.style.display = "none";
          if (elements.turnsController) elements.turnsController.style.display = "flex";
        });
      }
    }
  }

  function resetUIState() {
    if (elements.shipDeploymentTitle) elements.shipDeploymentTitle.style.display = "block";
    if (elements.turnsController) elements.turnsController.style.display = "none";
    if (elements.enemyDeployment) elements.enemyDeployment.style.display = "none";
    if (elements.shipPlacementHeader) elements.shipPlacementHeader.style.display = "flex";
    if (elements.shipPlacementScreen) elements.shipPlacementScreen.style.display = "flex";
    if (elements.userPlacementScreen) elements.userPlacementScreen.style.display = "flex";
    if (elements.winnerDialog) elements.winnerDialog.close();
  }

  function handleRestart() {
    const restartButton = safeQuerySelector(".restart");
    if (!restartButton) return;
    
    restartButton.addEventListener("click", () => {
      resetGameState();
      resetPlayerDeployment();
      reinitializeGameComponents();
      resetUIState();
    });
  }

  function stopGame() {
    gameStarted = false;
    displayWinner();
  }

  function setupLoadingScreen() {
    const skipLoading = sessionStorage.getItem('skipLoading');
    
    if (skipLoading) {
      sessionStorage.removeItem('skipLoading');
      if (elements.loadingScreen) elements.loadingScreen.style.display = "none";
      if (elements.gameModeSelectionScreen) elements.gameModeSelectionScreen.style.display = "flex";
    } else {
      if (elements.loadingScreen) elements.loadingScreen.style.display = "flex";
      setTimeout(() => {
        if (elements.loadingScreen) elements.loadingScreen.style.display = "none";
        if (elements.gameModeSelectionScreen) elements.gameModeSelectionScreen.style.display = "flex";
      }, 6000);
    }
  }

  function setupEventListeners() {
    // Game mode selection
    if (elements.gameModeSelectionScreen) {
      elements.gameModeSelectionScreen.addEventListener("click", (e) => {
        if (e.target.closest(".single-player") || e.target.closest(".multi-player")) {
          isMultiPlayer = e.target.closest(".multi-player") !== null;
          elements.gameModeSelectionScreen.style.display = "none";
          if (elements.nameScreen) elements.nameScreen.style.display = "flex";

          const player2Input = safeQuerySelector(".player2-name-input");
          if (player2Input) {
            player2Input.style.display = isMultiPlayer ? "block" : "none";
            player2Input.required = isMultiPlayer;
          }
        }
      });
    }

    // Name form submission
    const form = safeQuerySelector(".name-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (elements.main) elements.main.style.background = "white";
        if (elements.nameScreen) elements.nameScreen.style.display = "none";
        if (elements.rulesDialog) elements.rulesDialog.showModal();
      });
    }

    // Continue button
    if (elements.beginMission) {
      elements.beginMission.addEventListener("click", () => {
        if (elements.shipPlacementHeader) elements.shipPlacementHeader.style.display = "flex";
        if (elements.shipPlacementScreen) elements.shipPlacementScreen.style.display = "flex";
        if (elements.userPlacementScreen) elements.userPlacementScreen.style.display = "flex";
        if (elements.rulesDialog) elements.rulesDialog.close();
      });
    }

    // Start game button
    if (elements.startGameBtn) {
      elements.startGameBtn.addEventListener("click", () => {
        if (elements.enemyDeployment) elements.enemyDeployment.style.display = "flex";
        if (elements.userPlacementScreen) elements.userPlacementScreen.style.display = "none";
        if (elements.turnsController) elements.turnsController.style.display = "flex";
      });
    }

    // View rules button
    if (elements.viewRulesBtn) {
      elements.viewRulesBtn.addEventListener("click", () => {
        const rulesFooter = safeQuerySelector(".rules-footer");
        if (rulesFooter) rulesFooter.style.display = "none";
        if (elements.rulesDialog) {
          elements.rulesDialog.setAttribute("closedby", "any");
          elements.rulesDialog.showModal();
        }
      });
    }
  }

  function initializeGameController() {
    if (isMultiPlayer) {
      gameController = createMultiPlayerController(elements, playerNames);
      gameController.setupPlayer2ShipPlacement();
      gameController.handlePlayerAttacks();
    } else {
      gameController = createSinglePlayerController(elements, playerNames);
      gameController.handlePlayerAttack();
    }
  }

  function initializeGameFlow() {
    setupLoadingScreen();
    setupEventListeners();
    forfeitGame();
    handleEndGame();
    getPlayerNames();
    handleRestart();
  }

  return {
    startGame,
    handlePlayerAttack,
    handleEnemyAttack,
    playRound,
    detectWinner,
    stopGame,
    forfeitGame,
    handleEndGame,
    gameStarted,
    getPlayerNames,
    initializeGameFlow,
  };
};

export { gameController, gameStarted, checkAllShipsPlaced, isMultiPlayer };
