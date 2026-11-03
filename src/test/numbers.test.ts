import { describe, expect, it } from "vitest";
import { createCountingRounds, isCountingAnswer } from "@/game/numbers";

describe("Counting activity", () => {
  it("provides one round for each number from 1 to 5", () => {
    expect(createCountingRounds().map(round => round.count)).toEqual([1, 2, 3, 4, 5]);
  });
  it("offers three distinct answers including the correct count", () => {
    for (const round of createCountingRounds()) {
      expect(new Set(round.options).size).toBe(3);
      expect(round.options).toContain(round.count);
      expect(round.options.every(value => value >= 1 && value <= 5)).toBe(true);
    }
  });
  it("accepts only the number matching the figures", () => {
    for (const round of createCountingRounds()) {
      expect(isCountingAnswer(round, round.count)).toBe(true);
      expect(isCountingAnswer(round, round.count + 1)).toBe(false);
    }
  });
});