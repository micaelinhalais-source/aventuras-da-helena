import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Volume2, Pencil, Lock, Sparkles } from "lucide-react";
import { Avatar } from "@/components/game/Avatar";
import { Creator } from "@/components/game/Creator";
import { Scenery } from "@/components/game/Scenery";
import { DEFAULT_BOY, loadCharacter, saveCharacter, type Character } from "@/game/character";
import { WORLDS } from "@/game/worlds";
import { sfx, speak } from "@/game/sound";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "As Aventuras da Helena — Jogo educativo infantil" },
      { name: "description", content: "Crie seu personagem e comece uma aventura de números, formas, lógica e memória." },
      { property: "og:title", content: "As Aventuras da Helena" },
      { property: "og:description", content: "Jogo educativo para crianças de 5 anos, feito para o iPad." },
    ],
  }),
  component: Game,
});

type Screen = "loading" | "welcome" | "creator" | "done" | "hub";

const MSG_WELCOME = "Olá, pequeno aventureiro! Que bom ter você aqui! Antes de começarmos nossa aventura, vamos criar seu personagem?";
const MSG_DONE = "Uau! Você ficou incrível! Nossa aventura está prestes a começar!";

function SpeakButton({ text }: { text: string }) {
  return (
    <button className="btn-round" aria-label="Ouvir" onClick={() => speak(text)}>
      <Volume2 className="size-8" strokeWidth={3} />
    </button>
  );
}

function Game() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    const saved = loadCharacter();
    setCharacter(saved);
    setScreen(saved ? "hub" : "welcome");
  }, []);

  return (
    <main className="relative min-h-dvh overflow-hidden font-display">
      <Scenery />

      {screen === "welcome" && (
        <section className="flex min-h-dvh flex-col items-center justify-center gap-8 p-6 text-center">
          <div className="animate-float text-[7rem] leading-none">⭐</div>
          <h1 className="animate-pop text-game-shadow text-6xl font-bold text-card md:text-7xl">As Aventuras da Helena</h1>
          <div className="panel animate-pop flex max-w-2xl items-center gap-4 p-6 text-left [animation-delay:150ms]">
            <p className="text-2xl font-medium leading-snug md:text-3xl">
              Olá, pequeno aventureiro!{"\n"}Você está pronto pra mais uma aventura?Vamos criar seu personagem?
            </p>
            <SpeakButton text={MSG_WELCOME} />
          </div>
          <button
            className="btn-game animate-pop text-3xl [animation-delay:300ms]"
            onClick={() => {
              sfx.cheer();
              setScreen("creator");
            }}
          >
            <Sparkles className="size-9" strokeWidth={3} />CRIAR PERSONAGEM
          </button>
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
          <button
            className="btn-game btn-game-coral animate-pop relative text-3xl [animation-delay:400ms]"
            onClick={() => {
              sfx.cheer();
              setScreen("hub");
            }}
          >
            🚀 COMEÇAR A AVENTURA!
          </button>
        </section>
      )}

      {screen === "hub" && character && (
        <section className="flex min-h-dvh flex-col items-center gap-6 p-6 md:flex-row md:justify-center md:gap-10">
          <div className="flex flex-col items-center gap-4">
            <div className="h-[46vh] w-64 md:h-[60vh] md:w-80">
              <Avatar c={character} className="animate-float h-full w-full drop-shadow-2xl" />
            </div>
            <button
              className="btn-game text-2xl"
              onClick={() => {
                sfx.tab();
                setScreen("creator");
              }}
            >
              <Pencil className="size-7" strokeWidth={3} /> Mudar visual
            </button>
          </div>
          <div className="grid w-full max-w-xl grid-cols-2 gap-5 sm:grid-cols-3">
            {WORLDS.map((w, i) => (
              <button
                key={w.id}
                onClick={() => {
                  sfx.tab();
                  speak(`Mundo ${w.name}. Em breve!`);
                }}
                className="animate-pop relative flex aspect-square flex-col items-center justify-center rounded-[2.5rem] border-4 border-card shadow-[0_10px_0_oklch(0_0_0/0.15)] active:translate-y-1"
                style={{ background: `radial-gradient(circle at 35% 25%, #ffffff88, transparent 50%), ${w.color}`, animationDelay: `${i * 80}ms` }}
              >
                <span className="text-6xl">{w.emoji}</span>
                <span className="mt-2 text-xl font-bold text-card [text-shadow:0_2px_0_oklch(0_0_0/0.25)]">{w.name}</span>
                {!w.available && (
                  <span className="absolute right-2 top-2 rounded-full bg-card p-2 text-muted-foreground">
                    <Lock className="size-5" strokeWidth={3} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
