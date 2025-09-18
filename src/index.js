import "./reset.css";
import "./style.css";
import { Ship, Gameboard, Player } from "./game.js";
import { renderBoard, renderShips } from "./grid.js";

const gameboard = new Gameboard();
const grid = document.querySelector(".grid-container-1");

// Create and place some ships
const ship1 = new Ship("Destroyer", 2);
const ship2 = new Ship("Cruiser", 3);

gameboard.placeShip(ship1, 0, 0, "horizontal");
gameboard.placeShip(ship2, 2, 1, "vertical");

renderBoard(gameboard, grid);
renderShips(gameboard, grid);