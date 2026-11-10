import { describe, expect, it } from 'vitest';
import { adventureTotals, worldMapStops } from '@/game/map';
import { chooseEncouragement, ENCOURAGEMENTS, nextEncouragement } from '@/game/encouragement';

describe('Adventure map preserves existing progress', () => {
  it('uses saved stars as points and completed phases for progress', () => {
    expect(adventureTotals({ numeros: { stars: 10, completedLevels: 10 }, formas: { stars: 4, completedLevels: 4 } })).toEqual({ points: 14, completed: 14 });
  });
  it('opens the current world and locks future unplayed worlds', () => {
    const stops = worldMapStops({ numeros: { stars: 10, completedLevels: 10 } });
    expect(stops[0]).toMatchObject({ done: true, locked: false });
    expect(stops[1]).toMatchObject({ done: false, locked: false });
    expect(stops.slice(2).every(stop => stop.locked)).toBe(true);
  });
  it('does not lock a previously played world or mutate saved data', () => {
    const progress = { formas: { stars: 4, completedLevels: 4 }, ingles: { stars: 1 } };
    expect(worldMapStops(progress)[5]?.locked).toBe(false);
    expect(progress).toEqual({ formas: { stars: 4, completedLevels: 4 }, ingles: { stars: 1 } });
  });
});
describe('Activity encouragement', () => {
  it('includes all six requested messages', () => {
    expect(ENCOURAGEMENTS).toEqual(['Parabéns, Helena! Você é muito inteligente!', 'Tia Mica está muito orgulhosa de você!', 'Você é muito boa nisso, Helena!', 'Helena, você é muito esperta!', 'Que incrível, Helena! Você arrasou!', 'Continue assim, Helena!']);
  });
  it('never repeats the previous message, even with the same random choice', () => {
    for (const message of ENCOURAGEMENTS) expect(chooseEncouragement(message, () => 0)).not.toBe(message);
    let previous = nextEncouragement();
    for (let i = 0; i < 100; i++) { const next = nextEncouragement(); expect(next).not.toBe(previous); previous = next; }
  });
});