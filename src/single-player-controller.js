import { Gameboard } from "./game.js";
import { shipRotation, shipDragAndDrop,placeComputerShipsRandomly, shipGridRotation, setupRandomPlacement, createGridCells, markShipHit } from "./ship-movement.js";

export function createSinglePlayerController(elements, playerNames, addConfetti) {
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
      if (gameStarted && currentTurn === playerNames.player1Name && 
          e.target.classList.contains("grid-cell") && 
          !e.target.classList.contains("hit") && 
          !e.target.classList.contains("miss")) {
        
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
        } while ((player.gameBoard.board[x][y] === "hit" || 
                 player.gameBoard.board[x][y] === "miss" || 
                 (attempts < 50 && (x + y) % 2 !== 0)) && attempts < 100);
      }

      const attackResult = player.gameBoard.receiveAttack(x, y);
      if (attackResult.result === "already_attacked") {
        return makeSmartAttack();
      }
      
      const targetCell = player.gridContainer.querySelector(`[data-x="${x}"][data-y="${y}"]`);
      if (!targetCell) return { hit: false };

      if (attackResult.result === "hit") {
        targetCell.classList.add("hit");
        markShipHit(player.gridContainer,attackResult.ship,attackResult.cellIndex);
        if (!attackResult.ship.isSunk()) {
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
    const winnerName = winner === "player" ? playerNames.player1Name : playerNames.player2Name;
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

  setupForfeit();

  return {
    handlePlayerAttack,
    startGame,
    player,
    enemy,
    markShipHit
  };
}