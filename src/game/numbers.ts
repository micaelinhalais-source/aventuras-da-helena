export interface CountingRound {
  count: number;
  emoji: string;
  noun: string;
  options: number[];
}

export function createCountingRounds(random: () => number = Math.random): CountingRound[] {
  const objects = [
    { emoji: "🍎", noun: "maçãs" },
    { emoji: "🦋", noun: "borboletas" },
    { emoji: "⭐", noun: "estrelas" },
    { emoji: "🍓", noun: "morangos" },
    { emoji: "🐠", noun: "peixinhos" },
  ];
  return objects.map((object, index) => {
    const count = index + 1;
    const options = [count, count === 5 ? 3 : count + 1, count <= 2 ? count + 2 : count - 1];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const current = options[i];
      const other = options[j];
      if (current === undefined || other === undefined) continue;
      options[i] = other;
      options[j] = current;
    }
    return { ...object, count, options };
  });
}

export function isCountingAnswer(round: CountingRound, answer: number) {
  return round.count === answer;
}