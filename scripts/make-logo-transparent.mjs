import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const input = join(root, "public/logo/velora-mark.jpeg");
const output = join(root, "public/logo/velora-mark.png");

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  // Drop near-white JPEG background; keep logo colours.
  if (r > 232 && g > 232 && b > 232) {
    data[i + 3] = 0;
  }
}

await sharp(data, { raw: info }).png().toFile(output);
console.log(`Wrote ${output}`);
