// This is the module that handles the movement of ships, the drag and drops and the repositioning

function handleDragStart(e) {
  this.style.opacity = "0.4";
}

function handleDragEnd(e) {
  this.style.opacity = "1";
}

export { handleDragStart, handleDragEnd };