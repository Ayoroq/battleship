import { Ship, Gameboard } from "./game";

describe("Ship class", () => {
  test("initializes with correct properties", () => {
    // Create a new ship and verify all properties are set correctly
    const ship = new Ship("Destroyer", 3);
    expect(ship.name).toBe("Destroyer");
    expect(ship.length).toBe(3);
    expect(ship.hits).toBe(0);
    expect(ship.sunk).toBe(false);
  });

  test("hit() increments hits", () => {
    // Test that hitting a ship increases the hit count
    const ship = new Ship("Submarine", 2);
    ship.hit();
    expect(ship.hits).toBe(1);
    ship.hit();
    expect(ship.hits).toBe(2);
  });

  test("isSunk() returns false when hits < length", () => {
    // Ship should not be sunk when hits are less than length
    const ship = new Ship("Cruiser", 4);
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(false);
    expect(ship.sunk).toBe(false);
  });

  test("isSunk() returns true when hits >= length", () => {
    // Ship should be sunk when hits equal or exceed length
    const ship = new Ship("Battleship", 3);
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
    expect(ship.sunk).toBe(true);
  });
});

describe("Gameboard class", () => {
  test("initializes with empty board", () => {
    const gameboard = new Gameboard();
    expect(gameboard.board).toEqual(
      Array.from({ length: 10 }, () => Array(10).fill(null))
    );
    expect(gameboard.ships).toEqual([]);
  });

  test("places ship on board", () => {
    const gameboard = new Gameboard();
    const ship = new Ship("Destroyer", 3);
    gameboard.placeShip(ship, 0, 0, "horizontal");
    expect(gameboard.board[0][0]).toBe(ship);
    expect(gameboard.board[0][1]).toBe(ship);
    expect(gameboard.board[0][2]).toBe(ship);
    expect(gameboard.ships).toContain(ship);
  });

  test("receiveAttack() hits a ship", () => {
    const gameboard = new Gameboard();
    const ship = new Ship("Submarine", 2);
    gameboard.placeShip(ship, 0, 0, "horizontal");
    expect(gameboard.receiveAttack(0, 0)).toBe(true);
    expect(ship.hits).toBe(1);
    expect(gameboard.board[0][0]).toBe(ship);
    expect(gameboard.board[0][1]).toBe(ship);
  });

  test("receiveAttack() misses", () => {
    const gameboard = new Gameboard();
    expect(gameboard.receiveAttack(0, 0)).toBe(false);
    expect(gameboard.board[0][0]).toBe(null);
  });

  test("allShipsSunk() returns false when not all ships are sunk", () => {
    const gameboard = new Gameboard();
    const ship1 = new Ship("Destroyer", 3);
    const ship2 = new Ship("Submarine", 2);
    gameboard.placeShip(ship1, 0, 0, "horizontal");
    gameboard.placeShip(ship2, 2, 2, "vertical");
    gameboard.receiveAttack(0, 0);
    gameboard.receiveAttack(1, 0);
    gameboard.receiveAttack(2, 2);
    expect(gameboard.allShipsSunk()).toBe(false);
  });

  test("allShipsSunk() returns true when all ships are sunk", () => {
    const gameboard = new Gameboard();
    const ship1 = new Ship("Destroyer", 3);
    const ship2 = new Ship("Submarine", 2);
    gameboard.placeShip(ship1, 0, 0, "horizontal");
    gameboard.placeShip(ship2, 2, 2, "vertical");
    gameboard.receiveAttack(0, 0);
    gameboard.receiveAttack(0, 1);
    gameboard.receiveAttack(0, 2);
    gameboard.receiveAttack(2, 2);
    gameboard.receiveAttack(3, 2);
    expect(gameboard.allShipsSunk()).toBe(true);
  });

  test("allShipsSunk() returns false when no ships are placed", () => {
    // Test the edge case fix for empty ships array
    const gameboard = new Gameboard();
    expect(gameboard.allShipsSunk()).toBe(false);
  });

  test("validates ship placement bounds", () => {
    const gameboard = new Gameboard();
    const ship = new Ship("Destroyer", 3);
    
    // Test out of bounds placement
    expect(() => gameboard.placeShip(ship, 8, 0, "horizontal")).toThrow("Ship placement out of bounds");
    expect(() => gameboard.placeShip(ship, 0, 8, "vertical")).toThrow("Ship placement out of bounds");
  });

  test("validates ship overlap", () => {
    const gameboard = new Gameboard();
    const ship1 = new Ship("Destroyer", 3);
    const ship2 = new Ship("Submarine", 2);
    
    gameboard.placeShip(ship1, 0, 0, "horizontal");
    // Try to place ship2 overlapping with ship1
    expect(() => gameboard.placeShip(ship2, 0, 0, "vertical")).toThrow("Ship placement overlaps with another ship");
  });

  test("validates ship properties", () => {
    const gameboard = new Gameboard();
    
    // Test invalid ship length
    expect(() => gameboard.placeShip({ name: "Test", length: 0 }, 0, 0, "horizontal")).toThrow("Ship length must be at least 1");
    expect(() => gameboard.placeShip({ name: "Test", length: 5 }, 0, 0, "horizontal")).toThrow("Ship length must be at most 4");
    
    // Test invalid ship name
    expect(() => gameboard.placeShip({ name: "", length: 2 }, 0, 0, "horizontal")).toThrow("Ship must have a valid name and it must be a string");
    
    // Test invalid ship length type
    expect(() => gameboard.placeShip({ name: "Test", length: "invalid" }, 0, 0, "horizontal")).toThrow("Ship length must be a number");
  });
});
