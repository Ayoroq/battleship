import "./reset.css";
import "./style.css";
import { initializeGame } from "./game-controller.js";
import { Ship, Gameboard, Player } from "./game.js";

const loadingScreen = document.querySelector(".loading-screen");
const shipPlacementScreen = document.querySelector(".ship-placement-screen");
const gameModeSelectionScreen = document.querySelector(".game-mode-selection-screen");

function gameFlow(){
  // Show loading screen initially 
  setTimeout(() => {
    loadingScreen.style.display = "none";
    gameModeSelectionScreen.style.display = "flex";
  }, 6000);
}

gameFlow();