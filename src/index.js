import "./reset.css";
import "./style.css";
import { initializeGame } from "./game-controller.js";
import { Ship, Gameboard, Player } from "./game.js";


document.addEventListener("DOMContentLoaded", () => {
  const gameState = initializeGame();
  
  // Game state is now available for future use
  window.gameState = gameState;
});