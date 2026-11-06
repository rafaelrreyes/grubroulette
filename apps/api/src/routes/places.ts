import { Hono } from "hono";
import { z } from "zod";
import { env } from "../lib/env.ts";

const PlacesQuery = z.object({
  cuisine: z.string().min(1).max(60),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export const places = new Hono().get("/", (c) => {
  const parsed = PlacesQuery.safeParse(c.req.query());
  if (!parsed.success) return c.json({ error: "cuisine, lat and lng are required" }, 400);

  if (!env.GOOGLE_MAPS_API_KEY) {
    return c.json(
      { error: "Nearby restaurants are coming soon", enabled: false, query: parsed.data },
      501,
    );
  }

  // TODO: call Google Places API (Text Search / Nearby Search) and merge Yelp ratings.
  return c.json({ enabled: true, results: [], query: parsed.data });
});
