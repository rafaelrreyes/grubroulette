import { existsSync } from "node:fs";
import { relative } from "node:path";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { env } from "./lib/env.ts";
import { ideas } from "./routes/ideas.ts";
import { places } from "./routes/places.ts";

const api = new Hono()
  .get("/health", (c) => c.json({ ok: true, version: env.APP_VERSION }))
  .get("/config", (c) =>
    c.json({
      features: {
        googleLogin: Boolean(env.GOOGLE_CLIENT_ID),
        nearbyPlaces: Boolean(env.GOOGLE_MAPS_API_KEY),
      },
    }),
  )
  .route("/ideas", ideas)
  .route("/places", places);

export const app = new Hono();

app.use(logger());
app.use(secureHeaders());
app.route("/api", api);
app.all("/api/*", (c) => c.json({ error: "Not found" }, 404));

if (existsSync(env.WEB_DIST_DIR)) {
  const root = relative(process.cwd(), env.WEB_DIST_DIR);
  app.use("/*", serveStatic({ root }));
  app.get("*", serveStatic({ root, path: "index.html" }));
}

export type AppType = typeof api;
