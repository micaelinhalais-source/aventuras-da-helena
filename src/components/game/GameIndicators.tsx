import { Heart, Star } from 'lucide-react';

export function GameIndicators({ points, hearts = 3, completed, total }: { points: number; hearts?: number; completed: number; total: number }) {
  return <div className="game-indicators sticky top-0 z-40 grid w-full grid-cols-3 gap-2 border-b border-border bg-card px-2 py-3 shadow-md sm:gap-6 sm:px-6" aria-label="Indicadores da aventura">
    <div className="flex flex-col items-center gap-1"><span className="text-sm font-semibold sm:text-lg">Pontos</span><span className="flex items-center gap-1 text-xl font-bold sm:text-2xl"><Star className="size-6 fill-primary text-primary-deep" />{points}</span></div>
    <div className="flex flex-col items-center gap-1"><span className="text-sm font-semibold sm:text-lg">Vidas</span><span className="flex gap-1" aria-label={`${hearts} corações`}>{[0, 1, 2].map(index => <Heart key={index} aria-hidden className={`size-6 sm:size-8 ${index < hearts ? 'fill-title-rose text-title-rose' : 'text-muted-foreground'}`} />)}</span></div>
    <div className="flex min-w-0 flex-col items-center gap-1"><span className="text-sm font-semibold sm:text-lg">Progresso</span><span className="text-sm font-bold sm:text-lg">{completed}/{total} fases</span><div role="progressbar" aria-label="Fases concluídas" aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed} className="h-2 w-full max-w-36 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-success-deep transition-[width]" style={{ width: `${Math.min(100, completed / total * 100)}%` }} /></div></div>
  </div>;
}