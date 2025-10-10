import { Gameboard } from "./game.js";
import {
  shipRotation,
  shipDragAndDrop,
  placeComputerShipsRandomly,
  shipGridRotation,
  setupRandomPlacement,
  createGridCells,
  markShipHit,
} from "./ship-movement.js";

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

export function createSinglePlayerController(
  elements,
  playerNames,
  addConfetti
) {
  const player = initializePlayer();
  const enemy = initializeEnemy();
  const enemyAttacker = createEnemyAI();

  let gameStarted = false;
  let currentTurn = playerNames.player1Name;

  function initializePlayer() {
    const spacePort = document.querySelector(".space-port");
    const gridContainer = document.querySelector(".grid-container-player");
    const gameBoard = new Gameboard();
    const randomizeButton = document.querySelector(".random-placement-btn");

    shipRotation(spacePort);
    setupRandomPlacement(randomizeButton, gameBoard, gridContainer, spacePort);
    shipDragAndDrop(spacePort, gridContainer, gameBoard);
    shipGridRotation(gridContainer, gameBoard);
    createGridCells(gridContainer);

    return { gameBoard, gridContainer, spacePort };
  }

  function initializeEnemy() {
    const gridContainer = document.querySelector(".grid-container-2");
    const gameBoard = new Gameboard();
    createGridCells(gridContainer);
    placeComputerShipsRandomly(gameBoard);
    return { gameBoard, gridContainer };
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
        } else if (attackResult.result === "miss") {
          e.target.classList.add("miss");
        }
        playRound();
      }
    });
  }

  function playRound() {
    if (detectWinner()) return;

    currentTurn = playerNames.player2Name;
    if (elements.currentPlayerTurn) {
      elements.currentPlayerTurn.textContent = `${playerNames.player2Name}'s turn`;
    }

    setTimeout(() => {
      if (gameStarted) {
        enemyAttacker.makeSmartAttack();
        if (!detectWinner()) {
          currentTurn = playerNames.player1Name;
          if (elements.currentPlayerTurn) {
            elements.currentPlayerTurn.textContent = `${playerNames.player1Name}'s turn`;
          }
        }
      }
    }, 1000);
  }

  function createEnemyAI() {
    let huntTargets = [];

    const makeSmartAttack = () => {
      let x, y;

      if (huntTargets.length > 0) {
        const target = huntTargets.shift();
        x = target.x;
        y = target.y;
      } else {
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
      if (!targetCell) return { hit: false };

      if (attackResult.result === "hit") {
        targetCell.classList.add("hit");
        markShipHit(
          player.gridContainer,
          attackResult.ship,
          attackResult.cellIndex
        );
        if (!attackResult.ship.isSunk()) {
          const adjacent = [
            { x: x - 1, y },
            { x: x + 1, y },
            { x, y: y - 1 },
            { x, y: y + 1 },
          ].filter(
            (pos) =>
              pos.x >= 0 &&
              pos.x < 10 &&
              pos.y >= 0 &&
              pos.y < 10 &&
              player.gameBoard.board[pos.x][pos.y] !== "hit" &&
              player.gameBoard.board[pos.x][pos.y] !== "miss"
          );
          huntTargets.unshift(...adjacent);
        } else {
          huntTargets = [];
        }
      } else if (attackResult.result === "miss") {
        targetCell.classList.add("miss");
      }
    };

    return { makeSmartAttack };
  }

  function detectWinner() {
    if (player.gameBoard.allShipsSunk()) {
      displayWinner("enemy");
      return true;
    } else if (enemy.gameBoard.allShipsSunk()) {
      displayWinner("player");
      return true;
    }
    return false;
  }

  function displayWinner(winner) {
    gameStarted = false;
    const winnerName =
      winner === "player" ? playerNames.player1Name : playerNames.player2Name;
    if (elements.winnerDisplay && elements.winnerDialog) {
      elements.winnerDisplay.textContent = `${winnerName} wins!`;
      elements.winnerDialog.showModal();
    }
    if (winner === "player" && addConfetti) {
      addConfetti();
    }
  }

  function startGame() {
    gameStarted = true;
    currentTurn = playerNames.player1Name;
    if (elements.currentPlayerTurn) {
      elements.currentPlayerTurn.textContent = `${playerNames.player1Name}'s turn`;
    }
    const ships = document.querySelectorAll(".ship");
    ships.forEach((ship) => ship.setAttribute("draggable", "false"));
  }

  function setupForfeit() {
    const forfeitButton = document.querySelector(".forfeit-btn");
    if (!forfeitButton) return;

    forfeitButton.addEventListener("click", () => {
      // Only allow forfeit during human player's turn
      if (currentTurn !== playerNames.player1Name) return;

      gameStarted = false;
      const winner = playerNames.player2Name; // Computer always wins

      if (elements.winnerDisplay && elements.winnerDialog) {
        elements.winnerDisplay.textContent = `${winner} wins by forfeit!`;
        elements.winnerDialog.showModal();
      }
    });
  }

  function handleRestart() {
    const restartButton = document.querySelector(".restart");
    if (!restartButton) return;

    restartButton.addEventListener("click", () => {
      resetGameState();
      resetPlayerDeployment();
      reinitializeGameComponents();
      resetUIState();
    });
  }

  function resetGameState() {
    gameStarted = false;
    currentTurn = playerNames.player1Name;
    player.gameBoard.resetBoard();
    enemy.gameBoard.resetBoard();
  }

  function resetPlayerDeployment() {
    const playerDeployment = document.querySelector(".player-deployment");
    if (playerDeployment) {
      playerDeployment.innerHTML = SHIP_PLACEMENT_TEMPLATE;
    }
  }

  function reinitializeGameComponents() {
    enemy.gridContainer.innerHTML = "";
    createGridCells(enemy.gridContainer);
    placeComputerShipsRandomly(enemy.gameBoard);

    const newSpacePort = document.querySelector(".space-port");
    const newPlayerGrid = document.querySelector(".grid-container-player");

    if (newSpacePort && newPlayerGrid) {
      createGridCells(newPlayerGrid);
      player.gridContainer = newPlayerGrid;
      player.spacePort = newSpacePort;

      shipRotation(newSpacePort);
      shipDragAndDrop(newSpacePort, newPlayerGrid, player.gameBoard);
      shipGridRotation(newPlayerGrid, player.gameBoard);

      const randomizeButton = document.querySelector(".random-placement-btn");
      if (randomizeButton) {
        setupRandomPlacement(
          randomizeButton,
          player.gameBoard,
          newPlayerGrid,
          newSpacePort
        );
      }

      // Re-setup start button functionality
      if (window.setupStartButton) {
        window.setupStartButton();
      }
    }
  }

  function resetUIState() {
    if (elements.shipDeploymentTitle)
      elements.shipDeploymentTitle.style.display = "block";
    if (elements.turnsController)
      elements.turnsController.style.display = "none";
    if (elements.enemyDeployment)
      elements.enemyDeployment.style.display = "none";
    if (elements.shipPlacementHeader)
      elements.shipPlacementHeader.style.display = "flex";
    if (elements.shipPlacementScreen)
      elements.shipPlacementScreen.style.display = "flex";
    if (elements.userPlacementScreen)
      elements.userPlacementScreen.style.display = "flex";
    if (elements.winnerDialog) elements.winnerDialog.close();
  }

  setupForfeit();
  handleRestart();

  return {
    handlePlayerAttack,
    startGame,
    player,
    enemy,
    markShipHit,
    handleRestart,
  };
}
