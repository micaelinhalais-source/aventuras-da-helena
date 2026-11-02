// Character model, options catalog and local persistence.
export type Gender = "boy" | "girl";
export type EyeShape = "round" | "almond" | "happy" | "big";
export type HairStyle = "short" | "buzz" | "curly" | "afro" | "long" | "ponytail" | "pigtails" | "bun";
export type ShirtStyle = "tshirt" | "longsleeve" | "striped" | "star" | "hoodie";
export type BottomStyle = "shorts" | "pants" | "skirt";
export type ShoeStyle = "sneaker" | "hightop" | "velcro";
export type Accessory = "cap" | "bow" | "glasses" | "crown" | "headphones";

export interface Character {
  gender: Gender;
  skin: string;
  eyeColor: string;
  eyeShape: EyeShape;
  hairColor: string;
  hairStyle: HairStyle;
  shirtStyle: ShirtStyle;
  shirtColor: string;
  bottomStyle: BottomStyle;
  bottomColor: string;
  shoeStyle: ShoeStyle;
  shoeColor: string;
  accessories: Accessory[];
}

export const SKIN_TONES = ["#FDE0CF", "#F5C6A5", "#E0A57E", "#C68456", "#9A5F3A", "#6B3F25"];
export const EYE_COLORS = ["#5B3A1E", "#2F6FD6", "#3E9C55", "#8A6A3B", "#1F1F2E"];
export const EYE_SHAPES: EyeShape[] = ["round", "big", "almond", "happy"];
export const HAIR_COLORS = ["#2A1B12", "#5C3A1E", "#A0612B", "#E8B85A", "#C2462B", "#F06FA8", "#4A7BE0"];
export const HAIR_STYLES: HairStyle[] = ["short", "buzz", "curly", "afro", "long", "ponytail", "pigtails", "bun"];
export const CLOTH_COLORS = ["#FF5A5F", "#FF9F1C", "#FFD23F", "#3BCE76", "#2EC4F1", "#4D6CFA", "#A26BFA", "#FF7EB6", "#FFFFFF", "#2B2D42"];
export const SHIRT_STYLES: ShirtStyle[] = ["tshirt", "longsleeve", "striped", "star", "hoodie"];
export const BOTTOM_STYLES: BottomStyle[] = ["shorts", "pants", "skirt"];
export const SHOE_STYLES: ShoeStyle[] = ["sneaker", "hightop", "velcro"];
export const ACCESSORIES: Accessory[] = ["cap", "bow", "glasses", "crown", "headphones"];

export const DEFAULT_BOY: Character = {
  gender: "boy",
  skin: SKIN_TONES[1],
  eyeColor: EYE_COLORS[0],
  eyeShape: "round",
  hairColor: HAIR_COLORS[1],
  hairStyle: "short",
  shirtStyle: "tshirt",
  shirtColor: "#2EC4F1",
  bottomStyle: "shorts",
  bottomColor: "#4D6CFA",
  shoeStyle: "sneaker",
  shoeColor: "#FF5A5F",
  accessories: [],
};

export const DEFAULT_GIRL: Character = {
  ...DEFAULT_BOY,
  gender: "girl",
  hairStyle: "pigtails",
  hairColor: HAIR_COLORS[2],
  shirtColor: "#FF7EB6",
  bottomStyle: "skirt",
  bottomColor: "#A26BFA",
  shoeColor: "#FFD23F",
  accessories: ["bow"],
};

const KEY = "aventura:character:v1";

export function loadCharacter(): Character | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_BOY, ...(JSON.parse(raw) as Partial<Character>) } : null;
  } catch {
    return null;
  }
}

export function saveCharacter(c: Character) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* storage full or unavailable */
  }
}
