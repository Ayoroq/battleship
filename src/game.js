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
  constructor(boardSize = 10) {
    // Initialize game board with empty cells
    this.boardSize = boardSize;
    this.board = Array.from({ length: this.boardSize }, () => Array(this.boardSize).fill(null));
    this.ships = [];
  }

  validatePlacement(ship, x, y, direction) {
    //check if ship placement is valid
    if (x < 0 || x > 9 || y < 0 || y > 9) {
      throw new Error("Ship placement out of bounds");
    }
    if (direction !== "horizontal" && direction !== "vertical") {
      throw new Error("Invalid direction");
    }
    // Check if the ship can be placed at the given coordinates
    if (direction === "horizontal") {
      if (x + ship.length > 10) {
        throw new Error("Ship placement out of bounds");
      }
      for (let i = 0; i < ship.length; i++) {
        if (this.board[x][y + i] !== null) {
          throw new Error("Ship placement overlaps with another ship");
        }
      }
    } else {
      if (y + ship.length > 10) {
        throw new Error("Ship placement out of bounds");
      }
      for (let i = 0; i < ship.length; i++) {
        if (this.board[x + i][y] !== null) {
          throw new Error("Ship placement overlaps with another ship");
        }
      }
    }
    return true;
  }

  placeShip(ship, x, y, direction) {
    // Place the ship on the game board
    if (this.validatePlacement(ship, x, y, direction)) {
      this.ships.push(ship);
      if (direction === "horizontal") {
        for (let i = 0; i < ship.length; i++) {
          this.board[x][y + i] = ship;
        }
      } else {
        for (let i = 0; i < ship.length; i++) {
          this.board[x + i][y] = ship;
        }
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
