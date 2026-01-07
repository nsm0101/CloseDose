import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  // IMPORTANT: This assumes your app is hosted at https://closedose.com/cappy/
  // If you host under a different subpath, update base accordingly.
  base: "/cappy/",
  build: {
    rollupOptions: {
      input: {
        scan: resolve(__dirname, "src/pages/scan/index.html"),
        login: resolve(__dirname, "src/pages/login/index.html"),
        app: resolve(__dirname, "src/pages/app/index.html"),
      },
    },
  },
});
