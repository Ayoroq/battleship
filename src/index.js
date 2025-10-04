import "./reset.css";
import "./style.css";
import { initializeGame } from "./game-controller.js";
import { Ship, Gameboard, Player } from "./game.js";

const loadingScreen = document.querySelector(".loading-screen");
const main = document.querySelector(".main");
const shipPlacementScreen = document.querySelector(".ship-placement-screen");
const gameModeSelectionScreen = document.querySelector(".game-mode-selection-screen");
const nameScreen = document.querySelector(".name-screen");
const startGameBtn = document.querySelector(".start-btn");
const enemyDeployment = document.querySelector(".enemy-deployment");
let isMultiPlayer = false; // Set to true for multiplayer mode

function gameFlow(){
  // Show loading screen initially 
  loadingScreen.style.display = "flex";
  setTimeout(() => {
    loadingScreen.style.display = "none";
    gameModeSelectionScreen.style.display = "flex";
  }, 6000);

  // Handle game mode selection with event delegation
  gameModeSelectionScreen.addEventListener("click", (e) => {
    if (e.target.closest(".single-player") || e.target.closest(".multi-player")) {
      isMultiPlayer = e.target.closest(".multi-player") !== null;
      
      gameModeSelectionScreen.style.display = "none";
      nameScreen.style.display = "flex";
      
      // Show/hide Player 2 input based on game mode
      const player2Input = document.querySelector(".player2-name-input");
      player2Input.style.display = isMultiPlayer ? "block" : "none";
      player2Input.required = isMultiPlayer;
    }
  });

  // handles player name input and transition to ship placement screen
  const form = document.querySelector(".name-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    main.style.background = 'white';
    nameScreen.style.display = "none";
    shipPlacementScreen.style.display = "flex";
  });

  // Start game button click handler
  startGameBtn.addEventListener("click", () => {
    enemyDeployment.style.display = "flex";
  });
}

gameFlow();

export { isMultiPlayer };