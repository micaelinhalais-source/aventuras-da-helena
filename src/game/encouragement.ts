export const ENCOURAGEMENTS = [
  'Parabéns, Helena! Você é muito inteligente!',
  'Tia Mica está muito orgulhosa de você!',
  'Você é muito boa nisso, Helena!',
  'Helena, você é muito esperta!',
  'Que incrível, Helena! Você arrasou!',
  'Continue assim, Helena!',
] as const;

// Session-only: no new persistence or changes to saved progress.
let lastMessage = '';
export function chooseEncouragement(previous: string, random: () => number = Math.random): string {
  const choices = ENCOURAGEMENTS.filter(message => message !== previous);
  return choices[Math.min(choices.length - 1, Math.max(0, Math.floor(random() * choices.length)))] ?? ENCOURAGEMENTS[0];
}
export function nextEncouragement(): string {
  lastMessage = chooseEncouragement(lastMessage);
  return lastMessage;
}