import "./reset.css";
import "./style.css";
import { shipRotation, shipDragAndDrop } from "./ship-movement.JS";
import { Ship, Gameboard, Player } from "./game.js";


document.addEventListener("DOMContentLoaded", () => {
  shipDragAndDrop();
  shipRotation();
});