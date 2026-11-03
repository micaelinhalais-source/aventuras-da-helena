import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, Star, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/game/Avatar";
import type { Character } from "@/game/character";
import { createCountingRounds, isCountingAnswer } from "@/game/numbers";
import { sfx, speak } from "@/game/sound";

export function NumbersActivity({ character, onBack, onComplete }: {
  character: Character;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [rounds, setRounds] = useState(() => createCountingRounds());
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(false);
  const [wrong, setWrong] = useState<number | null>(null);
  const [counted, setCounted] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const round = rounds[index];
  const prompt = `Quantas ${round.noun} você vê?`;

  useEffect(() => {
    speak(finished ? "Você contou de um a cinco! Ganhou uma estrela!" : prompt);
    return () => { window.speechSynthesis?.cancel(); };
  }, [prompt, finished]);

  function answer(value: number) {
    if (correct) return;
    if (isCountingAnswer(round, value)) {
      setCorrect(true);
      setWrong(null);
      sfx.cheer();
      speak(`Isso mesmo! ${round.count}! Muito bem!`);
    } else {
      setWrong(value);
      sfx.tab();
      speak("Vamos contar juntos? Tente mais uma vez!");
    }
  }

  function next() {
    if (!correct) return;
    if (index === rounds.length - 1) {
      onComplete();
      setFinished(true);
      sfx.cheer();
    } else {
      setIndex(index + 1);
      setCorrect(false);
      setWrong(null);
      setCounted([]);
    }
  }

  function restart() {
    setRounds(createCountingRounds());
    setIndex(0);
    setCorrect(false);
    setWrong(null);
    setCounted([]);
    setFinished(false);
  }

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-6 p-4 sm:p-8">
      <header className="flex items-center justify-between gap-3">
        <Button variant="ghost" className="btn-round shrink-0" aria-label="Voltar aos mundos" title="Voltar aos mundos" onClick={onBack}><ArrowLeft /></Button>
        <h1 className="text-3xl font-bold sm:text-4xl">Números</h1>
        <Button variant="ghost" className="btn-round shrink-0" aria-label="Ouvir" title="Ouvir" onClick={() => speak(finished ? "Você contou de um a cinco! Ganhou uma estrela!" : prompt)}><Volume2 /></Button>
      </header>

      {finished ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-7 py-6 text-center">
          <Star className="animate-pop size-28 fill-primary text-primary-deep" aria-hidden />
          <Avatar c={character} className="h-64 w-52 animate-float" />
          <h2 className="text-4xl font-bold">Você conseguiu!</h2>
          <p className="text-2xl">Uma estrela para você! ⭐</p>
          <div className="flex flex-wrap justify-center gap-5">
            <Button className="btn-game h-auto whitespace-normal text-xl" onClick={restart}><RotateCcw /> Jogar de novo</Button>
            <Button className="btn-game btn-game-coral h-auto whitespace-normal text-xl" onClick={onBack}><ArrowLeft /> Mundos</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-center gap-3" aria-label={`Rodada ${index + 1} de ${rounds.length}`}>
            {rounds.map((_, i) => <Star key={i} aria-hidden className={`size-8 ${i < index || (i === index && correct) ? "fill-primary text-primary-deep" : "text-muted-foreground"}`} />)}
          </div>
          <h2 className="text-center text-3xl font-semibold sm:text-4xl">{prompt}</h2>
          <div className="counting-field flex min-h-64 flex-1 flex-wrap content-center items-center justify-center gap-5 rounded-3xl border-4 border-card p-5 sm:gap-8" aria-label={`${round.count} ${round.noun}`}>
            {Array.from({ length: round.count }, (_, i) => (
              <Button key={`${index}-${i}`} variant="ghost" aria-label={`${round.noun}, figura ${i + 1}`} aria-pressed={counted.includes(i)} className={`relative h-28 w-28 rounded-2xl border-4 text-6xl sm:h-36 sm:w-36 sm:text-7xl ${counted.includes(i) ? "border-primary bg-card/80" : "border-transparent hover:bg-card/50"}`} onClick={() => {
                if (correct || counted.includes(i)) return;
                const updated = [...counted, i];
                setCounted(updated);
                sfx.pop();
                speak(String(updated.length));
              }}>
                <span aria-hidden>{round.emoji}</span>
                {counted.includes(i) && <span className="absolute -right-2 -top-2 flex size-9 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">{counted.indexOf(i) + 1}</span>}
              </Button>
            ))}
          </div>
          <div className="flex justify-center gap-4 sm:gap-8" aria-label="Respostas">
            {round.options.map(value => <Button key={value} disabled={correct} aria-label={`Número ${value}`} aria-pressed={correct && value === round.count} className={`btn-game h-24 w-24 p-0 text-5xl sm:h-28 sm:w-28 ${correct && value === round.count ? "btn-game-green" : wrong === value ? "btn-game-coral" : ""}`} onClick={() => answer(value)}>{value}</Button>)}
          </div>
          <div className="flex min-h-32 flex-col items-center justify-center gap-3 pb-3 text-center">
            <p className="text-2xl font-semibold" role="status" aria-live="polite">{correct ? `Isso mesmo! ${round.count}! 🎉` : wrong !== null ? "Vamos contar? Tente outra vez!" : ""}</p>
            {correct && <Button className="btn-game btn-game-green h-auto text-xl" onClick={next}>{index === rounds.length - 1 ? "Concluir" : "Próxima"}<ArrowRight /></Button>}
          </div>
        </>
      )}
    </section>
  );
}