function clearGrid() {
  const gridContainer = document.querySelector(".grid-container");
  gridContainer.innerHTML = "";
}


function createGrid(containerSelector = ".grid-container", gridSize = 10) {
  const gridContainer = document.querySelector(containerSelector);
  for (let r = 1; r <= gridSize; r++) {
    const header = document.createElement("div");
    header.classList.add("grid-header");
    header.textContent = r;
    gridContainer.appendChild(header);

    for (let c = 1; c <= gridSize; c++) {
      const cell = document.createElement("div");
      cell.classList.add("grid-cell");
      const colLetter = String.fromCharCode(64 + c); 
      cell.dataset.coord = `${colLetter}${r}`;
      gridContainer.appendChild(cell);
    }
  }
}

export { createGrid, clearGrid };