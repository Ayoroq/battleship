import "./reset.css";
import "./style.css";
import { initializeGame } from "./game-controller.js";
import { Ship, Gameboard, Player } from "./game.js";

const loadingScreen = document.querySelector(".loading-screen");
const shipPlacementScreen = document.querySelector(".ship-placement-screen");

function gameFlow(){
  // Show loading screen initially 
  setTimeout(() => {
    loadingScreen.style.display = "none";
    shipPlacementScreen.style.display = "flex";
  }, 5000);
}

// gameFlow();