import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdventureTrack } from './AdventureTrack';
import { Avatar } from './Avatar';
import { CreativeBoard } from './CreativeBoard';
import type { Character } from '@/game/character';
import type { World } from '@/game/worlds';
import { createAdventureChallenge, createMemoryCards, isMemoryMatch, type AdventureId } from '@/game/adventure';
import { advanceShapeRun, applyShapeAnswer, freshShapeRun } from '@/game/shapes';
import { sfx, speak } from '@/game/sound';
import { GameIndicators } from './GameIndicators';
import { Encouragement } from './Encouragement';
import { nextEncouragement } from '@/game/encouragement';
const PHASE_NAMES: Record<AdventureId, string[]> = {
  numeros: ['Primeiras contagens', 'Frutas na trilha', 'As borboletas', 'Conte estrelas', 'Peixinhos', 'Mais figuras', 'Até sete', 'Até oito', 'Até nove', 'Conte até dez'],
  logica: ['Duplas', 'O que vem depois?', 'O diferente', 'Flores e frutas', 'Repita a sequência', 'Olhe com atenção', 'Novos padrões', 'Trilha dos símbolos', 'Encontre a diferença', 'Lógica campeã'],
  desafios: ['Junte as frutas', 'Frutas que saíram', 'Mais morangos', 'O que sobrou?', 'Somando na trilha', 'Tirando da cesta', 'Cesta cheia', 'Divirta-se contando', 'Últimos desafios', 'Chegada matemática'],
  memoria: ['Primeiros pares', 'Jardim de pares', 'Lembre das frutas', 'Bichinhos', 'Trilha das estrelas', 'Quatro pares', 'Memória na floresta', 'Novos amigos', 'Concentração', 'Campeã da memória'],
  ingles: ['Hello!', 'Animais', 'Pequenas palavras', 'Na natureza', 'Olhe e descubra', 'Palavras amigas', 'Novos nomes', 'Pelo mundo', 'Lembre em inglês', 'Great job!'],
  palavras: ['Primeiras letras', 'Letras dos bichos', 'No jardim', 'Qual está faltando?', 'Palavras amigas', 'Complete a trilha', 'Mais letras', 'Descobertas', 'Quase lá', 'Palavras completas'],
  ligar: ['Uma casinha', 'Trilha de pontos', 'De um a seis', 'Siga os números', 'Novo caminho', 'Junte os pontos', 'Desenho na pista', 'Número por número', 'Quase chegando', 'Casa completa'],
  pintar: ['Flor colorida', 'Jardim rosa', 'Cores do sol', 'Folhas verdes', 'Céu azul', 'Misture as cores', 'Meu jardim', 'Flor de aventura', 'Arco de cores', 'Artista da trilha'],
  'quebra-cabeca': ['Monte a casa', 'Uma flor', 'Barquinho', 'Casa na trilha', 'Jardim em peças', 'Vamos navegar', 'Peças amigas', 'Uma nova flor', 'Barco de aventura', 'Última montagem'],
};
export function AdventureWorld({ world, character, completed, points, onBack, onComplete }: { world: World & { id: AdventureId }; character: Character; completed: number; points: number; onBack: () => void; onComplete: (level: number) => void }) {
  const [level, setLevel] = useState<number | null>(null);
  const [run, setRun] = useState(freshShapeRun);
  const [challenge, setChallenge] = useState(() => createAdventureChallenge(world.id, 0));
  const [feedback, setFeedback] = useState('');
  const [celebration, setCelebration] = useState('');
  const [generation, setGeneration] = useState(0);
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [counted, setCounted] = useState<number[]>([]);
  const creative = world.id === 'ligar' || world.id === 'pintar' || world.id === 'quebra-cabeca';
  const prompt = world.id === 'memoria' ? 'Encontre todos os pares!' : world.id === 'ligar' ? 'Ligue os números de 1 a 6!' : world.id === 'pintar' ? 'Pinte todas as pétalas!' : world.id === 'quebra-cabeca' ? 'Monte a imagem!' : challenge.prompt;
  useEffect(() => { if (level !== null) speak(prompt); return () => window.speechSynthesis?.cancel(); }, [prompt, level, generation]);
  useEffect(() => {
    if (flipped.length !== 2) return;
    const [a, b] = flipped;
    if (a === undefined || b === undefined) return;
    const timer = window.setTimeout(() => {
      if (isMemoryMatch(cards, a, b)) {
        const next = [...matched, a, b]; setMatched(next); sfx.pop();
        if (next.length === cards.length) success();
      } else mistake();
      setFlipped([]);
    }, 850);
    return () => window.clearTimeout(timer);
    // Pair resolution owns a single cancellable timer per pair.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped, cards]);
  function reset(index: number) {
    setChallenge(createAdventureChallenge(world.id, index, challenge.fingerprint));
    setCards(createMemoryCards(index)); setFlipped([]); setMatched([]); setCounted([]); setFeedback(''); setCelebration(''); setGeneration(value => value + 1);
  }
  function open(index: number) { setLevel(index); setRun(freshShapeRun()); reset(index); sfx.tab(); }
  function success() { if (run.status !== 'playing') return; const message = nextEncouragement(); setRun(applyShapeAnswer(run, true)); setFeedback(''); setCelebration(message); sfx.cheer(); speak(message); }
  function mistake() { if (run.status !== 'playing') return; const next = applyShapeAnswer(run, false); setRun(next); setFeedback(next.status === 'lost' ? 'Vamos tentar esta fase de novo!' : 'Tente outra vez!'); sfx.tab(); }
  function next() { if (level === null || run.status !== 'correct') return; const updated = advanceShapeRun(run); setRun(updated); if (updated.status === 'complete') { onComplete(level); speak(celebration); } else reset(level); }
  if (level === null) return <section className="mx-auto min-h-dvh max-w-5xl px-4 py-5 sm:px-8"><GameIndicators points={points} completed={completed} total={10} /><header className="mt-4 flex items-center justify-between gap-3"><Button variant="ghost" className="size-14 shrink-0 rounded-full bg-card" title="Voltar aos mundos" aria-label="Voltar aos mundos" onClick={onBack}><ArrowLeft /></Button><h1 className="text-center text-3xl font-bold">Pista · {world.name}</h1><span className="shrink-0 text-xl font-semibold">{completed}/10</span></header><AdventureTrack character={character} label={`Fases de ${world.name}`} stops={(PHASE_NAMES[world.id]).map((name, index) => ({ id: String(index), name: `Fase ${index + 1}: ${name}`, emoji: world.emoji, done: index < completed, locked: index > completed }))} onOpen={open} /></section>;
  return <section className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-5 p-4 sm:p-6"><GameIndicators points={points} hearts={run.hearts} completed={completed} total={10} /><header className="flex items-center justify-between gap-3"><Button variant="ghost" aria-label="Voltar à pista" title="Voltar à pista" className="size-14 shrink-0 rounded-full bg-card" onClick={() => { setLevel(null); setFlipped([]); }}><ArrowLeft /></Button><h1 className="text-center text-2xl font-bold sm:text-4xl">{world.name} · Fase {level + 1}</h1><Button variant="ghost" aria-label="Ouvir" title="Ouvir" className="size-14 shrink-0 rounded-full bg-card" onClick={() => speak(prompt)}><Volume2 /></Button></header><div className="flex items-center justify-between"><span className="rounded-full bg-card px-4 py-1 text-2xl font-bold shadow-md">{run.status === 'complete' ? 3 : run.round + 1} / 3</span></div>
    {run.status === 'complete' || run.status === 'lost' ? <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center"><span className="text-7xl">{run.status === 'complete' ? '🏆' : '💛'}</span><Avatar c={character} className="h-48 w-32" /><h2 className="text-3xl font-bold">{run.status === 'complete' ? 'Fase concluída!' : 'Vamos começar de novo!'}</h2>{run.status === 'complete' && <Encouragement message={celebration} />}<div className="flex flex-wrap justify-center gap-4">{run.status === 'lost' ? <Button className="btn-game h-auto text-xl" onClick={() => open(level)}><RotateCcw />Reiniciar fase</Button> : <>{level < 9 && <Button className="btn-game h-auto text-xl" onClick={() => open(level + 1)}>Próxima fase<ArrowRight /></Button>}<Button variant="secondary" className="h-14 text-xl" onClick={() => setLevel(null)}>Voltar à pista</Button></>}</div></div> : <><h2 className="panel mx-auto px-6 py-3 text-center text-2xl font-bold sm:text-4xl">{prompt}</h2>
    {creative ? <CreativeBoard key={generation} mode={world.id as 'ligar' | 'pintar' | 'quebra-cabeca'} level={level + run.round} disabled={run.status !== 'playing'} onSuccess={success} onMistake={mistake} /> : world.id === 'memoria' ? <div className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4" aria-label="Cartas de memória">{cards.map((card, index) => { const visible = flipped.includes(index) || matched.includes(index); return <Button key={index} aria-label={`Carta ${index + 1}${visible ? `: ${card}` : ''}`} disabled={run.status !== 'playing' || flipped.length === 2 || matched.includes(index)} className={`track-stop aspect-square h-auto rounded-3xl border-4 border-card text-6xl sm:text-7xl ${visible ? 'bg-card text-foreground' : 'bg-accent text-accent-foreground'}`} onClick={() => { if (!flipped.includes(index)) setFlipped([...flipped, index]); }}>{visible ? card : '❔'}</Button>; })}</div> : <>
      <div className="counting-field mx-auto flex min-h-48 w-full max-w-3xl flex-wrap items-center justify-center gap-4 rounded-3xl p-6 text-center text-5xl leading-relaxed sm:min-h-64 sm:text-7xl">{world.id === 'numeros' ? Array.from({ length: challenge.count ?? 1 }, (_, index) => <Button variant="ghost" key={index} aria-label={`Figura ${index + 1}`} aria-pressed={counted.includes(index)} disabled={run.status !== 'playing'} className={`relative size-24 text-6xl sm:size-28 sm:text-7xl ${counted.includes(index) ? 'bg-primary/40' : ''}`} onClick={() => { if (counted.includes(index)) return; const next = [...counted, index]; setCounted(next); speak(String(next.length)); }}>{challenge.display.split(' ')[0]}{counted.includes(index) && <span className="absolute right-0 top-0 text-lg">{counted.indexOf(index) + 1}</span>}</Button>) : challenge.display}</div>
      <div className="mx-auto grid w-full max-w-3xl grid-cols-3 gap-4" aria-label="Respostas">{challenge.options.map(option => <Button key={option.id} disabled={run.status !== 'playing'} aria-label={`Resposta ${option.label}`} className="track-stop min-h-28 h-auto whitespace-normal break-words rounded-3xl border-4 border-card px-2 text-3xl sm:min-h-36 sm:text-5xl" onClick={() => option.id === challenge.answer ? success() : mistake()}>{option.label}</Button>)}</div></>}
      <div className="flex min-h-28 flex-col items-center justify-center gap-4 pb-4">{run.status === 'correct' ? <Encouragement message={celebration} /> : <p role="status" className="text-xl font-semibold">{feedback}</p>}{run.status === 'correct' && <Button className="btn-game btn-game-green h-auto text-xl" onClick={next}>{run.round === 2 ? 'Concluir fase' : 'Próxima'}<ArrowRight /></Button>}</div>
    </>}
  </section>;
}
