import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Volume2, Pencil, Home, Sparkles, Play } from "lucide-react";
import { Avatar } from "@/components/game/Avatar";
import { Creator } from "@/components/game/Creator";
import { Scenery } from "@/components/game/Scenery";
import { AdventureWorld } from "@/components/game/AdventureWorld";
import { AdventureTrack } from "@/components/game/AdventureTrack";
import type { AdventureId } from "@/game/adventure";
import { ShapesWorld } from "@/components/game/ShapesWorld";
import { Button } from "@/components/ui/button";
import { DEFAULT_BOY, loadCharacter, saveCharacter, type Character } from "@/game/character";
import { WORLDS, loadProgress, saveProgress, type Progress } from "@/game/worlds";
import { sfx, speak } from "@/game/sound";
import helenaIcon from "@/assets/helena-icon.png.asset.json";
import { GameIndicators } from '@/components/game/GameIndicators';
import { adventureTotals, worldMapStops } from '@/game/map';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "As Aventuras da Helena — Jogo educativo infantil" },
      { name: "description", content: "Crie sua aventureira e explore dez mundos educativos em pistas de números, formas, inglês, palavras, pintura e quebra-cabeça." },
      { property: "og:title", content: "As Aventuras da Helena" },
      { property: "og:description", content: "Jogo educativo para crianças de 5 anos, feito para o iPad." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Game,
});

type Screen = "loading" | "welcome" | "creator" | "done" | "hub" | "shapes" | AdventureId;

const MSG_WELCOME = "Olá, pequeno aventureiro! Que bom ter você aqui! Antes de começarmos nossa aventura, vamos criar seu personagem?";
const MSG_DONE = "Uau! Você ficou incrível! Nossa aventura está prestes a começar!";

function SpeakButton({ text }: { text: string }) {
  return (
    <Button variant="ghost" className="btn-round" aria-label="Ouvir" onClick={() => speak(text)}>
      <Volume2 className="size-8" strokeWidth={3} />
    </Button>
  );
}

function Game() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [character, setCharacter] = useState<Character | null>(null);
  const [progress, setProgress] = useState<Progress>({});
  const totals = adventureTotals(progress);

  useEffect(() => {
    const saved = loadCharacter();
    setCharacter(saved);
    setProgress(loadProgress());
    setScreen(saved ? "hub" : "welcome");
  }, []);

  return (
    <main className="relative min-h-dvh font-display">
      <Scenery />
      {screen !== "loading" && screen !== "welcome" && <div className="flex justify-end px-4 pt-3"><Button variant="ghost" className="size-12 rounded-full bg-accent text-accent-foreground shadow-lg" aria-label="Tela inicial" title="Tela inicial" onClick={() => { window.speechSynthesis?.cancel(); sfx.back(); setScreen("welcome"); }}><Home className="size-6" /></Button></div>}

      {screen === "welcome" && (
        <section className="flex min-h-dvh flex-col items-center justify-center gap-8 p-6 text-center">
          <img
            src={helenaIcon.url}
            alt="As Aventuras da Helena"
            className="animate-float w-60 max-w-[70vw] drop-shadow-2xl md:w-72"
          />
          <h1 className="animate-pop text-title-shadow text-4xl font-bold text-title-rose sm:text-6xl md:text-7xl">As Aventuras da Helena</h1>
          <div className="panel animate-pop flex max-w-2xl items-center gap-4 p-6 text-left [animation-delay:150ms]">
            <p className="text-2xl font-medium leading-snug md:text-3xl">
              Olá, pequeno aventureiro!{"\n"}Você está pronto pra mais uma aventura?Vamos criar seu personagem?
            </p>
            <SpeakButton text={MSG_WELCOME} />
          </div>
          {character && <Button className="btn-game btn-game-green h-auto whitespace-normal text-2xl" onClick={() => { sfx.cheer(); setScreen("hub"); }}><Play /> CONTINUAR A AVENTURA</Button>}
          <Button
            className="btn-game animate-pop h-auto whitespace-normal text-2xl [animation-delay:300ms]"
            onClick={() => {
              sfx.cheer();
              setScreen("creator");
            }}
          >
            <Sparkles className="size-9" strokeWidth={3} />CRIAR PERSONAGEM
          </Button>
        </section>
      )}

      {screen === "creator" && (
        <Creator
          initial={character ?? DEFAULT_BOY}
          onDone={(c) => {
            saveCharacter(c);
            setCharacter(c);
            setScreen("done");
            speak(MSG_DONE);
          }}
        />
      )}

      {screen === "done" && character && (
        <section className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="animate-spin-slow size-[110vmin] rounded-full opacity-40" style={{ background: "repeating-conic-gradient(var(--color-primary) 0 10deg, transparent 10deg 20deg)" }} />
          </div>
          <div className="animate-pop relative h-[52vh] w-full max-w-md">
            <Avatar c={character} className="animate-float h-full w-full drop-shadow-2xl" />
          </div>
          <div className="panel animate-pop relative flex max-w-2xl items-center gap-4 p-6 [animation-delay:200ms]">
            <p className="text-3xl font-semibold">Uau! Você ficou incrível! 🎉</p>
            <SpeakButton text={MSG_DONE} />
          </div>
          <Button
            className="btn-game btn-game-coral animate-pop relative h-auto whitespace-normal text-2xl [animation-delay:400ms]"
            onClick={() => {
              sfx.cheer();
              setScreen("hub");
            }}
          >
            🚀 COMEÇAR A AVENTURA!
          </Button>
        </section>
      )}

      {screen === "hub" && character && (
        <section className="mx-auto flex min-h-dvh max-w-4xl flex-col items-center px-4 pb-6">
          <GameIndicators points={totals.points} completed={totals.completed} total={100} />
          <h1 className="text-center text-3xl font-bold text-title-rose sm:text-4xl">As Aventuras da Helena</h1>
          <div className="mt-4 flex items-center justify-center gap-5">
            <Avatar c={character} className="h-32 w-20" />
            <Button
              className="btn-game h-auto px-5 text-xl"
              onClick={() => {
                sfx.tab();
                setScreen("creator");
              }}
            >
              <Pencil className="size-7" strokeWidth={3} /> Mudar visual
            </Button>
          </div>
          <AdventureTrack character={character} label="Pista dos dez mundos" stops={worldMapStops(progress)} onOpen={index => { const world = WORLDS[index]; if (!world) return; sfx.tab(); setScreen(world.id === "formas" ? "shapes" : world.id); }} />
        </section>
      )}
      {character && WORLDS.filter(world => world.id !== "formas" && world.id === screen).map(world => <AdventureWorld key={world.id} world={{ ...world, id: world.id as AdventureId }} character={character} points={totals.points} completed={Math.min(10, Math.max(0, progress[world.id]?.completedLevels ?? 0))} onBack={() => { sfx.back(); setScreen("hub"); }} onComplete={level => { const completedLevels = Math.max(progress[world.id]?.completedLevels ?? 0, level + 1); const updated = { ...progress, [world.id]: { ...progress[world.id], stars: Math.max(completedLevels, progress[world.id]?.stars ?? 0), completedLevels } }; saveProgress(updated); setProgress(updated); }} />)}
      {screen === "shapes" && character && <ShapesWorld character={character} points={totals.points} completed={Math.min(10, Math.max(0, progress.formas?.completedLevels ?? 0))} onBack={() => setScreen("hub")} onComplete={(level) => {
        const completedLevels = Math.max(progress.formas?.completedLevels ?? 0, level + 1);
        const updated = { ...progress, formas: { ...progress.formas, stars: completedLevels, completedLevels } };
        saveProgress(updated);
        setProgress(updated);
      }} />}
    </main>
  );
}
