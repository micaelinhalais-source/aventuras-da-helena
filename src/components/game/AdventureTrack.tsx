import { Lock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from './Avatar';
import type { Character } from '@/game/character';
import garden from '@/assets/adventure-garden.jpg';
export interface TrackStop { id: string; name: string; emoji: string; done?: boolean; locked?: boolean; badge?: string | undefined }
export function AdventureTrack({ stops, character, onOpen, label }: { stops: TrackStop[]; character: Character; onOpen: (index: number) => void; label: string }) {
  const current = stops.findIndex(stop => !stop.done && !stop.locked);
  const positions = [36, 65, 45, 30, 64, 48, 30, 65, 44, 56];
  const path = stops.map((_, index) => {
    const x = positions[index % positions.length] ?? 50;
    const y = 170 + index * 210;
    if (index === 0) return `M ${x * 10} ${y}`;
    const previousX = (positions[(index - 1) % positions.length] ?? 50) * 10;
    return `C ${previousX} ${y - 95}, ${x * 10} ${y - 115}, ${x * 10} ${y}`;
  }).join(' ');
  return <div className="adventure-map relative mx-auto my-4 w-full max-w-4xl overflow-hidden" style={{ height: `${stops.length * 210 + 150}px` }}>
    <img src={garden} width={1024} height={1920} alt="" className="pointer-events-none absolute inset-0 size-full object-fill" />
    <svg className="pointer-events-none absolute inset-0 size-full" viewBox={`0 0 1000 ${stops.length * 210 + 150}`} preserveAspectRatio="none" aria-hidden><path d={path} className="map-path-edge" /><path d={path} className="map-path" /><path d={path} className="map-path-dashes" /></svg>
    <ol aria-label={label} className="relative h-full">
      {stops.map((stop, index) => {
        return <li key={stop.id} className="absolute flex w-40 -translate-x-1/2 flex-col items-center gap-2 text-center sm:w-52" style={{ left: `${positions[index % positions.length] ?? 50}%`, top: `${110 + index * 210}px` }}>
          {index === current && <Avatar c={character} className="pointer-events-none absolute -top-24 left-1/2 z-10 h-28 w-20 -translate-x-1/2" />}
          <Button title={stop.name} disabled={stop.locked} aria-label={stop.name} aria-current={index === current ? 'step' : undefined} onClick={() => onOpen(index)} className={`track-stop map-stop relative size-28 rounded-full border-[5px] border-card text-5xl sm:size-32 sm:text-6xl [&_svg]:size-6 ${index === current ? 'map-current bg-primary text-primary-foreground' : stop.done ? 'bg-success text-success-foreground' : stop.locked ? 'bg-muted text-muted-foreground' : 'bg-accent text-accent-foreground'}`}>
            <span aria-hidden>{stop.emoji}</span><span className="absolute -bottom-3 flex h-9 min-w-9 items-center justify-center rounded-full bg-card px-2 text-xl font-bold text-foreground shadow-md">{stop.locked ? <Lock /> : stop.done ? <Star className="fill-primary text-primary-deep" /> : index + 1}</span>
          </Button>
          <span className="mt-2 max-w-full rounded-lg bg-card/95 px-3 py-1 text-base font-bold leading-tight shadow-md sm:text-lg">{stop.name.replace(/^Mundo /, '')}</span>
          {stop.badge && <span className="rounded-full bg-card px-3 text-sm font-semibold">{stop.badge}</span>}
        </li>;
      })}
    </ol><div className="absolute bottom-9 left-1/2 -translate-x-1/2 text-5xl" aria-hidden>🏁</div>
  </div>;
}
