function renderShip(placement, gridContainer, spacePort) {
  const { ship, x, y, direction } = placement;
  
  const newShip = document.createElement("div");
  newShip.classList.add("ship");
  newShip.setAttribute("data-ship-name", ship.name);
  newShip.setAttribute("data-ship-size", ship.length);
  newShip.setAttribute("data-ship-direction", direction);
  newShip.draggable = true;
  newShip.style.position = "absolute";
  newShip.style.left = `${y * 3}rem`;
  newShip.style.top = `${x * 3}rem`;
  newShip.style.gridTemplate = direction === "horizontal" ? `1fr / repeat(${ship.length}, 1fr)` : `repeat(${ship.length}, 1fr) / 1fr`;
  
  // Create ship cells
  for (let i = 0; i < ship.length; i++) {
    const cell = document.createElement("div");
    cell.classList.add("ship-cell");
    cell.setAttribute("data-cell-index", i);
    newShip.appendChild(cell);
  }
  
  // Add grid position attributes
  newShip.setAttribute("grid-row", x);
  newShip.setAttribute("grid-col", y);
  
  gridContainer.appendChild(newShip);
  
  // Hide corresponding ship in space-port
  if (spacePort) {
    const originalShip = spacePort.querySelector(`[data-ship-name="${ship.name}"]`);
    if (originalShip) originalShip.style.display = "none";
  }
}

export { renderShip };