import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const defaultWebDist = fileURLToPath(new URL("../../../web/dist", import.meta.url));

function rootVersion() {
  try {
    const pkg = JSON.parse(readFileSync(new URL("../../../../package.json", import.meta.url), "utf8"));
    return typeof pkg.version === "string" ? `v${pkg.version}` : "dev";
  } catch {
    return "dev";
  }
}

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8787),
  WEB_DIST_DIR: z.string().default(defaultWebDist),
  APP_VERSION: z
    .string()
    .optional()
    .transform((v) => v || rootVersion()),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  YELP_API_KEY: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);
export type Env = typeof env;
