import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// GitHub Pages는 https://<계정>.github.io/yogitta/ 아래에서 열리므로 base를 저장소 이름으로 맞춘다.
export default defineConfig({
  base: "/yogitta/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
