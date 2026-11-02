// Tiny offline sound effects (Web Audio) and spoken messages for pre-readers.
let ctx: AudioContext | null = null;
function ac() {
  if (typeof window === "undefined") return null;
  const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!C) return null;
  ctx ??= new C();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.18) {
  const a = ac();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, a.currentTime + start);
  o.frequency.exponentialRampToValueAtTime(freq * 1.5, a.currentTime + start + dur);
  g.gain.setValueAtTime(0.0001, a.currentTime + start);
  g.gain.exponentialRampToValueAtTime(vol, a.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + dur);
  o.connect(g).connect(a.destination);
  o.start(a.currentTime + start);
  o.stop(a.currentTime + start + dur + 0.05);
}

export const sfx = {
  pop: () => tone(520, 0, 0.12, "triangle"),
  tab: () => tone(380, 0, 0.1, "sine", 0.12),
  back: () => tone(300, 0, 0.15, "sine", 0.12),
  cheer: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.22, "triangle")),
};

export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "pt-BR";
  u.rate = 0.95;
  u.pitch = 1.2;
  window.speechSynthesis.speak(u);
}
