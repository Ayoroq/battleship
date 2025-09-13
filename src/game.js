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

class Gameboard {
  constructor() {
    this.board = Array.from({ length: 10 }, () => Array(10).fill(null));
    this.ships = [];
  }

  placeShip(ship, x, y, direction) {
    // Place the ship on the game board
    this.ships.push(ship);
    if (direction === "horizontal") {
      if (x + ship.length > 10) {
        throw new Error("Ship placement out of bounds");
      }
      for (let i = 0; i < ship.length; i++) {
        this.board[x][y + i] = ship;
      }
    } else {
      if (y + ship.length > 10) {
        throw new Error("Ship placement out of bounds");
      }
      for (let i = 0; i < ship.length; i++) {
        this.board[x + i][y] = ship;
      }
    }
  }

  receiveAttack(x, y) {
    if (this.board[x][y] !== null) {
      this.board[x][y].hit();
      return true; // Hit
    }
    return false; // Miss
  }

  allShipsSunk() {
    // Check if all ships on the game board are sunk
    return this.ships.every((ship) => ship.isSunk());
  }
}

module.exports = {
  Ship,
  Gameboard,
};
