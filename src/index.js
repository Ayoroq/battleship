import "./reset.css";
import "./style.css";
import { Ship, Gameboard, Player } from "./game.js";
import { renderBoard, renderShips } from "./grid.js";
import { shipPlacement} from "./shipPlacement.js";

const gameboard = new Gameboard();
const grid = document.querySelector(".grid-container-1");

renderBoard(gameboard, grid);
renderShips(gameboard, grid);
shipPlacement(gameboard, grid);