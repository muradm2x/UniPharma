import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";


const rawPort = process.env.PORT || "5173";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'component-preview',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = new URL(req.originalUrl || req.url, `http://${req.headers.host}`);
          if (!url.pathname.startsWith('/preview/')) return next();
          const componentName = url.pathname.split('/')[2];
          const componentPath = path.resolve(import.meta.dirname, 'src', 'components', `${componentName}.tsx`);
          try {
            const { default: Component } = await import(componentPath);
            const html = `<!doctype html><html><head><meta charset=\"UTF-8\"><title>Preview ${componentName}</title></head><body><div id=\"root\"></div><script type=\"module\">import React from 'react';import { createRoot } from 'react-dom/client';const root = createRoot(document.getElementById('root'));root.render(React.createElement(Component));</script></body></html>`;
            res.setHeader('Content-Type', 'text/html');
            res.end(html);
          } catch (e) {
            res.statusCode = 404;
            res.end('Component not found');
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "/api": {
        target: process.env.API_URL ?? "http://localhost:8080",
        changeOrigin: true,
      },
    },
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
