import { createSinglePlayerController } from "./single-player-controller.js";
import { createMultiPlayerController } from "./multiplayer-controller.js";

let isMultiPlayer = false;
let gameController = null;

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
    winnerDisplay: safeQuerySelector(".winner"),
    winnerDialog: safeQuerySelector(".finish"),
  };

  let playerNames = {
    player1Name: "Player 1",
    player2Name: "Computer",
  };

  setupLoadingScreen(elements);
  setupGameModeSelection(elements);
  setupNameForm(elements, playerNames);
  setupRulesDialog(elements);
  setupStartButton(elements, playerNames);
  initializeGameController(elements, playerNames);
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

    elements.nameScreen.style.display = "none";
    elements.rulesDialog.showModal();
  });
}

function setupRulesDialog(elements) {
  elements.beginMission.addEventListener("click", () => {
    elements.shipPlacementHeader.style.display = "flex";
    elements.shipPlacementScreen.style.display = "flex";
    elements.userPlacementScreen.style.display = "flex";
    elements.rulesDialog.close();
  });
}

function setupStartButton(elements, playerNames) {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("start-btn")) {
      initializeGameController(elements, playerNames);

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
}

function initializeGameController(elements, playerNames) {
  if (isMultiPlayer) {
    gameController = createMultiPlayerController(elements, playerNames);
    gameController.setupPlayer2ShipPlacement();
    gameController.handlePlayerAttacks();
  } else {
    gameController = createSinglePlayerController(elements, playerNames);
    gameController.handlePlayerAttack();
  }
}
