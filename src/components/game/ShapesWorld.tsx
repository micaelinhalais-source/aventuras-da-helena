import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Heart, Lock, RotateCcw, Trophy, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/game/Avatar";
import { ShapePicture } from "@/components/game/ShapePicture";
import type { Character } from "@/game/character";
import { SHAPE_LEVELS, SHAPE_NAMES, SHAPE_ROUNDS, advanceShapeRun, applyShapeAnswer, checkShapeAnswer, createShapeChallenge, freshShapeRun } from "@/game/shapes";
import { sfx, speak } from "@/game/sound";

export function ShapesWorld({ character, completed, onComplete, onBack }: { character: Character; completed: number; onComplete: (level: number) => void; onBack: () => void }) {
  const [level, setLevel] = useState<number | null>(null);
  const [challenge, setChallenge] = useState(() => createShapeChallenge(0));
  const [run, setRun] = useState(freshShapeRun);
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [remembering, setRemembering] = useState(false);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    if (level === null) return;
    speak(challenge.mode === "memory" ? "Olhe bem para esta forma!" : challenge.prompt);
    setRemembering(challenge.mode === "memory");
    setReveal(false);
    const timer = window.setTimeout(() => { setRemembering(false); if (challenge.mode === "memory") speak(challenge.prompt); }, 3000);
    return () => { window.clearTimeout(timer); window.speechSynthesis?.cancel(); };
  }, [challenge, level]);

  function open(index: number) {
    setLevel(index);
    setRun(freshShapeRun());
    setSelected([]);
    setFeedback("");
    setChallenge(createShapeChallenge(index, challenge.fingerprint));
    sfx.tab();
  }
  function newQuestion() {
    if (level === null) return;
    setSelected([]);
    setFeedback("");
    setChallenge(createShapeChallenge(level, challenge.fingerprint));
  }
  function submit(ids: string[]) {
    if (remembering || run.status !== "playing") return;
    const correct = checkShapeAnswer(challenge, ids);
    const updated = applyShapeAnswer(run, correct);
    setRun(updated);
    if (correct) { setFeedback("Muito bem! 🎉"); sfx.cheer(); speak("Muito bem! Você acertou!"); }
    else {
      setSelected([]);
      setFeedback(updated.status === "lost" ? "Vamos começar esta fase de novo!" : "Quase! Vamos tentar outra vez?");
      sfx.tab();
      speak(updated.status === "lost" ? "Os corações acabaram. Vamos começar esta fase de novo!" : "Quase! Vamos tentar outra vez?");
    }
  }
  function choose(id: string) {
    if (run.status !== "playing" || remembering) return;
    if (challenge.mode === "collect" || challenge.mode === "sort") {
      setSelected(selected.includes(id) ? selected.filter(value => value !== id) : [...selected, id]);
      sfx.pop();
    } else { setSelected([id]); submit([id]); }
  }
  function next() {
    const updated = advanceShapeRun(run);
    setRun(updated);
    if (updated.status === "complete" && level !== null) { onComplete(level); speak("Fase concluída! Você avançou na pista!"); }
    else newQuestion();
  }
  function backToTrack() { setLevel(null); sfx.back(); window.speechSynthesis?.cancel(); }

  if (level === null) return (
    <section className="mx-auto min-h-dvh max-w-5xl px-4 py-5 sm:px-8">
      <header className="flex items-center justify-between gap-4">
        <Button variant="ghost" className="h-14 w-14 rounded-full bg-card" aria-label="Voltar aos mundos" onClick={onBack}><ArrowLeft /></Button>
        <h1 className="text-center text-3xl font-bold sm:text-4xl">Pista das Formas</h1>
        <span className="flex items-center gap-2 text-xl font-semibold"><Trophy className="text-primary-deep" />{completed}/10</span>
      </header>
      <div className="mt-5 flex items-center justify-center gap-5">
        <Avatar c={character} className="h-28 w-20" />
        <p className="text-2xl font-bold">{completed >= 10 ? "Você chegou! 🏁" : "Vamos para a próxima fase!"}</p>
      </div>
      <div className="shape-track relative mx-auto my-6 max-w-2xl px-5 py-8 sm:px-10">
        <div className="track-lane" aria-hidden />
        <ol className="relative grid grid-cols-2 gap-x-8 gap-y-9 sm:gap-x-20">
          {SHAPE_LEVELS.map((item, i) => {
            const done = i < completed;
            const unlocked = i <= completed;
            const column = Math.floor(i / 2) % 2 === 0 ? i % 2 : 1 - i % 2;
            return <li key={item.mode} className={`flex flex-col items-center gap-3 text-center ${column === 0 ? "col-start-1" : "col-start-2"}`} style={{ gridRow: Math.floor(i / 2) + 1 }}>
              <Button disabled={!unlocked} aria-label={`Fase ${i + 1}: ${item.name}`} onClick={() => open(i)} className={`relative h-24 w-24 rounded-full border-4 border-card text-4xl shadow-lg sm:h-28 sm:w-28 ${done ? "bg-success text-success-foreground" : unlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                <span aria-hidden>{item.icon}</span>
                <span className="absolute -bottom-3 flex h-8 min-w-8 items-center justify-center rounded-full bg-card px-2 text-lg font-bold text-foreground">{done ? <Check /> : unlocked ? i + 1 : <Lock />}</span>
              </Button>
              <span className="max-w-44 rounded-lg bg-card/95 px-2 py-1 text-lg font-semibold">{item.name}</span>
            </li>;
          })}
        </ol>
      </div>
    </section>
  );

  const multi = challenge.mode === "collect" || challenge.mode === "sort";
  const info = SHAPE_LEVELS[level];
  return (
    <section className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-5 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3">
        <Button variant="ghost" className="h-14 w-14 shrink-0 rounded-full bg-card" aria-label="Voltar à pista" onClick={backToTrack}><ArrowLeft /></Button>
        <h1 className="text-center text-2xl font-bold">Fase {level + 1} · {info?.name}</h1>
        <Button variant="ghost" className="h-14 w-14 shrink-0 rounded-full bg-card" aria-label="Ouvir" onClick={() => speak(challenge.prompt)}><Volume2 /></Button>
      </header>
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">{run.status === "complete" ? SHAPE_ROUNDS : run.round + 1} / {SHAPE_ROUNDS}</span>
        <div className="flex gap-2" aria-label={`${run.hearts} corações`}>
          {[0, 1, 2].map(i => <Heart key={i} aria-hidden className={`size-8 ${i < run.hearts ? "fill-secondary text-secondary-deep" : "text-muted-foreground"}`} />)}
        </div>
      </div>
      {run.status === "lost" || run.status === "complete" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-12 text-center">
          <span className="text-7xl" aria-hidden>{run.status === "complete" ? "🏆" : "💛"}</span>
          <Avatar c={character} className="h-48 w-36" />
          <h2 className="text-3xl font-bold">{run.status === "complete" ? "Fase concluída!" : "Vamos começar esta fase de novo!"}</h2>
          {run.status === "lost" ? <Button className="btn-game h-auto whitespace-normal text-xl" onClick={() => open(level)}><RotateCcw /> Reiniciar fase</Button> : <div className="flex flex-wrap justify-center gap-4">
            {level < 9 && <Button className="btn-game h-auto text-xl" onClick={() => open(level + 1)}>Próxima fase <ArrowRight /></Button>}
            <Button variant="secondary" className="h-14 text-xl" onClick={backToTrack}>Voltar à pista</Button>
          </div>}
        </div>
      ) : (
        <>
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">{remembering ? "Olhe e lembre!" : challenge.prompt}</h2>
          <div className="flex min-h-28 items-center justify-center gap-3">
            {challenge.mode === "shadow" && <div className="h-28 w-28"><ShapePicture shape={challenge.target} shadow /></div>}
            {challenge.mode === "objects" && <span className="text-8xl" aria-hidden>{challenge.object}</span>}
            {challenge.mode === "pattern" && <div className="flex items-center gap-1 sm:gap-3">{challenge.sequence.map((shape, i) => <div className="h-12 w-12 sm:h-16 sm:w-16" key={i}><ShapePicture shape={shape} /></div>)}<span className="text-4xl">?</span></div>}
            {challenge.mode === "memory" && (remembering || reveal ? <div className="h-28 w-28"><ShapePicture shape={challenge.target} /></div> : <Button variant="outline" className="h-14 text-lg" onClick={() => { setReveal(true); window.setTimeout(() => setReveal(false), 2000); }}>Ver novamente</Button>)}
            {!["shadow", "objects", "pattern", "memory"].includes(challenge.mode) && <span className="text-6xl" aria-hidden>{info?.icon}</span>}
          </div>
          <div className={`mx-auto grid w-full max-w-3xl gap-4 sm:gap-6 ${challenge.options.length > 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-3"}`} aria-label="Opções de formas">
            {challenge.options.map((option, i) => <Button key={option.id} variant="outline" disabled={remembering || run.status !== "playing"} aria-label={`Opção ${i + 1}: ${SHAPE_NAMES[option.shape]}`} aria-pressed={selected.includes(option.id)} onClick={() => choose(option.id)} className={`relative aspect-square h-auto min-w-0 rounded-lg border-4 p-1 sm:p-3 [&_svg]:size-full ${selected.includes(option.id) ? "border-primary bg-card" : "border-card bg-card/90"}`}>
              <ShapePicture shape={option.shape} color={option.color} size={option.size} />
              {selected.includes(option.id) && multi && <span className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{challenge.mode === "sort" ? selected.indexOf(option.id) + 1 : <Check />}</span>}
            </Button>)}
          </div>
          <div className="flex min-h-32 flex-col items-center justify-center gap-4 text-center">
            <p role="status" aria-live="polite" className="text-xl font-semibold">{feedback}</p>
            {run.status === "correct" ? <Button className="btn-game btn-game-green h-auto text-xl" onClick={next}>{run.round === SHAPE_ROUNDS - 1 ? "Concluir fase" : "Próxima"}<ArrowRight /></Button> : multi && <Button disabled={selected.length === 0 || (challenge.mode === "sort" && selected.length < 3)} className="btn-game h-auto text-xl" onClick={() => submit(selected)}><Check /> Conferir</Button>}
          </div>
        </>
      )}
    </section>
  );
}