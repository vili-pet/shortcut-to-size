import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const base = process.env.VITE_BASE || env.VITE_BASE || "/";
  // Native (Capacitor) build: no service worker inside the WebView.
  const native = env.VITE_NATIVE === "true";

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      ...(native
        ? []
        : [
            VitePWA({
              registerType: "autoUpdate",
              includeAssets: ["icon.svg"],
              manifest: {
                name: "Shortcut to Size",
                short_name: "STS",
                description:
                  "Jim Stoppani Shortcut to Size — 12 viikon treeniloki",
                theme_color: "#0c1210",
                background_color: "#0c1210",
                display: "standalone",
                orientation: "portrait-primary",
                lang: "fi",
                start_url: base,
                scope: base,
                icons: [
                  {
                    src: "icon.svg",
                    sizes: "any",
                    type: "image/svg+xml",
                    purpose: "any maskable",
                  },
                ],
              },
              workbox: {
                globPatterns: ["**/*.{js,css,html,svg,ico,woff2}"],
              },
            }),
          ]),
    ],
  };
});