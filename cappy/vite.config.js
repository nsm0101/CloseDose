import { defineConfig } from "vite";

export default defineConfig({
  // Ensures assets are loaded relative to the /cappy/ path on your live site
  base: "/cappy/",
  build: {
    target: "esnext",
  },
});
