import Ship from "./game";

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
