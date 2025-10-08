import { createSinglePlayerController } from "./single-player-controller.js";
import { createMultiPlayerController } from "./multiplayer-controller.js";

let isMultiPlayer = false;
let gameController = null;
let gameStarted = false;
let currentTurn = null;
let confettiInterval = null;

function safeQuerySelector(selector) {
  const element = document.querySelector(selector);
  if (!element) console.warn(`Element not found: ${selector}`);
  return element;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export function initializeGame() {
  const elements = {
    loadingScreen: safeQuerySelector(".loading-screen"),
    main: safeQuerySelector(".main"),
    gameModeSelectionScreen: safeQuerySelector(".game-mode-selection-screen"),
    nameScreen: safeQuerySelector(".name-screen"),
    shipPlacementScreen: safeQuerySelector(".ship-placement-screen"),
    shipPlacementHeader: safeQuerySelector(".ship-placement-header"),
    userPlacementScreen: safeQuerySelector(".user-ship-placement"),
    enemyDeployment: safeQuerySelector(".enemy-deployment"),
    turnsController: safeQuerySelector(".turns-controller"),
    rulesDialog: safeQuerySelector(".rules-dialog"),
    beginMission: safeQuerySelector(".continue-btn"),
    currentPlayerTurn: safeQuerySelector(".current-player-turn"),
    endGame: safeQuerySelector(".end"),
    viewRulesBtn: safeQuerySelector(".show-rules-btn"),
    winnerDisplay: safeQuerySelector(".winner"),
    winnerDialog: safeQuerySelector(".finish"),
    shipDeploymentTitle: safeQuerySelector(".ship-placement-title"),
    endGame: safeQuerySelector(".end"),
  };

  let playerNames = {
    player1Name: "Player 1",
    player2Name: "Computer",
  };

  setupLoadingScreen(elements);
  setupGameModeSelection(elements);
  setupNameForm(elements, playerNames);
  setupRulesDialog(elements, playerNames);
  
  const startButtonSetup = setupStartButton(elements, playerNames);
  
  // Make setupStartButton available globally for restart
  window.setupStartButton = startButtonSetup.setupStartButton;
  
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
  
  handleEndGame(elements);
}

function handleEndGame(elements) {
  if (!elements.endGame) return;
  
  elements.endGame.addEventListener("click", () => {
    sessionStorage.setItem('skipLoading', 'true');
    location.reload();
  });
}

function setupLoadingScreen(elements) {
  const skipLoading = sessionStorage.getItem("skipLoading");

  if (skipLoading) {
    sessionStorage.removeItem("skipLoading");
    elements.loadingScreen.style.display = "none";
    elements.gameModeSelectionScreen.style.display = "flex";
  } else {
    elements.loadingScreen.style.display = "flex";
    setTimeout(() => {
      elements.loadingScreen.style.display = "none";
      elements.gameModeSelectionScreen.style.display = "flex";
    }, 6000);
  }
}

function setupGameModeSelection(elements) {
  elements.gameModeSelectionScreen.addEventListener("click", (e) => {
    if (
      e.target.closest(".single-player") ||
      e.target.closest(".multi-player")
    ) {
      isMultiPlayer = e.target.closest(".multi-player") !== null;
      elements.gameModeSelectionScreen.style.display = "none";
      elements.nameScreen.style.display = "flex";

      const player2Input = safeQuerySelector(".player2-name-input");
      if (player2Input) {
        player2Input.style.display = isMultiPlayer ? "block" : "none";
        player2Input.required = isMultiPlayer;
      }
    }
  });
}

function setupNameForm(elements, playerNames) {
  const form = safeQuerySelector(".name-form");
  const player1Input = safeQuerySelector(".player1-name-input");
  const player2Input = safeQuerySelector(".player2-name-input");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (player1Input?.value.trim()) {
      playerNames.player1Name = capitalizeFirstLetter(
        player1Input.value.trim()
      );
    }

    if (isMultiPlayer && player2Input?.value.trim()) {
      playerNames.player2Name = capitalizeFirstLetter(
        player2Input.value.trim()
      );
    }

    elements.main.style.background = "white";
    elements.nameScreen.style.display = "none";
    elements.rulesDialog.showModal();
  });
}

function setupRulesDialog(elements, playerNames) {
  elements.beginMission.addEventListener("click", () => {
    elements.shipPlacementHeader.style.display = "flex";
    elements.shipPlacementScreen.style.display = "flex";
    elements.userPlacementScreen.style.display = "flex";
    elements.rulesDialog.close();
    
    // Initialize game controller after user selections are made
    initializeGameController(elements, playerNames);
  });
}

function setupStartButton(elements, playerNames) {
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

  startGame();

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("start-btn")) {
      if (isMultiPlayer) {
        gameController.showPlayer2Placement();
      } else {
        elements.enemyDeployment.style.display = "flex";
        elements.userPlacementScreen.style.display = "none";
        elements.turnsController.style.display = "flex";
        gameController.startGame();
      }
    }

    if (e.target.classList.contains("ready-btn-p2") && gameController) {
      gameController.onPlayer2Ready();
      gameController.startGame();
    }
  });
  
  // Expose function to re-setup start button after restart
  return { setupStartButton: startGame };
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

function initializeGameController(elements, playerNames) {
  if (isMultiPlayer) {
    gameController = createMultiPlayerController(elements, playerNames, addConfetti);
    gameController.setupPlayer2ShipPlacement();
    gameController.handlePlayerAttacks();
  } else {
    gameController = createSinglePlayerController(elements, playerNames, addConfetti);
    gameController.handlePlayerAttack();
  }
}
