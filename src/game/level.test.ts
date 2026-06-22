import { describe, expect, it } from "vitest";
import { getPlayerState, levelFromTotalXp } from "@/game/level";

describe("levelFromTotalXp", () => {
  it("0 XP — это уровень 1", () => {
    expect(levelFromTotalXp(0)).toBe(1);
  });

  it("чуть ниже порога остаётся на прежнем уровне", () => {
    expect(levelFromTotalXp(99)).toBe(1);
    expect(levelFromTotalXp(299)).toBe(2);
  });

  it("ровно на пороге уровень повышается", () => {
    expect(levelFromTotalXp(100)).toBe(2);
    expect(levelFromTotalXp(300)).toBe(3);
    expect(levelFromTotalXp(600)).toBe(4);
  });

  it("чуть выше порога — тот же новый уровень", () => {
    expect(levelFromTotalXp(101)).toBe(2);
    expect(levelFromTotalXp(301)).toBe(3);
  });

  it("отрицательный опыт трактуется как уровень 1", () => {
    expect(levelFromTotalXp(-50)).toBe(1);
  });
});

describe("getPlayerState", () => {
  it("0 XP: уровень 1, прогресс пуст, до 2-го нужно 100", () => {
    expect(getPlayerState(0)).toEqual({
      totalXp: 0,
      level: 1,
      xpIntoLevel: 0,
      xpForNextLevel: 100,
    });
  });

  it("ровно на пороге уровня: прогресс обнуляется", () => {
    expect(getPlayerState(100)).toEqual({
      totalXp: 100,
      level: 2,
      xpIntoLevel: 0,
      xpForNextLevel: 200, // 300 - 100
    });
  });

  it("чуть выше порога: считает прогресс внутри уровня", () => {
    expect(getPlayerState(150)).toEqual({
      totalXp: 150,
      level: 2,
      xpIntoLevel: 50, // 150 - 100
      xpForNextLevel: 200,
    });
  });

  it("отрицательный опыт клампится к нулю", () => {
    expect(getPlayerState(-10)).toEqual({
      totalXp: 0,
      level: 1,
      xpIntoLevel: 0,
      xpForNextLevel: 100,
    });
  });
});
