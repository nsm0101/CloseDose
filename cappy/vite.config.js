import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  // IMPORTANT: This assumes your app is hosted at https://closedose.com/cappy/
  // If you host under a different subpath, update base accordingly.
  base: "/cappy/",
  build: {
    target: "esnext",
    rollupOptions: {
      input: {
        scan: resolve(__dirname, "src/pages/scan/index.html"),
        login: resolve(__dirname, "src/pages/login/index.html"),
        auth: resolve(__dirname, "src/pages/auth/index.html"),
        onboarding: resolve(__dirname, "src/pages/onboarding/index.html"),
        app: resolve(__dirname, "src/pages/app/index.html"),
        firebase: resolve(__dirname, "src/pages/firebase/index.html"),
      },
    },
  },
});
