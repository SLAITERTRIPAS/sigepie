import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { defineConfig, loadEnv } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    base: "/",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      // REGRA FIXA DO SISTEMA: Esta capacidade NUNCA deve ser alterada sem autorização explícita do utilizador.
      chunkSizeWarningLimit: 2000000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("firebase")) return "vendor-firebase";
              if (id.includes("jspdf") || id.includes("pdfjs-dist") || id.includes("html2pdf.js") || id.includes("xlsx")) return "vendor-docs";
              if (id.includes("recharts") || id.includes("d3") || id.includes("lucide-react")) return "vendor-ui-libs";
              return "vendor";
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== "true",
    },
  };
});
