import { describe, expect, it } from "vitest";
import { xpForDifficulty } from "@/game/xp";

describe("xpForDifficulty", () => {
  it("возвращает значения из таблицы", () => {
    expect(xpForDifficulty("trivial")).toBe(5);
    expect(xpForDifficulty("easy")).toBe(15);
    expect(xpForDifficulty("medium")).toBe(40);
    expect(xpForDifficulty("hard")).toBe(80);
    expect(xpForDifficulty("epic")).toBe(150);
  });
});
