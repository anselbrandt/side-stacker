import { describe, expect, it } from "vitest";
import { Board } from "../types";
import {
  isHorizontal,
  isVertical,
  isDiagonalNegative,
  isDiagonalPositive,
} from "../utils";

export const board: Board = [
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
];

const horizBoard: Board = [
  ["X", "X", "X", "X", null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
];

export const vertBoard: Board = [
  ["X", null, null, null, null, null, null],
  ["X", null, null, null, null, null, null],
  ["X", null, null, null, null, null, null],
  ["X", null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
];

export const diatNegBoard: Board = [
  ["X", null, null, null, null, null, null],
  [null, "X", null, null, null, null, null],
  [null, null, "X", null, null, null, null],
  [null, null, null, "X", null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
];

export const diagPosBoard: Board = [
  [null, null, null, "X", null, null, null],
  [null, null, "X", null, null, null, null],
  [null, "X", null, null, null, null, null],
  ["X", null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
];

describe("toSatisfy()", () => {
  it("win", () => {
    const result = isHorizontal(horizBoard, [0, 0], "X");
    expect(result).toBe(true);
  });
});

describe("toSatisfy()", () => {
  it("win", () => {
    const result = isVertical(vertBoard, [0, 0], "X");
    expect(result).toBe(true);
  });
});

describe("toSatisfy()", () => {
  it("win", () => {
    const result = isDiagonalNegative(diatNegBoard, [0, 0], "X");
    expect(result).toBe(true);
  });
});

describe("toSatisfy()", () => {
  it("win", () => {
    const result = isDiagonalPositive(diagPosBoard, [0, 3], "X");
    expect(result).toBe(true);
  });
});
