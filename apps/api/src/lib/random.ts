import { randomInt } from "node:crypto";

export function pickRandom<T>(items: readonly T[]): { item: T; index: number } {
  if (items.length === 0) throw new Error("Cannot pick from an empty list");
  const index = randomInt(items.length);
  return { item: items[index] as T, index };
}
