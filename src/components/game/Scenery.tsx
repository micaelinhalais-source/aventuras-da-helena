// Decorative sky: sun, drifting clouds and rolling hills.
export function Scenery() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -right-16 -top-16 size-64 rounded-full shadow-[0_0_80px_30px_oklch(0.95_0.15_90/0.6)]" style={{ background: "var(--gradient-sun)" }} />
      {[
        { top: "8%", delay: "-10s", s: 1 },
        { top: "22%", delay: "-35s", s: 0.7 },
        { top: "38%", delay: "-50s", s: 0.5 },
      ].map((cl, i) => (
        <div key={i} className="animate-drift absolute left-0" style={{ top: cl.top, animationDelay: cl.delay, scale: cl.s }}>
          <div className="relative h-20 w-56">
            <div className="absolute bottom-0 h-12 w-56 rounded-full bg-card/90" />
            <div className="absolute bottom-4 left-10 size-20 rounded-full bg-card/90" />
            <div className="absolute bottom-3 left-28 size-14 rounded-full bg-card/90" />
          </div>
        </div>
      ))}
      <div className="absolute -bottom-40 -left-20 h-72 w-[70%] rounded-[50%] bg-success/80" />
      <div className="absolute -bottom-44 -right-20 h-80 w-[75%] rounded-[50%] bg-success" />
    </div>
  );
}
