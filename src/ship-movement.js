// This is the module that handles the movement of ships, the drag and drops and the repositioning
import { Ship, Gameboard, Player } from "./game";

function shipRotation() {
  const rotateButtons = document.querySelectorAll(".rotate-ship");

  rotateButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const ship = button.previousElementSibling;
      const currentDirection = ship.getAttribute("data-ship-direction");
      const newDirection =
        currentDirection === "horizontal" ? "vertical" : "horizontal";
      ship.setAttribute("data-ship-direction", newDirection);
    });
  });
}

export { shipRotation };