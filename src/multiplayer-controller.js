import { Gameboard } from "./game.js";
import { shipRotation, shipDragAndDrop, shipGridRotation, setupRandomPlacement, createGridCells, markShipHit } from "./ship-movement.js";

export function createMultiPlayerController(elements, playerNames, addConfetti) {
  const player1 = initializePlayer1();
  const player2 = initializePlayer2();
  
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

  function initializePlayer2() {
    const gridContainer = document.querySelector(".grid-container-2");
    const gameBoard = new Gameboard();
    createGridCells(gridContainer);
    return { gameBoard, gridContainer };
  }

  function setupPlayer2ShipPlacement() {
    const player2PlacementHTML = `
      <div class="ship-deployment-p2" style="display: none;">
        <div class="grid-container">
          <div class="grid-container-player2 grid"></div>
          <div class="button-container">
            <button class="random-placement-btn-p2 clickable">Random Placement</button>
            <button class="ready-btn-p2 clickable green" style="display: none;">Ready!</button>
          </div>
        </div>
        <div class="ship-placement">
          <div class="space-port-p2">
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
      </div>
    `;
    
    elements.shipPlacementScreen.insertAdjacentHTML('beforeend', player2PlacementHTML);
    
    const player2Grid = document.querySelector('.grid-container-player2');
    const player2SpacePort = document.querySelector('.space-port-p2');
    const player2RandomBtn = document.querySelector('.random-placement-btn-p2');
    
    createGridCells(player2Grid);
    shipRotation(player2SpacePort);
    shipDragAndDrop(player2SpacePort, player2Grid, player2.gameBoard);
    shipGridRotation(player2Grid, player2.gameBoard);
    
    if (player2RandomBtn) {
      setupRandomPlacement(player2RandomBtn, player2.gameBoard, player2Grid, player2SpacePort);
    }
  }

  function handlePlayerAttacks() {
    // Player 1 attacks Player 2
    player2.gridContainer.addEventListener("click", (e) => {
      if (gameStarted && currentTurn === playerNames.player1Name && 
          e.target.classList.contains("grid-cell") && 
          !e.target.classList.contains("hit") && 
          !e.target.classList.contains("miss")) {
        
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);
        const attackResult = player2.gameBoard.receiveAttack(x, y);
        
        if (attackResult.result === "hit") {
          e.target.classList.add("hit");
          markShipHit(player2.gridContainer,attackResult.ship,attackResult.cellIndex);
        } else if (attackResult.result === "miss") {
          e.target.classList.add("miss");
        }
        switchTurn();
      }
    });

    // Player 2 attacks Player 1
    player1.gridContainer.addEventListener("click", (e) => {
      if (gameStarted && currentTurn === playerNames.player2Name && 
          e.target.classList.contains("grid-cell") && 
          !e.target.classList.contains("hit") && 
          !e.target.classList.contains("miss")) {
        
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);
        const attackResult = player1.gameBoard.receiveAttack(x, y);
        
        if (attackResult.result === "hit") {
          e.target.classList.add("hit");
          markShipHit(player1.gridContainer,attackResult.ship,attackResult.cellIndex);
        } else if (attackResult.result === "miss") {
          e.target.classList.add("miss");
        }
        switchTurn();
      }
    });
  }

  function switchTurn() {
    if (detectWinner()) return;
    
    currentTurn = currentTurn === playerNames.player1Name ? playerNames.player2Name : playerNames.player1Name;
    if (elements.currentPlayerTurn) {
      elements.currentPlayerTurn.textContent = `${currentTurn}'s turn`;
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
  }

  function startGame() {
    gameStarted = true;
    currentTurn = playerNames.player1Name;
    if (elements.currentPlayerTurn) {
      elements.currentPlayerTurn.textContent = `${playerNames.player1Name}'s turn`;
    }
  }

  function setupForfeit() {
    const forfeitButton = document.querySelector(".forfeit-btn");
    if (!forfeitButton) return;
    
    forfeitButton.addEventListener("click", () => {
      gameStarted = false;
      const winner = currentTurn === playerNames.player1Name
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
    const player1Placement = document.querySelector('.ship-deployment');
    const userPlacement = document.querySelector('.user');
    const player2Placement = document.querySelector('.ship-deployment-p2');
    if (player1Placement) player1Placement.style.display = 'none';
    if (userPlacement) userPlacement.textContent = `${playerNames.player2Name}, place your ships`;
    if (player2Placement) player2Placement.style.display = 'flex';
  }

  function onPlayer2Ready() {
    const player2Placement = document.querySelector('.ship-deployment-p2');
    if (player2Placement) player2Placement.style.display = 'none';
    if (elements.enemyDeployment) elements.enemyDeployment.style.display = "flex";
    if (elements.turnsController) elements.turnsController.style.display = "flex";
    player2ShipsPlaced = true;
  }

  setupForfeit();

  return {
    handlePlayerAttacks,
    setupPlayer2ShipPlacement,
    showPlayer2Placement,
    onPlayer2Ready,
    startGame,
    player1,
    player2: () => player2,
    markShipHit
  };
}