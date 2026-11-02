import { useId, type ReactNode } from "react";
import type { Character } from "@/game/character";

// Layered SVG character with soft shading for a 3D-cartoon look.
export type AvatarView = "full" | "head" | "torso" | "legs" | "feet";
const VIEWS: Record<AvatarView, string> = {
  full: "0 0 200 360",
  head: "14 4 172 172",
  torso: "24 140 152 120",
  legs: "28 222 144 116",
  feet: "36 292 128 64",
};

const INK = "#3A2A4A";
const mirror = (d: string) =>
  d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_m, x, y) => `${200 - Number(x)} ${y}`);

export function Avatar({ c, view = "full", className }: { c: Character; view?: AvatarView; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const shade = `url(#shade-${uid})`;
  const shine = `url(#shine-${uid})`;

  // Paint a path with base color + depth shading + highlight.
  const P = ({ d, fill, glow = true }: { d: string; fill: string; glow?: boolean }) => (
    <>
      <path d={d} fill={fill} />
      <path d={d} fill={shade} />
      {glow && <path d={d} fill={shine} />}
    </>
  );
  const C = ({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) => (
    <>
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <circle cx={cx} cy={cy} r={r} fill={shade} />
      <circle cx={cx} cy={cy} r={r} fill={shine} />
    </>
  );

  const has = (a: Character["accessories"][number]) => c.accessories.includes(a);
  const hair = c.hairColor;

  // ---------- hair (behind head) ----------
  let hairBack: ReactNode = null;
  switch (c.hairStyle) {
    case "long":
      hairBack = <P d="M48 92 Q44 38 100 36 Q156 38 152 92 L162 196 Q100 212 38 196Z" fill={hair} />;
      break;
    case "afro":
      hairBack = <C cx={100} cy={84} r={72} fill={hair} />;
      break;
    case "ponytail":
      hairBack = <P d="M138 64 Q190 70 178 146 Q172 176 154 166 Q166 120 140 96Z" fill={hair} />;
      break;
    case "pigtails":
      hairBack = (
        <>
          <C cx={40} cy={112} r={22} fill={hair} />
          <C cx={160} cy={112} r={22} fill={hair} />
        </>
      );
      break;
    case "bun":
      hairBack = <C cx={100} cy={36} r={24} fill={hair} />;
      break;
    case "curly":
      hairBack = (
        <>
          {[[52, 72], [148, 72], [62, 48], [138, 48], [84, 34], [116, 34], [46, 98], [154, 98]].map(([x, y]) => (
            <C key={`${x}${y}`} cx={x} cy={y} r={20} fill={hair} />
          ))}
        </>
      );
      break;
  }

  // ---------- hair (front) ----------
  const capD = "M50 100 Q44 36 100 34 Q156 36 150 100 Q146 72 128 62 Q100 78 70 64 Q54 76 50 100Z";
  let hairFront: ReactNode = <P d={capD} fill={hair} />;
  if (c.hairStyle === "buzz") hairFront = <P d="M52 86 Q56 42 100 40 Q144 42 148 86 Q130 58 100 58 Q70 58 52 86Z" fill={hair} />;
  if (c.hairStyle === "afro") hairFront = <P d="M52 94 Q50 48 100 44 Q150 48 148 94 Q130 64 100 64 Q70 64 52 94Z" fill={hair} />;
  if (c.hairStyle === "pigtails")
    hairFront = (
      <>
        <P d={capD} fill={hair} />
        <circle cx={52} cy={100} r={6} fill="#FF5A5F" />
        <circle cx={148} cy={100} r={6} fill="#FF5A5F" />
      </>
    );

  // ---------- eyes ----------
  const eye = (x: number, side: 1 | -1) => {
    const y = 104;
    const lashes =
      c.gender === "girl" ? (
        <g stroke={INK} strokeWidth={2.4} strokeLinecap="round">
          <line x1={x + side * 8} y1={y - 8} x2={x + side * 14} y2={y - 13} />
          <line x1={x + side * 3} y1={y - 11} x2={x + side * 6} y2={y - 17} />
        </g>
      ) : null;
    if (c.eyeShape === "happy")
      return (
        <g key={x}>
          <path d={`M${x - 9} ${y + 2} Q${x} ${y - 9} ${x + 9} ${y + 2}`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
          {lashes}
        </g>
      );
    const big = c.eyeShape === "big";
    const r = big ? 12.5 : 10;
    return (
      <g key={x}>
        {c.eyeShape === "almond" ? (
          <ellipse cx={x} cy={y} rx={11} ry={7.5} fill="#fff" stroke={INK} strokeWidth={1.5} />
        ) : (
          <circle cx={x} cy={y} r={r} fill="#fff" stroke={INK} strokeWidth={1.5} />
        )}
        <circle cx={x} cy={y + 1} r={c.eyeShape === "almond" ? 6 : big ? 9 : 7} fill={c.eyeColor} />
        <circle cx={x} cy={y + 1} r={big ? 4.5 : 3.5} fill="#151020" />
        <circle cx={x - 2.5} cy={y - 2.5} r={big ? 3 : 2.2} fill="#fff" />
        {lashes}
      </g>
    );
  };

  // ---------- clothes ----------
  const torsoD = "M64 160 Q100 148 136 160 Q146 168 144 182 L140 240 Q100 248 60 240 L56 182 Q54 168 64 160Z";
  const sleeveLen = c.shirtStyle === "longsleeve" || c.shirtStyle === "hoodie" ? 68 : 30;
  const arm = (side: 1 | -1) => {
    const x = side === -1 ? 36 : 144;
    const cx = x + 10;
    return (
      <g transform={`rotate(${side * -12} ${cx} 166)`}>
        <P d={`M${x} 174 Q${x} 164 ${cx} 164 Q${x + 20} 164 ${x + 20} 174 L${x + 20} 234 Q${x + 20} 244 ${cx} 244 Q${x} 244 ${x} 234Z`} fill={c.skin} glow={false} />
        <C cx={cx} cy={244} r={11} fill={c.skin} />
        <P d={`M${x - 2} 174 Q${x - 2} 162 ${cx} 162 Q${x + 22} 162 ${x + 22} 174 L${x + 22} ${164 + sleeveLen} L${x - 2} ${164 + sleeveLen}Z`} fill={c.shirtColor} />
      </g>
    );
  };

  const legD = "M72 236 L96 236 L96 322 Q96 330 84 330 Q72 330 72 322Z";
  const bottoms: Record<Character["bottomStyle"], string> = {
    shorts: "M58 230 L142 230 L144 278 L104 278 L100 258 L96 278 L56 278Z",
    pants: "M58 230 L142 230 L138 326 L104 326 L100 262 L96 326 L62 326Z",
    skirt: "M62 228 L138 228 L158 286 Q100 300 42 286Z",
  };

  const shoeTop = c.shoeStyle === "hightop" ? 304 : 320;
  const shoeD = `M66 ${shoeTop} L96 ${shoeTop} L98 340 L56 340 Q50 340 52 334 Q56 ${shoeTop + 6} 66 ${shoeTop}Z`;
  const shoe = (d: string, flip: boolean) => {
    const dd = flip ? mirror(d) : d;
    const sole = flip ? mirror("M50 338 L100 338 L100 348 L50 348 Q46 348 46 343 Q46 338 50 338Z") : "M50 338 L100 338 L100 348 L50 348 Q46 348 46 343 Q46 338 50 338Z";
    const sx = (x: number) => (flip ? 200 - x : x);
    return (
      <g>
        <P d={dd} fill={c.shoeColor} />
        <path d={sole} fill="#fff" stroke="#E4E4EE" strokeWidth={1.5} />
        {c.shoeStyle === "velcro" && <rect x={Math.min(sx(62), sx(94))} y={324} width={32} height={8} rx={3} fill="#fff" opacity={0.9} />}
        {c.shoeStyle === "sneaker" && <path d={`M${sx(70)} 326 L${sx(88)} 326 M${sx(72)} 331 L${sx(90)} 331`} stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />}
        {c.shoeStyle === "hightop" && <circle cx={sx(84)} cy={318} r={5} fill="#fff" />}
      </g>
    );
  };

  return (
    <svg viewBox={VIEWS[view]} className={className} role="img" aria-label="Seu personagem">
      <defs>
        <radialGradient id={`shine-${uid}`} cx="35%" cy="25%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.55} />
          <stop offset="60%" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`shade-${uid}`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="45%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#1a0a30" stopOpacity={0.28} />
        </linearGradient>
        <pattern id={`stripe-${uid}`} width="200" height="14" patternUnits="userSpaceOnUse">
          <rect y="0" width="200" height="6" fill="#fff" opacity={0.75} />
        </pattern>
        <clipPath id={`torso-${uid}`}>
          <path d={torsoD} />
        </clipPath>
      </defs>

      {view === "full" && <ellipse cx={100} cy={350} rx={70} ry={8} fill="#1a0a30" opacity={0.15} />}

      {hairBack}

      {/* legs + shoes */}
      <P d={legD} fill={c.skin} glow={false} />
      <P d={mirror(legD)} fill={c.skin} glow={false} />
      {shoe(shoeD, false)}
      {shoe(shoeD, true)}
      <P d={bottoms[c.bottomStyle]} fill={c.bottomColor} />

      {/* arms + torso */}
      {arm(-1)}
      {arm(1)}
      <P d={torsoD} fill={c.shirtColor} />
      {c.shirtStyle === "striped" && <rect x="40" y="150" width="120" height="100" fill={`url(#stripe-${uid})`} clipPath={`url(#torso-${uid})`} />}
      {c.shirtStyle === "star" && (
        <path d="M100 178 L106 192 L121 193 L109 202 L113 217 L100 208 L87 217 L91 202 L79 193 L94 192Z" fill="#FFD23F" stroke="#fff" strokeWidth={2} />
      )}
      {c.shirtStyle === "hoodie" && (
        <>
          <path d="M70 158 Q100 186 130 158" stroke="#1a0a30" strokeOpacity={0.18} strokeWidth={12} fill="none" strokeLinecap="round" />
          <path d="M78 206 L122 206 L126 230 L74 230Z" fill="#1a0a30" opacity={0.12} />
          <path d="M92 168 L90 196 M108 168 L110 196" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
        </>
      )}

      {/* neck + head */}
      <rect x={88} y={136} width={24} height={24} rx={8} fill={c.skin} />
      <rect x={88} y={136} width={24} height={24} rx={8} fill="#1a0a30" opacity={0.12} />
      {(c.shirtStyle === "tshirt" || c.shirtStyle === "longsleeve" || c.shirtStyle === "striped" || c.shirtStyle === "star") && (
        <path d="M84 158 Q100 172 116 158" stroke="#fff" strokeOpacity={0.6} strokeWidth={4} fill="none" strokeLinecap="round" />
      )}
      <C cx={50} cy={104} r={11} fill={c.skin} />
      <C cx={150} cy={104} r={11} fill={c.skin} />
      <C cx={100} cy={96} r={50} fill={c.skin} />

      {/* face */}
      <path d="M72 88 Q81 82 90 88 M110 88 Q119 82 128 88" stroke={hair} strokeWidth={4} fill="none" strokeLinecap="round" />
      {eye(81, -1)}
      {eye(119, 1)}
      <ellipse cx={100} cy={116} rx={4} ry={3} fill="#1a0a30" opacity={0.15} />
      <ellipse cx={70} cy={120} rx={8} ry={5} fill="#FF7A93" opacity={0.4} />
      <ellipse cx={130} cy={120} rx={8} ry={5} fill="#FF7A93" opacity={0.4} />
      <path d="M86 124 Q100 140 114 124 Q100 130 86 124Z" fill="#B23A55" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />

      {hairFront}

      {/* accessories */}
      {has("glasses") && (
        <g stroke={INK} strokeWidth={3.5} fill="#fff" fillOpacity={0.15}>
          <circle cx={81} cy={104} r={15} />
          <circle cx={119} cy={104} r={15} />
          <path d="M96 102 Q100 98 104 102 M66 102 L52 98 M134 102 L148 98" fill="none" />
        </g>
      )}
      {has("headphones") && (
        <g>
          <path d="M46 100 Q46 26 100 26 Q154 26 154 100" stroke="#2B2D42" strokeWidth={8} fill="none" strokeLinecap="round" />
          <P d="M36 88 Q36 82 44 82 L54 82 L54 122 L44 122 Q36 122 36 116Z" fill="#FF5A5F" />
          <P d="M164 88 Q164 82 156 82 L146 82 L146 122 L156 122 Q164 122 164 116Z" fill="#FF5A5F" />
        </g>
      )}
      {has("cap") && (
        <g>
          <P d="M48 80 Q50 28 100 28 Q150 28 152 80Z" fill="#FF5A5F" />
          <P d="M100 72 Q150 64 180 80 Q152 90 100 82Z" fill="#E0464B" />
          <circle cx={100} cy={30} r={5} fill="#FFD23F" />
        </g>
      )}
      {has("crown") && (
        <P d="M70 52 L74 22 L88 40 L100 16 L112 40 L126 22 L130 52 Q100 58 70 52Z" fill="#FFC93C" />
      )}
      {has("bow") && (
        <g transform="translate(140 50) rotate(20)">
          <P d="M0 0 L-24 -14 Q-28 0 -24 14Z" fill="#FF7EB6" />
          <P d="M0 0 L24 -14 Q28 0 24 14Z" fill="#FF7EB6" />
          <circle r={7} fill="#E85A9A" />
        </g>
      )}
    </svg>
  );
}
