import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRoot, "");
  const webPort = Number(env.WEB_PORT ?? 3337);
  const apiPort = Number(env.PORT ?? 4337);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      host: env.WEB_HOST ?? "localhost",
      port: webPort,
      strictPort: true,
      watch: env.VITE_USE_POLLING === "true" ? { usePolling: true, interval: 300 } : undefined,
      proxy: {
        "/api": `http://localhost:${apiPort}`,
      },
    },
    preview: {
      port: webPort,
      strictPort: true,
    },
    build: {
      sourcemap: false,
    },
  };
});
