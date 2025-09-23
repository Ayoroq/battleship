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
    this.MAX_SHIP_LENGTH = 5;
    this.board = Array.from({ length: this.boardSize }, () =>
      Array(this.boardSize).fill(null)
    );
    this.ships = [];
  }

  validateShip(ship) {
    //check if ship is valid
    if (typeof ship.length !== "number") {
      return false;
    }
    if (ship.length < 1) {
      return false;
    }
    if (typeof ship.name !== "string" || ship.name.length === 0) {
      return false;
    }
    if (ship.length > this.MAX_SHIP_LENGTH) {
      return false;
    }
    return true;
  }

  validatePlacement(ship, x, y, direction) {
    //check if ship placement is valid
    if (!this.validateShip(ship)) {
      return false;
    }
    if (x < 0 || x >= this.boardSize || y < 0 || y >= this.boardSize) {
      return false;
    }
    if (direction !== "horizontal" && direction !== "vertical") {
      return false;
    }
    // Check if the ship can be placed at the given coordinates
    if (direction === "horizontal") {
      if (y + ship.length > this.boardSize) {
        return false;
      }
      for (let i = 0; i < ship.length; i++) {
        if (this.board[x][y + i] !== null) {
          return false;
        }
      }
    } else {
      if (x + ship.length > this.boardSize) {
        return false;
      }
      for (let i = 0; i < ship.length; i++) {
        if (this.board[x + i][y] !== null) {
          return false;
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

  getShipAt(x, y) {
    // Get the ship at the given coordinates
    return this.board[x][y];
  }

  resetBoard() {
    // Reset the game board
    this.board = Array.from({ length: this.boardSize }, () =>
      Array(this.boardSize).fill(null)
    );
    this.ships = [];
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

  placeShipsRandomly(ships) {
    for (const ship of ships) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;
      
      while (!placed && attempts < maxAttempts) {
        const x = Math.floor(Math.random() * this.boardSize);
        const y = Math.floor(Math.random() * this.boardSize);
        const direction = Math.random() < 0.5 ? "horizontal" : "vertical";
        
        if (this.validatePlacement(ship, x, y, direction)) {
          this.placeShip(ship, x, y, direction);
          placed = true;
        }
        attempts++;
      }
    }
  }
}

class Player {
  constructor(name) {
    this.name = name;
    this.gameboard = new Gameboard();
  }

  // Attack opponent's gameboard at given coordinates
  attack(enemy, x, y) {
    return enemy.gameboard.receiveAttack(x, y);
  }
}

export { Ship, Gameboard, Player };
