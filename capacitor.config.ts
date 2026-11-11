import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.vilipet.shortcuttosize",
  appName: "Shortcut to Size",
  webDir: "dist",
  android: {
    backgroundColor: "#0c1210",
  },
  plugins: {
    SystemBars: {
      style: "DARK",
      insetsHandling: "css",
      initialViewportFitValueHint: "cover",
    },
  },
};

export default config;