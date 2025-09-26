import "./reset.css";
import "./style.css";
import { shipRotation } from "./ship-movement.JS";
import { Ship, Gameboard, Player } from "./game.js";


const rotateButtons = document.querySelectorAll(".rotate-ship");
shipRotation();