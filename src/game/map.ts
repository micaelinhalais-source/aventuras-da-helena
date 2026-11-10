import type { Progress } from './worlds';
import { WORLDS } from './worlds';

export function adventureTotals(progress: Progress) {
  return {
    points: WORLDS.reduce((sum, world) => sum + (progress[world.id]?.stars ?? 0), 0),
    completed: WORLDS.reduce((sum, world) => sum + Math.min(10, Math.max(0, progress[world.id]?.completedLevels ?? 0)), 0),
  };
}
export function worldMapStops(progress: Progress) {
  const current = WORLDS.findIndex(world => (progress[world.id]?.completedLevels ?? 0) < 10);
  return WORLDS.map((world, index) => {
    const saved = progress[world.id];
    const started = (saved?.completedLevels ?? 0) > 0 || (saved?.stars ?? 0) > 0;
    return {
      id: world.id, name: `Mundo ${world.name}`, emoji: world.emoji,
      done: (saved?.completedLevels ?? 0) >= 10,
      // Keep previously played worlds accessible, including legacy saves.
      locked: current >= 0 && index > current && !started,
      badge: started ? `${saved?.completedLevels ?? 0}/10` : undefined,
    };
  });
}