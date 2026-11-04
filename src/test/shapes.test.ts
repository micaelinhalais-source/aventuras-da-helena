import { describe, expect, it } from "vitest";
import { SHAPE_LEVELS, advanceShapeRun, applyShapeAnswer, checkShapeAnswer, createShapeChallenge, freshShapeRun } from "@/game/shapes";

describe("Shapes world rules", () => {
  it("has exactly ten modules with ten distinct activity types", () => {
    expect(SHAPE_LEVELS).toHaveLength(10);
    expect(new Set(SHAPE_LEVELS.map(level => level.mode)).size).toBe(10);
  });
  it("starts each phase with three hearts", () => {
    expect(freshShapeRun()).toEqual({ hearts: 3, round: 0, status: "playing" });
  });
  it("removes one heart for each wrong answer", () => {
    const once = applyShapeAnswer(freshShapeRun(), false);
    expect(once.hearts).toBe(2);
    expect(applyShapeAnswer(once, false).hearts).toBe(1);
  });
  it("resets the current phase to its first question after three errors", () => {
    let run = advanceShapeRun(applyShapeAnswer(freshShapeRun(), true));
    expect(run.round).toBe(1);
    for (let i = 0; i < 3; i++) run = applyShapeAnswer(run, false);
    expect(run).toEqual({ hearts: 0, round: 0, status: "lost" });
    expect(applyShapeAnswer(run, false)).toEqual(run);
    expect(freshShapeRun().hearts).toBe(3);
  });
  it("does not remove hearts for correct answers or repeated taps", () => {
    const run = applyShapeAnswer(freshShapeRun(), true);
    expect(run.hearts).toBe(3);
    expect(applyShapeAnswer(run, false)).toEqual(run);
  });
  it("completes only after all three questions", () => {
    let run = freshShapeRun();
    for (let i = 0; i < 2; i++) run = advanceShapeRun(applyShapeAnswer(run, true));
    expect(run.status).toBe("playing");
    expect(advanceShapeRun(applyShapeAnswer(run, true)).status).toBe("complete");
  });
  it("generates valid new questions and shuffled answers in every module", () => {
    for (let level = 0; level < 10; level++) {
      let previous = "";
      for (let i = 0; i < 30; i++) {
        const question = createShapeChallenge(level, previous);
        expect(question.fingerprint).not.toBe(previous);
        expect(checkShapeAnswer(question, question.correctIds)).toBe(true);
        expect(checkShapeAnswer(question, [])).toBe(false);
        expect(question.correctIds.every(id => question.options.some(option => option.id === id))).toBe(true);
        previous = question.fingerprint;
      }
    }
  });
  it("requires all matching shapes and the correct size order", () => {
    const collection = createShapeChallenge(8);
    expect(checkShapeAnswer(collection, collection.correctIds.slice(0, 1))).toBe(false);
    const order = createShapeChallenge(9);
    expect(checkShapeAnswer(order, [...order.correctIds].reverse())).toBe(false);
  });
});