import { useState } from "react";
import { Undo2, Check } from "lucide-react";
import { Avatar, type AvatarView } from "./Avatar";
import * as K from "@/game/character";
import type { Character, Accessory } from "@/game/character";
import { sfx } from "@/game/sound";

type Group =
  | { kind: "color"; key: keyof Character; options: string[] }
  | { kind: "thumb"; key: keyof Character; options: string[]; view: AvatarView }
  | { kind: "toggle"; options: Accessory[]; view: AvatarView };

interface Category {
  id: string;
  icon: string;
  label: string;
  groups: Group[];
}

const CATEGORIES: Category[] = [
  { id: "who", icon: "🧒", label: "Eu sou", groups: [] },
  { id: "skin", icon: "✋", label: "Pele", groups: [{ kind: "color", key: "skin", options: K.SKIN_TONES }] },
  {
    id: "eyes",
    icon: "👀",
    label: "Olhos",
    groups: [
      { kind: "color", key: "eyeColor", options: K.EYE_COLORS },
      { kind: "thumb", key: "eyeShape", options: K.EYE_SHAPES, view: "head" },
    ],
  },
  {
    id: "hair",
    icon: "💇",
    label: "Cabelo",
    groups: [
      { kind: "color", key: "hairColor", options: K.HAIR_COLORS },
      { kind: "thumb", key: "hairStyle", options: K.HAIR_STYLES, view: "head" },
    ],
  },
  {
    id: "shirt",
    icon: "👕",
    label: "Camisa",
    groups: [
      { kind: "color", key: "shirtColor", options: K.CLOTH_COLORS },
      { kind: "thumb", key: "shirtStyle", options: K.SHIRT_STYLES, view: "torso" },
    ],
  },
  {
    id: "bottom",
    icon: "👖",
    label: "Calça",
    groups: [
      { kind: "color", key: "bottomColor", options: K.CLOTH_COLORS },
      { kind: "thumb", key: "bottomStyle", options: K.BOTTOM_STYLES, view: "legs" },
    ],
  },
  {
    id: "shoes",
    icon: "👟",
    label: "Tênis",
    groups: [
      { kind: "color", key: "shoeColor", options: K.CLOTH_COLORS },
      { kind: "thumb", key: "shoeStyle", options: K.SHOE_STYLES, view: "feet" },
    ],
  },
  { id: "acc", icon: "🧢", label: "Enfeites", groups: [{ kind: "toggle", options: K.ACCESSORIES, view: "head" }] },
];

export function Creator({ initial, onDone }: { initial: Character; onDone: (c: Character) => void }) {
  const [c, setC] = useState<Character>(initial);
  const [history, setHistory] = useState<Character[]>([]);
  const [cat, setCat] = useState(CATEGORIES[0].id);
  const [bump, setBump] = useState(0);

  const apply = (next: Character) => {
    setHistory((h) => [...h.slice(-30), c]);
    setC(next);
    setBump((b) => b + 1);
    sfx.pop();
  };
  const undo = () => {
    const prev = history.at(-1);
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    setC(prev);
    setBump((b) => b + 1);
    sfx.back();
  };

  const category = CATEGORIES.find((x) => x.id === cat)!;

  return (
    <div className="flex h-dvh w-full flex-col gap-4 p-4 md:flex-row md:p-6">
      {/* Stage */}
      <div className="relative flex min-h-0 flex-[1.1] flex-col items-center justify-center">
        <div className="absolute bottom-[6%] h-[16%] w-[70%] rounded-[50%] bg-success/70 shadow-[inset_0_-10px_0_var(--color-success-deep)]" />
        <div key={bump} className="animate-bounce-soft relative h-[88%] max-h-[640px] w-full">
          <Avatar c={c} className="h-full w-full drop-shadow-xl" />
        </div>
        <div className="absolute left-0 top-0 flex gap-3">
          <button className="btn-round disabled:opacity-40" onClick={undo} disabled={!history.length} aria-label="Voltar">
            <Undo2 className="size-8" strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Panel */}
      <div className="panel flex min-h-0 flex-1 flex-col overflow-hidden p-4">
        <div className="flex gap-2 overflow-x-auto pb-3">
          {CATEGORIES.map((x) => (
            <button
              key={x.id}
              onClick={() => {
                setCat(x.id);
                sfx.tab();
              }}
              className={`flex shrink-0 flex-col items-center rounded-2xl px-3 py-2 transition-all ${
                cat === x.id ? "scale-105 bg-primary text-primary-foreground shadow-[0_5px_0_var(--color-primary-deep)]" : "bg-muted"
              }`}
            >
              <span className="text-4xl leading-none">{x.icon}</span>
              <span className="mt-1 text-sm font-semibold">{x.label}</span>
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-1 pb-2 pt-2">
          {cat === "who" && (
            <div className="grid grid-cols-2 gap-4">
              {(["boy", "girl"] as const).map((g) => {
                const preview = g === c.gender ? c : g === "boy" ? { ...K.DEFAULT_BOY, skin: c.skin, eyeColor: c.eyeColor } : { ...K.DEFAULT_GIRL, skin: c.skin, eyeColor: c.eyeColor };
                return (
                  <button
                    key={g}
                    onClick={() => g !== c.gender && apply(preview)}
                    className={`flex flex-col items-center rounded-3xl p-3 transition-all ${
                      c.gender === g ? "bg-primary/40 ring-4 ring-primary" : "bg-muted"
                    }`}
                  >
                    <Avatar c={preview} className="h-56 w-full" />
                    <span className="text-2xl font-bold">{g === "boy" ? "Menino" : "Menina"}</span>
                  </button>
                );
              })}
            </div>
          )}

          {category.groups.map((grp, i) => {
            if (grp.kind === "color")
              return (
                <div key={i} className="flex flex-wrap gap-3">
                  {grp.options.map((col) => (
                    <button
                      key={col}
                      onClick={() => apply({ ...c, [grp.key]: col })}
                      aria-label="cor"
                      className={`size-16 rounded-full border-4 border-card shadow-[0_5px_0_var(--color-border)] transition-transform ${
                        c[grp.key] === col ? "scale-110 ring-4 ring-primary-deep" : ""
                      }`}
                      style={{ background: `radial-gradient(circle at 35% 30%, #ffffffaa, transparent 45%), ${col}` }}
                    />
                  ))}
                </div>
              );
            if (grp.kind === "thumb")
              return (
                <div key={i} className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {grp.options.map((o) => (
                    <button
                      key={o}
                      onClick={() => apply({ ...c, [grp.key]: o })}
                      className={`aspect-square rounded-3xl p-1 transition-all ${
                        c[grp.key] === o ? "scale-105 bg-primary/40 ring-4 ring-primary" : "bg-muted"
                      }`}
                    >
                      <Avatar c={{ ...c, [grp.key]: o }} view={grp.view} className="h-full w-full" />
                    </button>
                  ))}
                </div>
              );
            return (
              <div key={i} className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {grp.options.map((a) => {
                  const on = c.accessories.includes(a);
                  return (
                    <button
                      key={a}
                      onClick={() =>
                        apply({ ...c, accessories: on ? c.accessories.filter((x) => x !== a) : [...c.accessories, a] })
                      }
                      className={`relative aspect-square rounded-3xl p-1 transition-all ${
                        on ? "scale-105 bg-primary/40 ring-4 ring-primary" : "bg-muted"
                      }`}
                    >
                      <Avatar c={{ ...c, accessories: [a] }} view={grp.view} className="h-full w-full" />
                      {on && (
                        <span className="absolute right-1 top-1 rounded-full bg-success p-1 text-success-foreground">
                          <Check className="size-5" strokeWidth={4} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <button
          className="btn-game btn-game-green mt-3 w-full"
          onClick={() => {
            sfx.cheer();
            onDone(c);
          }}
        >
          <Check className="size-9" strokeWidth={4} /> PRONTO!
        </button>
      </div>
    </div>
  );
}
