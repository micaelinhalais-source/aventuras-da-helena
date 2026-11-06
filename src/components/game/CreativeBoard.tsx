import { useState } from 'react';
import { RotateCcw, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PAINT_COLORS, type PaintColor, paintComplete, puzzleSolved, createPuzzle, isNextDot } from '@/game/adventure';
import { sfx, speak } from '@/game/sound';
const COLOR_NAMES = { rose: 'Rosa', sun: 'Amarelo', leaf: 'Verde', ocean: 'Azul' };
const DOT_SCENES = [
  [[18, 76], [18, 42], [50, 15], [82, 42], [82, 76], [50, 76]],
  [[16, 65], [35, 84], [70, 84], [86, 65], [50, 65], [50, 16]],
  [[20, 50], [38, 25], [68, 30], [85, 50], [68, 70], [38, 75]],
];
export function CreativeBoard({ mode, level, onSuccess, onMistake, disabled }: { mode: 'ligar' | 'pintar' | 'quebra-cabeca'; level: number; onSuccess: () => void; onMistake: () => void; disabled: boolean }) {
  const [color, setColor] = useState<PaintColor>('rose');
  const [regions, setRegions] = useState<(PaintColor | null)[]>(Array(6).fill(null));
  const [history, setHistory] = useState<(PaintColor | null)[][]>([]);
  const [dot, setDot] = useState(0);
  const [tiles, setTiles] = useState(createPuzzle);
  const [selected, setSelected] = useState<number | null>(null);
  const dots = DOT_SCENES[level % DOT_SCENES.length] ?? DOT_SCENES[0] ?? [];
  const petalPaths = ['M100 100 Q45 42 72 20 Q112 10 100 100Z', 'M100 100 Q108 12 148 30 Q172 62 100 100Z', 'M100 100 Q186 60 186 103 Q174 144 100 100Z', 'M100 100 Q168 152 140 178 Q100 188 100 100Z', 'M100 100 Q90 188 50 170 Q24 140 100 100Z', 'M100 100 Q16 144 14 102 Q28 62 100 100Z'];
  if (mode === 'pintar') return <div className="mx-auto w-full max-w-xl">
    <div className="mb-4 flex flex-wrap justify-center gap-3" aria-label="Cores">{PAINT_COLORS.map(value => <Button key={value} aria-label={COLOR_NAMES[value]} title={COLOR_NAMES[value]} aria-pressed={color === value} onClick={() => setColor(value)} className={`paint-${value} size-14 rounded-full border-4 ${color === value ? 'border-foreground' : 'border-card'}`} />)}<Button variant="outline" size="icon" className="size-14" title="Desfazer" aria-label="Desfazer pintura" disabled={!history.length || disabled} onClick={() => { const last = history.at(-1); if (last) { setRegions(last); setHistory(history.slice(0, -1)); } }}><Undo2 /></Button></div>
    <svg viewBox="0 0 200 220" className="mx-auto max-h-96 w-full" aria-label="Flor para pintar"><path d="M100 118 L100 211 M100 175 Q141 143 155 173 Q142 192 100 186" className="painting-stem" fill="none" strokeWidth="8" /><g transform={`rotate(${(level % 3) * 20} 100 100)`}>{petalPaths.map((path, i) => <path key={i} role="button" tabIndex={disabled ? -1 : 0} aria-label={`Pintar pétala ${i + 1}`} d={path} className={`painting-region ${regions[i] ? `paint-${regions[i]}` : 'paint-empty'}`} onClick={() => paint(i)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); paint(i); } }} />)}</g><circle cx="100" cy="100" r="19" className="paint-sun painting-region" /></svg>
    <Button disabled={disabled || !paintComplete(regions)} className="btn-game btn-game-green mx-auto flex h-auto text-xl" onClick={onSuccess}>Concluir pintura</Button>
  </div>;
  function paint(index: number) { if (disabled) return; setHistory([...history, [...regions]]); setRegions(regions.map((value, i) => i === index ? color : value)); sfx.pop(); }
  if (mode === 'ligar') return <div className="dot-board relative mx-auto aspect-square w-full max-w-md rounded-lg bg-card">
    <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden><polyline points={[...dots.slice(0, dot), ...(dot === dots.length ? dots.slice(0, 1) : [])].map(([x, y]) => `${x},${y}`).join(' ')} fill="none" className="dot-line" strokeWidth="1.8" /></svg>
    {dots.map(([x, y], i) => <Button key={i} disabled={disabled || i < dot} aria-label={`Ponto ${i + 1}`} className={`absolute size-12 -translate-x-1/2 -translate-y-1/2 rounded-full text-2xl ${i < dot ? 'bg-success text-success-foreground' : 'bg-primary text-primary-foreground'}`} style={{ left: `${x}%`, top: `${y}%` }} onClick={() => { if (isNextDot(dot, i + 1)) { const next = dot + 1; setDot(next); speak(String(next)); if (next === dots.length) onSuccess(); } else onMistake(); }}>{i + 1}</Button>)}
  </div>;
  return <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4">
    <div className="puzzle-preview"><PuzzleArt scene={level % 3} /></div>
    <div className="grid aspect-square w-full grid-cols-2 gap-1" aria-label="Peças do quebra-cabeça">{tiles.map((tile, index) => <Button key={index} variant="outline" disabled={disabled} aria-label={`Peça ${index + 1}`} aria-pressed={selected === index} className={`relative aspect-square h-auto overflow-hidden rounded-none p-0 [&_svg]:size-full ${selected === index ? 'ring-4 ring-secondary z-10' : ''}`} onClick={() => { if (selected === null) { setSelected(index); return; } if (selected === index) { setSelected(null); return; } const next = [...tiles]; const a = next[selected], b = next[index]; if (a === undefined || b === undefined) return; next[selected] = b; next[index] = a; setTiles(next); setSelected(null); sfx.pop(); if (puzzleSolved(next)) onSuccess(); }}><div className={`puzzle-part puzzle-part-${tile}`}><PuzzleArt scene={level % 3} /></div></Button>)}</div>
    <Button variant="outline" aria-label="Embaralhar peças" title="Embaralhar peças" disabled={disabled} onClick={() => { setTiles(createPuzzle()); setSelected(null); }}><RotateCcw /></Button>
  </div>;
}
function PuzzleArt({ scene }: { scene: number }) { return <svg viewBox="0 0 200 200" aria-hidden className="size-full"><rect width="200" height="200" className="puzzle-sky" /><circle cx="155" cy="36" r="22" className="paint-sun" /><path d="M0 140 Q80 100 200 140 L200 200 L0 200Z" className="paint-leaf" />{scene === 0 ? <><rect x="48" y="95" width="104" height="74" className="paint-sun" /><path d="M34 98 L100 38 L166 98Z" className="paint-rose" /><rect x="85" y="126" width="30" height="43" className="paint-ocean" /><rect x="59" y="108" width="19" height="20" className="paint-ocean" /><rect x="123" y="108" width="19" height="20" className="paint-ocean" /></> : scene === 1 ? <><path d="M100 178 L100 70" className="painting-stem" strokeWidth="10" /><circle cx="100" cy="92" r="45" className="paint-rose" /><circle cx="100" cy="92" r="19" className="paint-sun" /><path d="M100 145 Q150 110 157 148 Q127 171 100 157Z" className="paint-leaf" /></> : <><path d="M36 120 L165 120 L135 166 L68 166Z" className="paint-rose" /><path d="M96 120 L96 40 L151 110Z" className="paint-sun" /><path d="M86 113 L86 50 L40 113Z" className="paint-ocean" /></>}</svg>; }
