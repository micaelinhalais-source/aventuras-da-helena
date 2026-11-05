export type Shape = "circle" | "square" | "triangle" | "rectangle" | "star";
export const SHAPE_NAMES: Record<Shape, string> = { circle: "círculo", square: "quadrado", triangle: "triângulo", rectangle: "retângulo", star: "estrela" };
export const SHAPES: Shape[] = ["circle", "square", "triangle", "rectangle", "star"];
export const SHAPE_LEVELS = [
  { name: "Largada das formas", icon: "🚦", mode: "find" },
  { name: "Sombras misteriosas", icon: "🌘", mode: "shadow" },
  { name: "Curva dos lados", icon: "🔺", mode: "sides" },
  { name: "Formas pelo caminho", icon: "🏠", mode: "objects" },
  { name: "Grandes e pequenas", icon: "🐘", mode: "size" },
  { name: "Quem é diferente?", icon: "🔎", mode: "odd" },
  { name: "Trilha dos padrões", icon: "🧵", mode: "pattern" },
  { name: "Olhe e lembre", icon: "🧠", mode: "memory" },
  { name: "Coleção de formas", icon: "🧺", mode: "collect" },
  { name: "Ordem da chegada", icon: "🏁", mode: "sort" },
] as const;
export type ShapeMode = typeof SHAPE_LEVELS[number]["mode"];
export interface ShapeOption { id: string; shape: Shape; color: number; size: number }
export interface ShapeChallenge {
  mode: ShapeMode;
  prompt: string;
  target: Shape;
  options: ShapeOption[];
  correctIds: string[];
  sequence: Shape[];
  object: string | undefined;
  fingerprint: string;
}

function shuffle<T>(values: T[], random: () => number): T[] {
  return values.map(value => ({ value, rank: random() })).sort((a, b) => a.rank - b.rank).map(item => item.value);
}
export function createShapeChallenge(level: number, previous = "", random: () => number = Math.random): ShapeChallenge {
  const mode = SHAPE_LEVELS[level]?.mode ?? "find";
  // Generate new arrangements and targets for every question and retry.
  let result: ShapeChallenge | undefined;
  for (let attempt = 0; attempt < 30; attempt++) {
    const candidates = shuffle(SHAPES, random);
    const target = candidates[0] ?? "circle";
    const other = candidates[1] ?? "square";
    let options = candidates.slice(0, 3).map((shape, i) => ({ id: String(i), shape, color: Math.floor(random() * 4), size: 70 }));
    let prompt = `Encontre ${target === "star" ? "a" : "o"} ${SHAPE_NAMES[target]}.`;
    let correctIds = ["0"];
    let sequence: Shape[] = [];
    let object: string | undefined;
    if (mode === "shadow") prompt = "Qual forma combina com esta sombra?";
    if (mode === "sides") {
      const sided: Shape[] = ["circle", "triangle", random() < .5 ? "square" : "rectangle"];
      options = shuffle(sided, random).map((shape, i) => ({ id: String(i), shape, color: Math.floor(random() * 4), size: 70 }));
      const sides = [0, 3, 4][Math.floor(random() * 3)] ?? 3;
      prompt = sides === 0 ? "Qual forma não tem lados retos?" : `Qual forma tem ${sides} lados?`;
      correctIds = options.filter(o => sides === 0 ? o.shape === "circle" : sides === 3 ? o.shape === "triangle" : o.shape === "square" || o.shape === "rectangle").map(o => o.id);
    }
    if (mode === "objects") {
      const objects: Record<Shape, string[]> = { circle: ["⚽", "🕒", "🍊"], triangle: ["🍕", "⛺", "📐"], square: ["🎲", "🎁", "🪟"], rectangle: ["🚪", "📱", "📕"], star: ["🌟", "⭐", "🌠"] };
      object = objects[target][Math.floor(random() * 3)] ?? objects[target][0];
      prompt = "Com qual forma este objeto se parece?";
    }
    if (mode === "size" || mode === "sort") {
      options = [42, 64, 90].map((size, i) => ({ id: String(i), shape: target, color: 0, size }));
      const biggest = random() < .5;
      prompt = mode === "sort" ? "Toque do menor para o maior." : biggest ? "Qual é a maior forma?" : "Qual é a menor forma?";
      correctIds = mode === "sort" ? ["0", "1", "2"] : [biggest ? "2" : "0"];
    }
    if (mode === "odd") {
      options = [other, other, target, other].map((shape, i) => ({ id: String(i), shape, color: 0, size: 70 }));
      prompt = "Qual forma é diferente das outras?";
      correctIds = ["2"];
    }
    if (mode === "pattern") {
      sequence = [target, other, target, other, target];
      prompt = "Qual forma continua a trilha?";
      correctIds = options.filter(o => o.shape === other).map(o => o.id);
    }
    if (mode === "memory") prompt = "Qual forma você acabou de ver?";
    if (mode === "collect") {
      options = [target, other, target, candidates[2] ?? "star", target, other].map((shape, i) => ({ id: String(i), shape, color: Math.floor(random() * 4), size: 70 }));
      prompt = `Escolha todas as formas iguais ${target === "star" ? "à" : "ao"} ${SHAPE_NAMES[target]}.`;
      correctIds = ["0", "2", "4"];
    }
    options = shuffle(options, random);
    const fingerprint = JSON.stringify([target, prompt, options, object]);
    result = { mode, target, prompt, correctIds, options, sequence, object, fingerprint };
    if (fingerprint !== previous) return result;
  }
  if (result) return result;
  throw new Error("Unable to generate shapes challenge");
}

export function checkShapeAnswer(challenge: ShapeChallenge, ids: string[]) {
  if (challenge.correctIds.length !== ids.length) return false;
  if (challenge.mode === "sort") return challenge.correctIds.every((id, i) => ids[i] === id);
  return challenge.correctIds.every(id => ids.includes(id));
}
export const SHAPE_ROUNDS = 3;
export interface ShapeRun { hearts: number; round: number; status: "playing" | "correct" | "lost" | "complete" }
export const freshShapeRun = (): ShapeRun => ({ hearts: 3, round: 0, status: "playing" });
export function applyShapeAnswer(run: ShapeRun, correct: boolean): ShapeRun {
  if (run.status !== "playing") return run;
  if (correct) return { ...run, status: "correct" };
  const hearts = Math.max(0, run.hearts - 1);
  return { ...run, hearts, round: hearts === 0 ? 0 : run.round, status: hearts === 0 ? "lost" : "playing" };
}
export function advanceShapeRun(run: ShapeRun): ShapeRun {
  if (run.status !== "correct") return run;
  return run.round === SHAPE_ROUNDS - 1 ? { ...run, status: "complete" } : { ...run, round: run.round + 1, status: "playing" };
}