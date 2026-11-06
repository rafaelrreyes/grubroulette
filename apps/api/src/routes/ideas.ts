import { Hono } from "hono";
import { z } from "zod";
import { IDEA_POOL, MEALS, QUIPS } from "../data/ideas.ts";
import { pickRandom } from "../lib/random.ts";

const MealSchema = z.enum(MEALS);

const PickSchema = z.object({
  meal: MealSchema,
  ideas: z.array(z.string().trim().min(1).max(80)).max(50),
});

export const ideas = new Hono()
  .get("/random", (c) => {
    const parsed = MealSchema.safeParse(c.req.query("meal") ?? "lunch");
    if (!parsed.success) return c.json({ error: "Unknown meal" }, 400);

    const exclude = new Set((c.req.query("exclude") ?? "").split(",").filter(Boolean));
    const pool = IDEA_POOL[parsed.data].filter((idea) => !exclude.has(idea.name));
    const { item } = pickRandom(pool.length > 0 ? pool : IDEA_POOL[parsed.data]);

    return c.json({ idea: item, quip: pickRandom(QUIPS).item, source: "chaos" as const });
  })
  .post("/pick", async (c) => {
    const parsed = PickSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: "Invalid pick request" }, 400);

    const { meal, ideas: userIdeas } = parsed.data;
    if (userIdeas.length === 0) {
      const { item } = pickRandom(IDEA_POOL[meal]);
      return c.json({ winner: item.name, index: -1, idea: item, quip: pickRandom(QUIPS).item, source: "chaos" as const });
    }

    const { item, index } = pickRandom(userIdeas);
    return c.json({ winner: item, index, quip: pickRandom(QUIPS).item, source: "user" as const });
  });
