import { Star } from 'lucide-react';

export function Encouragement({ message }: { message: string }) {
  return <div key={message} className="encouragement relative isolate mx-auto w-full max-w-2xl px-3 py-6 text-center" role="status" aria-live="polite">
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>{Array.from({ length: 24 }, (_, index) => <i key={index} className={`confetti-piece confetti-color-${index % 4}`} style={{ left: `${(index * 37) % 100}%`, animationDelay: `${(index % 6) * 0.08}s`, '--confetti-turn': `${index * 41}deg` } as React.CSSProperties} />)}</div>
    <div className="mb-2 flex justify-center gap-3 text-primary-deep" aria-hidden><Star className="celebration-star size-8 fill-primary" /><Star className="celebration-star size-12 fill-primary" /><Star className="celebration-star size-8 fill-primary" /></div>
    <p className="animate-pop relative rounded-lg bg-card px-4 py-4 text-2xl font-semibold text-title-rose shadow-md sm:text-3xl">{message}</p>
  </div>;
}