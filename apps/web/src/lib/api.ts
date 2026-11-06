import type { Meal } from "@/data/meals";

export interface Idea {
  name: string;
  cuisine: string;
  emoji: string;
}

export interface PickResult {
  winner: string;
  index: number;
  quip: string;
  source: "user" | "chaos";
  idea?: Idea;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return (await res.json()) as T;
}

export function pickIdea(meal: Meal, ideas: string[]) {
  return request<PickResult>("/ideas/pick", {
    method: "POST",
    body: JSON.stringify({ meal, ideas }),
  });
}

export async function chaosIdea(meal: Meal, exclude: string[] = []): Promise<PickResult> {
  const params = new URLSearchParams({ meal, exclude: exclude.join(",") });
  const res = await request<{ idea: Idea; quip: string; source: "chaos" }>(`/ideas/random?${params}`);
  return { winner: res.idea.name, index: -1, quip: res.quip, source: "chaos", idea: res.idea };
}
