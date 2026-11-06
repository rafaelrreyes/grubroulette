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
      port: webPort,
      strictPort: true,
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
