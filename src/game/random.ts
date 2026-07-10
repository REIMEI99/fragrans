import type { Ingredient } from "./types";

const INGREDIENTS: Ingredient[] = ["citrus", "green", "floral", "fruit", "wood", "spice"];

export function nextSeed(seed: number): number {
  return (seed * 1664525 + 1013904223) >>> 0;
}

export function randomInt(seed: number, maxExclusive: number): [number, number] {
  const next = nextSeed(seed);
  return [next % maxExclusive, next];
}

export function rollDice(seed: number, count = 4): [Ingredient[], number] {
  const dice: Ingredient[] = [];
  let cursor = seed;
  for (let i = 0; i < count; i += 1) {
    const [value, next] = randomInt(cursor, INGREDIENTS.length);
    dice.push(INGREDIENTS[value]);
    cursor = next;
  }
  return [dice, cursor];
}

export function shuffleWithSeed<T>(items: T[], seed: number): [T[], number] {
  const next = [...items];
  let cursor = seed;
  for (let i = next.length - 1; i > 0; i -= 1) {
    const [pick, newSeed] = randomInt(cursor, i + 1);
    [next[i], next[pick]] = [next[pick], next[i]];
    cursor = newSeed;
  }
  return [next, cursor];
}
