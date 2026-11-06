// Registry of educational worlds. Add a world here and set `available: true`
// once its activities exist. Progress is stored separately from the character.
export interface World {
  id: "numeros" | "formas" | "logica" | "desafios" | "memoria" | "ingles" | "palavras" | "ligar" | "pintar" | "quebra-cabeca";
  name: string;
  emoji: string;
  color: string; // island tint
  available: boolean;
}

export const WORLDS: World[] = [
  { id: "numeros", name: "Números", emoji: "🔢", color: "#FFB547", available: true },
  { id: "formas", name: "Formas", emoji: "🔺", color: "#FF7EB6", available: true },
  { id: "logica", name: "Lógica", emoji: "🧩", color: "#3BCE76", available: true },
  { id: "desafios", name: "Desafios", emoji: "⚖️", color: "#4D9BFA", available: true },
  { id: "memoria", name: "Memória", emoji: "🧠", color: "#A26BFA", available: true },
  { id: "ingles", name: "Inglês", emoji: "🌎", color: "#2EC4F1", available: true },
  { id: "palavras", name: "Completar Palavras", emoji: "🔤", color: "#FF7EB6", available: true },
  { id: "ligar", name: "Ligar números", emoji: "✏️", color: "#3BCE76", available: true },
  { id: "pintar", name: "Pintar", emoji: "🎨", color: "#FFD23F", available: true },
  { id: "quebra-cabeca", name: "Quebra-Cabeça", emoji: "🖼️", color: "#FF5A5F", available: true },
];

const PROGRESS_KEY = "aventura:progress:v1";
export type Progress = Partial<Record<World["id"], { stars: number; completedLevels?: number }>>;

export function loadProgress(): Progress {
  try {
    return JSON.parse(window.localStorage.getItem(PROGRESS_KEY) ?? "{}") as Progress;
  } catch {
    return {};
  }
}
export function saveProgress(p: Progress) {
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* The game remains playable when storage is unavailable. */
  }
}
