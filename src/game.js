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
    this.MAX_SHIP_LENGTH = 4;
    this.board = Array.from({ length: this.boardSize }, () =>
      Array(this.boardSize).fill(null)
    );
    this.ships = [];
  }

  validateShip(ship) {
    //check if ship is valid
    if (typeof ship.length !== "number") {
      throw new Error("Ship length must be a number");
    }
    if (ship.length < 1) {
      throw new Error("Ship length must be at least 1");
    }
    if (typeof ship.name !== "string" || ship.name.length === 0) {
      throw new Error("Ship must have a valid name and it must be a string");
    }
    if (ship.length > this.MAX_SHIP_LENGTH) {
      throw new Error(`Ship length must be at most ${this.MAX_SHIP_LENGTH}`);
    }
    return true;
  }

  validatePlacement(ship, x, y, direction) {
    //check if ship placement is valid
    if (!this.validateShip(ship)) {
      throw new Error("Invalid ship");
    }
    if (x < 0 || x >= this.boardSize || y < 0 || y >= this.boardSize) {
      throw new Error("Ship placement out of bounds");
    }
    if (direction !== "horizontal" && direction !== "vertical") {
      throw new Error("Invalid direction");
    }
    // Check if the ship can be placed at the given coordinates
    if (direction === "horizontal") {
      if (x + ship.length > this.boardSize) {
        throw new Error("Ship placement out of bounds");
      }
      for (let i = 0; i < ship.length; i++) {
        if (this.board[x][y + i] !== null) {
          throw new Error("Ship placement overlaps with another ship");
        }
      }
    } else {
      if (y + ship.length > this.boardSize) {
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
    return this.ships.length > 0 && this.ships.every((ship) => ship.isSunk());
  }
}

module.exports = {
  Ship,
  Gameboard,
};
