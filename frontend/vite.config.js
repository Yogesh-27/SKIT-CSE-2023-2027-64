import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Frontend runs on :5173 and forwards /api and /uploads to the backend on :5000
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:5000",
      "/uploads": "http://localhost:5000"
    }
  }
});
