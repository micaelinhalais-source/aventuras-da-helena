import { Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from './Avatar';
import type { Character } from '@/game/character';
export interface TrackStop { id: string; name: string; emoji: string; done?: boolean; locked?: boolean; badge?: string | undefined }
export function AdventureTrack({ stops, character, onOpen, label }: { stops: TrackStop[]; character: Character; onOpen: (index: number) => void; label: string }) {
  return <div className="shape-track relative mx-auto my-6 w-full max-w-3xl px-3 py-10 sm:px-12">
    <div className="track-lane" aria-hidden />
    <ol aria-label={label} className="relative grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-24 md:gap-y-16">
      {stops.map((stop, index) => {
        const column = Math.floor(index / 2) % 2 === 0 ? index % 2 : 1 - index % 2;
        return <li key={stop.id} className={`relative flex flex-col items-center gap-3 text-center ${column === 0 ? 'col-start-1' : 'col-start-2'}`} style={{ gridRow: Math.floor(index / 2) + 1 }}>
          {index === 0 && <Avatar c={character} className="pointer-events-none absolute -left-3 -top-8 h-28 w-16 sm:-left-10 md:h-36 md:w-20" />}
          <Button title={stop.name} disabled={stop.locked} aria-label={stop.name} onClick={() => onOpen(index)} className={`track-stop relative size-32 rounded-full border-[6px] border-card text-6xl sm:size-36 md:size-40 md:text-7xl [&_svg]:size-6 ${stop.done ? 'bg-success text-success-foreground' : index % 3 === 0 ? 'bg-accent text-accent-foreground' : index % 3 === 1 ? 'bg-primary text-primary-foreground' : 'bg-sky text-foreground'}`}>
            <span aria-hidden>{stop.emoji}</span><span className="absolute -bottom-3 flex h-10 min-w-10 items-center justify-center rounded-full bg-card px-2 text-xl shadow-md font-bold text-foreground">{stop.locked ? <Lock /> : stop.done ? <Check /> : index + 1}</span>
          </Button>
          <span className="max-w-full rounded-lg bg-card/95 px-3 py-1 text-xl font-bold shadow-md sm:text-2xl leading-tight">{stop.name.replace(/^Mundo /, '')}</span>
          {stop.badge && <span className="rounded-full bg-card px-3 text-sm font-semibold">{stop.badge}</span>}
        </li>;
      })}
    </ol><div className="relative mt-8 text-center text-4xl" aria-hidden>🏁</div>
  </div>;
}
