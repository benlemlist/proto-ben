import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { agentProxy } from "./vite-plugin-agent";

export default defineConfig({
  plugins: [react(), tailwindcss(), agentProxy()],
});
