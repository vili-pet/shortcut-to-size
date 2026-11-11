import sharp from "sharp";
import { mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BG = "#0c1210";
const svg = readFileSync(new URL("../public/icon.svg", import.meta.url));

mkdirSync(new URL("../assets/", import.meta.url), { recursive: true });
const out = (name) => fileURLToPath(new URL(`../assets/${name}`, import.meta.url));

const icon1024 = await sharp(svg, { density: 300 }).resize(1024, 1024).png().toBuffer();
await sharp(icon1024).toFile(out("icon-only.png"));
await sharp(icon1024).toFile(out("icon-foreground.png"));
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: BG } })
  .png()
  .toFile(out("icon-background.png"));

const splashIcon = await sharp(svg, { density: 300 }).resize(700, 700).png().toBuffer();
for (const name of ["splash.png", "splash-dark.png"]) {
  await sharp({ create: { width: 2732, height: 2732, channels: 4, background: BG } })
    .composite([{ input: splashIcon, gravity: "center" }])
    .png()
    .toFile(out(name));
}

console.log("assets generated");