import { describe, expect, it } from "vitest";
import { clampXp, DIFFICULTY_RANGES } from "@/game/xp";

describe("DIFFICULTY_RANGES", () => {
  it("содержит ожидаемые диапазоны", () => {
    expect(DIFFICULTY_RANGES).toEqual({
      trivial: [2, 9],
      easy: [10, 29],
      medium: [30, 69],
      hard: [70, 129],
      epic: [130, 240],
    });
  });
});

describe("clampXp", () => {
  it("значение внутри диапазона остаётся как есть", () => {
    expect(clampXp("medium", 47)).toBe(47);
    expect(clampXp("epic", 200)).toBe(200);
  });

  it("значение ниже min поднимается до min", () => {
    expect(clampXp("trivial", 0)).toBe(2);
    expect(clampXp("hard", 10)).toBe(70);
    expect(clampXp("medium", -5)).toBe(30);
  });

  it("значение выше max опускается до max", () => {
    expect(clampXp("trivial", 100)).toBe(9);
    expect(clampXp("epic", 999)).toBe(240);
  });

  it("дробное округляется до целого", () => {
    expect(clampXp("medium", 47.4)).toBe(47);
    expect(clampXp("medium", 47.6)).toBe(48);
  });

  it("границы диапазона включительно", () => {
    expect(clampXp("easy", 10)).toBe(10);
    expect(clampXp("easy", 29)).toBe(29);
  });
});
