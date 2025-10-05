import "./reset.css";
import "./style.css";
import { gameController } from "./game-controller.js";

// Initialize the game
const game = gameController();
game.initializeGameFlow();
