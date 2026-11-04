import type { Shape } from "@/game/shapes";

export function ShapePicture({ shape, color = 0, size = 70, shadow = false }: { shape: Shape; color?: number; size?: number; shadow?: boolean }) {
  const fill = shadow ? "shape-shadow" : `shape-color-${color}`;
  return (
    <svg viewBox="0 0 110 110" className={`h-full w-full ${fill}`} aria-hidden>
      <g transform={`translate(55 55) scale(${size / 100}) translate(-50 -50)`}>
        {shape === "circle" && <circle cx="50" cy="50" r="45" />}
        {shape === "square" && <rect x="5" y="5" width="90" height="90" rx="3" />}
        {shape === "triangle" && <path d="M50 5 L97 93 H3 Z" />}
        {shape === "rectangle" && <rect x="0" y="22" width="100" height="60" rx="3" />}
        {shape === "star" && <path d="M50 0 L64 33 100 36 73 61 82 97 50 78 18 97 27 61 0 36 36 33 Z" />}
      </g>
    </svg>
  );
}