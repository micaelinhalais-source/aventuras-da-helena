import type { World } from './worlds';
export type AdventureId = Exclude<World['id'], 'formas'>;
export interface Choice { id: string; label: string }
export interface AdventureChallenge {
  prompt: string; display: string; options: Choice[]; answer: string;
  fingerprint: string; count?: number;
}
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const a = result[i], b = result[j];
    if (a !== undefined && b !== undefined) { result[i] = b; result[j] = a; }
  }
  return result;
}
const WORDS = [
  ['🐱', 'GATO', 'CAT'], ['🐶', 'CACHORRO', 'DOG'], ['☀️', 'SOL', 'SUN'], ['🍎', 'MAÇÃ', 'APPLE'],
  ['🐟', 'PEIXE', 'FISH'], ['⭐', 'ESTRELA', 'STAR'], ['🌙', 'LUA', 'MOON'], ['🏠', 'CASA', 'HOUSE'],
  ['📚', 'LIVRO', 'BOOK'], ['🌸', 'FLOR', 'FLOWER'], ['🦋', 'BORBOLETA', 'BUTTERFLY'], ['🐦', 'PÁSSARO', 'BIRD'],
];
export function createAdventureChallenge(id: AdventureId, level: number, previous = '', random: () => number = Math.random): AdventureChallenge {
  const pick = (max: number) => Math.floor(random() * max);
  let challenge: AdventureChallenge = { prompt: '', display: '', options: [], answer: '', fingerprint: '' };
  for (let attempt = 0; attempt < 50; attempt++) {
    const n = 1 + pick(Math.min(10, 5 + level));
    let labels: string[] = [];
    let answer = '', prompt = '', display = '';
    if (id === 'numeros') {
      const emoji = ['🍎', '🦋', '⭐', '🍓', '🐠'][pick(5)] ?? '🍎';
      prompt = 'Quantas figuras você vê?'; display = Array(n).fill(emoji).join(' '); answer = String(n);
      labels = [answer, String(n + 1), String(n === 1 ? 3 : n - 1)];
    } else if (id === 'logica') {
      const symbols = shuffle(['🌸', '🍎', '⭐', '🐟', '🦋', '🌙'], random);
      const a = symbols[0] ?? '🌸', b = symbols[1] ?? '🍎', c = symbols[2] ?? '⭐';
      const mode = level % 3;
      prompt = mode === 2 ? 'Qual figura é diferente?' : 'Qual figura vem agora?';
      display = mode === 0 ? `${a} ${b} ${a} ${b} ${a} ?` : mode === 1 ? `${a} ${a} ${b} ${a} ${a} ?` : `${a} ${a} ${b} ${a}`;
      answer = b; labels = [a, b, c];
    } else if (id === 'desafios') {
      const b = 1 + pick(4);
      prompt = level % 2 ? 'Quanto sobra?' : 'Quantas frutas ao todo?';
      const a = level % 2 ? n + b : n;
      display = `${Array(a).fill('🍓').join(' ')} ${level % 2 ? '−' : '+'} ${Array(b).fill('🍓').join(' ')}`;
      answer = String(level % 2 ? a - b : a + b); labels = [answer, String(Number(answer) + 1), String(Number(answer) - 1)];
    } else if (id === 'ingles' || id === 'palavras') {
      const row = WORDS[pick(WORDS.length)] ?? ['🐱', 'GATO', 'CAT'];
      const [emoji = '🐱', word = 'GATO', english = 'CAT'] = row;
      if (id === 'ingles') {
        prompt = 'Como se chama em inglês?'; display = emoji; answer = english;
        labels = [english, ...shuffle(WORDS.filter(item => item[2] !== english), random).slice(0, 2).map(item => item[2] ?? 'DOG')];
      } else {
        const index = pick(word.length); answer = word[index] ?? 'A';
        prompt = 'Qual letra está faltando?'; display = `${emoji} ${word.slice(0, index)}_${word.slice(index + 1)}`;
        labels = [answer, ...shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZÇÃÁ'.split('').filter(letter => letter !== answer), random).slice(0, 2)];
      }
    }
    challenge = { prompt, display, answer, options: shuffle(labels, random).map(label => ({ id: label, label })), fingerprint: `${prompt}|${display}|${answer}`, count: n };
    if (challenge.fingerprint !== previous) return challenge;
  }
  return challenge;
}
export const MEMORY_SYMBOLS = ['🌸', '🍎', '⭐', '🦋', '🐟', '🐱', '🌙', '🐶', '🍓', '🌻'];
export function createMemoryCards(level: number, random: () => number = Math.random) {
  const selected = shuffle(MEMORY_SYMBOLS, random).slice(0, level >= 5 ? 4 : 3);
  return shuffle([...selected, ...selected], random);
}
export function isMemoryMatch(cards: string[], a: number, b: number) { return a !== b && cards[a] !== undefined && cards[a] === cards[b]; }
export function isNextDot(current: number, tapped: number) { return tapped === current + 1; }
export function puzzleSolved(tiles: number[]) { return tiles.length === 4 && tiles.every((tile, index) => tile === index); }
export function createPuzzle(random: () => number = Math.random) { const tiles = shuffle([0, 1, 2, 3], random); return puzzleSolved(tiles) ? [1, 0, 2, 3] : tiles; }
export const PAINT_COLORS = ['rose', 'sun', 'leaf', 'ocean'] as const;
export type PaintColor = typeof PAINT_COLORS[number];
export function paintComplete(regions: (PaintColor | null)[]) { return regions.length === 6 && regions.every(color => color !== null); }
