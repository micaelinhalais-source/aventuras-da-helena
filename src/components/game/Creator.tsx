import { useState } from "react";
import { Undo2, Check } from "lucide-react";
import { Avatar, type AvatarView } from "./Avatar";
import * as K from "@/game/character";
import type { Character, Accessory } from "@/game/character";
import { sfx } from "@/game/sound";
import { Button } from "@/components/ui/button";

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
  const [cat, setCat] = useState("who");
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

  const category = CATEGORIES.find((x) => x.id === cat) ?? CATEGORIES[0];

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-col gap-4 p-4 md:flex-row md:p-6">
      {/* Stage */}
      <div className="relative flex min-h-0 flex-[1.1] flex-col items-center justify-center">
        <div className="absolute bottom-[6%] h-[16%] w-[70%] rounded-[50%] bg-success/70 shadow-[inset_0_-10px_0_var(--color-success-deep)]" />
        <div key={bump} className="animate-bounce-soft relative h-[88%] max-h-[640px] w-full">
          <Avatar c={c} className="h-full w-full drop-shadow-xl" />
        </div>
        <div className="absolute left-0 top-0 flex gap-3">
          <Button variant="ghost" className="btn-round shrink-0 disabled:opacity-40 [&_svg]:size-8" onClick={undo} disabled={!history.length} aria-label="Voltar">
            <Undo2 className="size-8" strokeWidth={3} />
          </Button>
        </div>
      </div>

      {/* Panel */}
      <div className="panel flex min-h-0 flex-1 flex-col overflow-hidden p-4">
        <div className="flex shrink-0 gap-2 overflow-x-auto pb-3 pt-2">
          {CATEGORIES.map((x) => (
            <Button
              key={x.id}
              onClick={() => {
                setCat(x.id);
                sfx.tab();
              }}
              className={`flex h-auto shrink-0 flex-col items-center gap-0 rounded-2xl px-3 py-2 transition-all ${
                cat === x.id ? "scale-105 bg-primary text-primary-foreground shadow-[0_5px_0_var(--color-primary-deep)]" : "bg-muted"
              }`}
            >
              <span className="text-4xl leading-none">{x.icon}</span>
              <span className="mt-1 text-sm font-semibold">{x.label}</span>
            </Button>
          ))}
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-1 pb-2 pt-2">
          {cat === "who" && (
            <div className="grid grid-cols-2 gap-4">
              {(["boy", "girl"] as const).map((g) => {
                const preview = g === c.gender ? c : g === "boy" ? { ...K.DEFAULT_BOY, skin: c.skin, eyeColor: c.eyeColor } : { ...K.DEFAULT_GIRL, skin: c.skin, eyeColor: c.eyeColor };
                return (
                  <Button
                    key={g}
                    onClick={() => g !== c.gender && apply(preview)}
                    className={`flex h-auto flex-col items-center whitespace-normal rounded-3xl p-3 transition-all [&_svg]:h-56 [&_svg]:w-full ${
                      c.gender === g ? "bg-primary/40 ring-4 ring-primary" : "bg-muted"
                    }`}
                  >
                    <Avatar c={preview} className="h-56 w-full" />
                    <span className="text-2xl font-bold">{g === "boy" ? "Menino" : "Menina"}</span>
                  </Button>
                );
              })}
            </div>
          )}

          {category?.groups.map((grp, i) => {
            if (grp.kind === "color")
              return (
                <div key={i} className="flex flex-wrap gap-3">
                  {grp.options.map((col) => (
                    <Button
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
                    <Button
                      key={o}
                      aria-label={K.OPTION_NAMES[o] ?? o}
                      title={K.OPTION_NAMES[o] ?? o}
                      onClick={() => apply({ ...c, [grp.key]: o })}
                      className={`aspect-square h-auto min-w-0 rounded-3xl p-1 transition-all [&_svg]:size-full ${
                        c[grp.key] === o ? "scale-105 bg-primary/40 ring-4 ring-primary" : "bg-muted"
                      }`}
                    >
                      <Avatar c={{ ...c, [grp.key]: o }} view={grp.view} className="h-full w-full" />
                    </Button>
                  ))}
                </div>
              );
            return (
              <div key={i} className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {grp.options.map((a) => {
                  const on = c.accessories.includes(a);
                  return (
                    <Button
                      key={a}
                      aria-label={K.OPTION_NAMES[a] ?? a}
                      title={K.OPTION_NAMES[a] ?? a}
                      onClick={() =>
                        apply({ ...c, accessories: on ? c.accessories.filter((x) => x !== a) : [...c.accessories, a] })
                      }
                      className={`relative aspect-square h-auto min-w-0 rounded-3xl p-1 transition-all [&_svg]:size-full ${
                        on ? "scale-105 bg-primary/40 ring-4 ring-primary" : "bg-muted"
                      }`}
                    >
                       <Avatar c={{ ...c, accessories: [a] }} view={a === "backpack" || a === "scarf" ? "full" : grp.view} className="h-full w-full" />
                      {on && (
                        <span className="absolute right-1 top-1 rounded-full bg-success p-1 text-success-foreground">
                          <Check className="size-5" strokeWidth={4} />
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <Button
          className="btn-game btn-game-green mt-3 h-auto w-full shrink-0"
          onClick={() => {
            sfx.cheer();
            onDone(c);
          }}
        >
          <Check className="size-9" strokeWidth={4} /> PRONTO!
        </Button>
      </div>
    </div>
  );
}
