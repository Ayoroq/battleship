import { Gameboard } from "./game.js";
import {
  shipRotation,
  shipDragAndDrop,
  shipGridRotation,
  setupRandomPlacement,
  createGridCells,
  markShipHit,
} from "./ship-movement.js";

export function createMultiPlayerController(
  elements,
  playerNames,
  addConfetti
) {
  const player1 = initializePlayer1();

  let gameStarted = false;
  let currentTurn = playerNames.player1Name;
  let player2ShipsPlaced = false;

  function initializePlayer1() {
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

  const player2 = { gameBoard: new Gameboard(), gridContainer: null };
  function setupPlayer2ShipPlacement() {
    // Set up player 2 ship placement in enemy deployment area
    if (elements.enemyDeployment) {
      elements.enemyDeployment.innerHTML = `
        <div class="grid-container">
          <div class="grid-container-player-2 grid"></div>
          <div class="button-container">
            <div class="random-placement">
              <button class="random-placement-btn-p2 clickable">Random Placement</button>
            </div>
          </div>
        </div>
        <div class="enemy-ship-placement">
          <div class="enemy-space-port">
            <div class="ship-class">
              <div class="ship" data-ship-name="Dreadnought" draggable="true" data-ship-size="5" data-ship-direction="horizontal"></div>
              <button class="rotate-ship"><img src="0318bfb7c1037aa6bc68.svg" alt=""></button>
            </div>
            <div class="ship-class">
              <div class="ship" data-ship-name="Battlecruiser" draggable="true" data-ship-size="4" data-ship-direction="horizontal"></div>
              <button class="rotate-ship"><img src="0318bfb7c1037aa6bc68.svg" alt=""></button>
            </div>
            <div class="ship-class">
              <div class="ship" data-ship-name="Heavy Cruiser" draggable="true" data-ship-size="3" data-ship-direction="horizontal"></div>
              <button class="rotate-ship"><img src="0318bfb7c1037aa6bc68.svg" alt=""></button>
            </div>
            <div class="ship-class">
              <div class="ship" data-ship-name="Stealth Frigate" draggable="true" data-ship-size="3" data-ship-direction="horizontal"></div>
              <button class="rotate-ship"><img src="0318bfb7c1037aa6bc68.svg" alt=""></button>
            </div>
            <div class="ship-class">
              <div class="ship" data-ship-name="Interceptor" draggable="true" data-ship-size="2" data-ship-direction="horizontal"></div>
              <button class="rotate-ship"><img src="0318bfb7c1037aa6bc68.svg" alt=""></button>
            </div>
          </div>
        </div>
      `;

      const player2Grid = elements.enemyDeployment.querySelector(
        ".grid-container-player-2"
      );
      const player2SpacePort =
        elements.enemyDeployment.querySelector(".enemy-space-port");
      const player2RandomBtn = elements.enemyDeployment.querySelector(
        ".random-placement-btn-p2"
      );

      createGridCells(player2Grid);
      player2.gridContainer = player2Grid;

      shipRotation(player2SpacePort);
      shipDragAndDrop(player2SpacePort, player2Grid, player2.gameBoard);
      shipGridRotation(player2Grid, player2.gameBoard);

      if (player2RandomBtn) {
        setupRandomPlacement(
          player2RandomBtn,
          player2.gameBoard,
          player2Grid,
          player2SpacePort
        );
      }
    }
  }

  function handleAttacks() {
    // Player 1 attacks Player 2
    player2.gridContainer.addEventListener("click", (e) => {
      if (
        gameStarted &&
        currentTurn === playerNames.player1Name &&
        e.target.classList.contains("grid-cell") &&
        !e.target.classList.contains("hit") &&
        !e.target.classList.contains("miss")
      ) {
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);
        const attackResult = player2.gameBoard.receiveAttack(x, y);

        if (attackResult.result === "hit") {
          e.target.classList.add("hit");
          markShipHit(
            player2.gridContainer,
            attackResult.ship,
            attackResult.cellIndex
          );
        } else if (attackResult.result === "miss") {
          e.target.classList.add("miss");
        }

        // Add delay to show attack result before switching turns
        setTimeout(() => {
          switchTurn();
        }, 1500);
      }
    });

    // Player 2 attacks Player 1
    player1.gridContainer.addEventListener("click", (e) => {
      if (
        gameStarted &&
        currentTurn === playerNames.player2Name &&
        e.target.classList.contains("grid-cell") &&
        !e.target.classList.contains("hit") &&
        !e.target.classList.contains("miss")
      ) {
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);
        const attackResult = player1.gameBoard.receiveAttack(x, y);

        if (attackResult.result === "hit") {
          e.target.classList.add("hit");
          markShipHit(
            player1.gridContainer,
            attackResult.ship,
            attackResult.cellIndex
          );
        } else if (attackResult.result === "miss") {
          e.target.classList.add("miss");
        }

        // Add delay to show attack result before switching turns
        setTimeout(() => {
          switchTurn();
        }, 1500);
      }
    });
  }

  function switchTurn() {
    if (detectWinner()) return;

    currentTurn =
      currentTurn === playerNames.player1Name
        ? playerNames.player2Name
        : playerNames.player1Name;

    updateTurnDisplay();
    updateGridStates();
  }

  function updateTurnDisplay() {
    if (elements.currentPlayerTurn) {
      elements.currentPlayerTurn.textContent = `${currentTurn}'s turn`;
    }
  }

  function updateGridStates() {
    const playerDeployment = document.querySelector(".player-deployment");
    const enemyDeployment = document.querySelector(".enemy-deployment");

    if (currentTurn === playerNames.player1Name) {
      // Player 1's turn - show player 2's grid for attacking
      if (playerDeployment) playerDeployment.style.display = "none";
      if (enemyDeployment) enemyDeployment.style.display = "flex";
    } else {
      // Player 2's turn - show player 1's grid for attacking
      if (enemyDeployment) enemyDeployment.style.display = "none";
      if (playerDeployment) playerDeployment.style.display = "flex";
    }
  }

  function detectWinner() {
    if (player1.gameBoard.allShipsSunk()) {
      displayWinner(playerNames.player2Name);
      return true;
    } else if (player2.gameBoard.allShipsSunk()) {
      displayWinner(playerNames.player1Name);
      return true;
    }
    return false;
  }

  function displayWinner(winnerName) {
    gameStarted = false;
    if (elements.winnerDisplay && elements.winnerDialog) {
      elements.winnerDisplay.textContent = `${winnerName} wins!`;
      elements.winnerDialog.showModal();
    }
    if (addConfetti) {
      addConfetti();
    }
  }

  function startGame() {
    const ships = document.querySelectorAll(".ship");
    ships.forEach((ship) => ship.remove());
    gameStarted = true;
    currentTurn = playerNames.player1Name;
    updateTurnDisplay();
    updateGridStates();
  }

  function setupForfeit() {
    const forfeitButton = document.querySelector(".forfeit-btn");
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

      // Both players are human in multiplayer
      if (addConfetti) {
        addConfetti();
      }
    });
  }

  function showPlayer2Placement() {
    const player1Placement = document.querySelector(".player-deployment");
    const userPlacement = document.querySelector(".user");
    if (player1Placement) player1Placement.style.display = "none";
    if (userPlacement)
      userPlacement.textContent = `${playerNames.player2Name}, place your ships`;
    if (elements.enemyDeployment)
      elements.enemyDeployment.style.display = "flex";
  }

  function destroy() {
    // Clean up event listeners by replacing the grid containers
    if (player1.gridContainer && player1.gridContainer.parentNode) {
      player1.gridContainer.parentNode.replaceChild(
        player1.gridContainer.cloneNode(true),
        player1.gridContainer
      );
    }
    if (player2.gridContainer && player2.gridContainer.parentNode) {
      player2.gridContainer.parentNode.replaceChild(
        player2.gridContainer.cloneNode(true),
        player2.gridContainer
      );
    }
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
    player2ShipsPlaced = false;
    player1.gameBoard.resetBoard();
    player2.gameBoard.resetBoard();
  }

  function resetPlayerDeployment() {
    const playerDeployment = document.querySelector(".player-deployment");
    if (playerDeployment) {
      playerDeployment.innerHTML = `
        <div class="grid-container">
          <div class="grid-container-player grid"></div>
          <div class="button-container">
            <div class="random-placement">
              <button class="random-placement-btn clickable" type="button">
                Random Placement
              </button>
            </div>
            <div class="start-game">
              <button class="start-btn clickable green" type="button" style="display: none;">
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
    }
  }

  function reinitializeGameComponents() {
    const newSpacePort = document.querySelector(".space-port");
    const newPlayerGrid = document.querySelector(".grid-container-player");

    if (newSpacePort && newPlayerGrid) {
      createGridCells(newPlayerGrid);
      player1.gridContainer = newPlayerGrid;
      player1.spacePort = newSpacePort;

      shipRotation(newSpacePort);
      shipDragAndDrop(newSpacePort, newPlayerGrid, player1.gameBoard);
      shipGridRotation(newPlayerGrid, player1.gameBoard);

      const randomizeButton = document.querySelector(".random-placement-btn");
      if (randomizeButton) {
        setupRandomPlacement(
          randomizeButton,
          player1.gameBoard,
          newPlayerGrid,
          newSpacePort
        );
      }
    }

    if (elements.enemyDeployment) {
      elements.enemyDeployment.innerHTML = "";
      player2.gridContainer = null;
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
    
    const userPlacement = document.querySelector(".user");
    if (userPlacement)
      userPlacement.textContent = `${playerNames.player1Name}, place your ships`;
  }

  setupForfeit();
  handleRestart();

  return {
    handleAttacks,
    setupPlayer2ShipPlacement,
    showPlayer2Placement,
    startGame,
    player1,
    player2: () => player2,
    destroy,
    handleRestart,
  };
}
