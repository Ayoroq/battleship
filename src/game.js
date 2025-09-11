class Ship {
  // Initialize ship with name, length, and default values
  constructor(name, length, hits = 0, sunk = false) {
    this.name = name;
    this.length = length;
    this.hits = hits;
    this.sunk = sunk;
  }

  // Increase hit count when ship is hit
  hit() {
    this.hits++;
  }

  // Check if ship is sunk (hits >= length)
  isSunk() {
    if (this.hits >= this.length) {
      this.sunk = true;
    }
    return this.sunk;
  }
}

module.exports = Ship;