import { describe, expect, it } from 'vitest';
import { WORLDS } from '@/game/worlds';
import { createAdventureChallenge, createMemoryCards, isMemoryMatch, isNextDot, paintComplete, puzzleSolved, createPuzzle } from '@/game/adventure';
import { SHIRT_STYLES, BOTTOM_STYLES, SHOE_STYLES, ACCESSORIES, saveCharacter, DEFAULT_GIRL } from '@/game/character';
import { loadProgress, saveProgress } from '@/game/worlds';
import { freshShapeRun, applyShapeAnswer } from '@/game/shapes';
describe('Aventura completa', () => {
 it('offers the ten requested worlds in order and opens all of them', () => {
  expect(WORLDS.map(world => world.name)).toEqual(['Números', 'Formas', 'Lógica', 'Desafios', 'Memória', 'Inglês', 'Completar Palavras', 'Ligar números', 'Pintar', 'Quebra-Cabeça']);
  expect(WORLDS.every(world => world.available)).toBe(true);
 });
 it('provides more adventurer clothes and gear', () => {
  expect(SHIRT_STYLES).toEqual(expect.arrayContaining(['explorer', 'jacket', 'cape', 'compass']));
  expect(BOTTOM_STYLES).toContain('cargo'); expect(SHOE_STYLES).toContain('boots');
  expect(ACCESSORIES).toEqual(expect.arrayContaining(['explorerhat', 'backpack', 'scarf']));
 });
 it('preserves progress when changing the character', () => {
  saveProgress({ formas: { stars: 4, completedLevels: 4 }, numeros: { stars: 1 } });
  saveCharacter({ ...DEFAULT_GIRL, shirtStyle: 'explorer' });
  expect(loadProgress()).toEqual({ formas: { stars: 4, completedLevels: 4 }, numeros: { stars: 1 } });
 });
 it.each(['numeros', 'logica', 'desafios', 'ingles', 'palavras'] as const)('varies %s questions and always offers the answer', id => {
  let previous = '';
  for (let level = 0; level < 10; level++) {
   const challenge = createAdventureChallenge(id, level, previous);
   expect(challenge.fingerprint).not.toBe(previous);
   expect(challenge.options.filter(option => option.id === challenge.answer)).toHaveLength(1);
   expect(new Set(challenge.options.map(option => option.id)).size).toBe(3);
   previous = challenge.fingerprint;
  }
 });
 it('starts every phase with 3 hearts, loses one per error and resets only the round after 3', () => {
  let run = { ...freshShapeRun(), round: 2 }; expect(run.hearts).toBe(3);
  run = applyShapeAnswer(run, false); expect(run.hearts).toBe(2);
  run = applyShapeAnswer(run, false); expect(run.hearts).toBe(1);
  run = applyShapeAnswer(run, false); expect(run).toMatchObject({ hearts: 0, round: 0, status: 'lost' });
 });
 it('creates memory pairs and rejects using one card twice', () => {
  const cards = createMemoryCards(0); expect(cards).toHaveLength(6);
  for (const symbol of new Set(cards)) expect(cards.filter(card => card === symbol)).toHaveLength(2);
  expect(createMemoryCards(9)).toHaveLength(8);
  expect(isMemoryMatch(['🍎', '🍎'], 0, 1)).toBe(true); expect(isMemoryMatch(['🍎'], 0, 0)).toBe(false);
 });
 it('requires dots in numeric order', () => { expect(isNextDot(2, 3)).toBe(true); expect(isNextDot(2, 4)).toBe(false); });
 it('requires all six painting regions before completion', () => { expect(paintComplete(['rose', 'sun', 'leaf', 'ocean', 'rose', null])).toBe(false); expect(paintComplete(['rose', 'sun', 'leaf', 'ocean', 'rose', 'sun'])).toBe(true); });
 it('requires an assembled puzzle and starts shuffled', () => { expect(puzzleSolved([0, 1, 2, 3])).toBe(true); expect(puzzleSolved([1, 0, 2, 3])).toBe(false); expect(puzzleSolved(createPuzzle())).toBe(false); });
});
