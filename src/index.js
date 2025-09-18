import "./reset.css";
import "./style.css";
import { Ship, Gameboard, Player } from "./game";
import { createGrid, clearGrid } from "./grid";

clearGrid();
createGrid();

function handleDragStart(e) {
  this.style.opacity = "0.4";
}

function handleDragEnd(e) {
  this.style.opacity = "1";
}

let items = document.querySelectorAll(".container .box");
items.forEach(function (item) {
  item.addEventListener("dragstart", handleDragStart);
  item.addEventListener("dragend", handleDragEnd);
});
