// Registry of educational worlds. Add a world here and set `available: true`
// once its activities exist. Progress is stored separately from the character.
export interface World {
  id: "numeros" | "formas" | "logica" | "desafios" | "memoria";
  name: string;
  emoji: string;
  color: string; // island tint
  available: boolean;
}

export const WORLDS: World[] = [
  { id: "numeros", name: "Números", emoji: "🔢", color: "#FFB547", available: false },
  { id: "formas", name: "Formas", emoji: "🔺", color: "#FF7EB6", available: false },
  { id: "logica", name: "Lógica", emoji: "🧩", color: "#3BCE76", available: false },
  { id: "desafios", name: "Desafios", emoji: "⚖️", color: "#4D9BFA", available: false },
  { id: "memoria", name: "Memória", emoji: "🧠", color: "#A26BFA", available: false },
];

const PROGRESS_KEY = "aventura:progress:v1";
export type Progress = Partial<Record<World["id"], { stars: number }>>;

export function loadProgress(): Progress {
  try {
    return JSON.parse(window.localStorage.getItem(PROGRESS_KEY) ?? "{}") as Progress;
  } catch {
    return {};
  }
}
export function saveProgress(p: Progress) {
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}
