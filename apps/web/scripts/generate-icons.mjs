import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../public/icons");

// SVG source — gold "TN" on dark background, matches brand tokens
const svgSource = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#0D0D0D"/>
  <text
    x="256"
    y="310"
    font-family="Arial, sans-serif"
    font-weight="700"
    font-size="220"
    text-anchor="middle"
    fill="#C9A84C"
    letter-spacing="-8"
  >TN</text>
</svg>
`.trim();

const buf = Buffer.from(svgSource);

await sharp(buf).resize(512, 512).png().toFile(join(outDir, "icon-512.png"));
console.log("✓ icon-512.png");

await sharp(buf).resize(192, 192).png().toFile(join(outDir, "icon-192.png"));
console.log("✓ icon-192.png");

await sharp(buf).resize(180, 180).png().toFile(join(outDir, "apple-touch-icon.png"));
console.log("✓ apple-touch-icon.png");

console.log("Icons generated in apps/web/public/icons/");
