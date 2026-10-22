import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(fileURLToPath(new URL("../", import.meta.url)));
const imageRoot = path.join(root, "public/images");
const args = process.argv.slice(2);

if (args.length !== 2 || args[0] !== "--out" || !args[1].trim()) {
  throw new Error("Usage: npm run images:prepare -- --out <candidate-directory>");
}

const outputRoot = path.resolve(args[1]);
const approvedRoot = path.join(imageRoot, "optimized");
const within = (parent, child) => child === parent || child.startsWith(`${parent}${path.sep}`);

if (
  within(outputRoot, root) ||
  (within(root, outputRoot) && !within(approvedRoot, outputRoot))
) {
  throw new Error("Stage candidates outside the repository, or use public/images/optimized after approval.");
}

const brakeRows = [
  [322, "delphi-lp3302", "trw-gdb-unknown"],
  [624, "bosch-0986494660", "bosch-0986424829"],
  [1227, "brembo-p85152", "bosch-brake-set"],
  [1529, "ferodo-brake-set", "trw-brake-set-2"],
  [1830, "jurid-573773j", "abs-37671"],
  [2132, "zimmermann-256611702", "nk-224719"],
  [2433, "maxgear-19-2143", "abs-35125"],
  [2735, "bosch-0986460162", "textar-2209101"],
  [3036, "quinton-hazell-bp1906", "bosch-brake-set-3"],
  [3338, "pagid-t2581n", "brembo-unavailable"],
];
const batteryRows = [
  [420, "bolk-m040002", "bolk-m040006"],
  [721, "bolk-m040026", "bolk-m010022"],
  [1325, "bolk-m040003", "bosch-0092-s5a-110"],
  [1626, "exide-ek820", "bosch-0092-s40-080"],
  [1928, "bosch-0092-s50-080", "bosch-0092-s4e-051"],
  [2229, "bproauto-04220002", "yuasa-ybx9115"],
  [2531, "bproauto-04220003", "bproauto-04220026"],
];
const oilSource = "screencapture-mister-auto-huile-moteur-3224-g-2026-10-10-17_34_59.png";
const oilRows = [
  [420, "mannol-mn7730-5", "liqui-moly-21605"],
  [725, "shell-550046304", "petronas-70720251eu"],
  [1328, "total-214225", "total-216246"],
  [1630, "mannol-mn7730-20"],
];
const recipes = new Map();

// Coordinates retain the existing image associations, not manufacturer SKU verification.
for (const [category, source, rows] of [
  ["freinage", "frinage.png", brakeRows],
  ["batteries", "batteries.png", batteryRows],
  ["huile-moteur", oilSource, oilRows],
]) {
  for (const [top, ...names] of rows) {
    names.forEach((name, column) => {
      recipes.set(`products/${category}/${name}.png`, {
        source,
        crop: { left: column === 0 ? 724 : 1112, top: top + 36, width: 110, height: 128 },
      });
    });
  }
}

for (const [column, name] of [
  "goodyear-528503", "michelin-771116", "goodyear-528504", "dunlop-528520",
].entries()) {
  recipes.set(`products/pneus/${name}.png`, {
    source: "pneus.png",
    crop: { left: 465 + column * 230, top: 810, width: 190, height: 132 },
  });
}

for (const [row, names] of [
  ["velo-electrique-new-york", "nettoyant-injecteurs-warm-up", "kit-renovation-phare-philips", "pare-soleil-wrc"],
  ["chargeur-vehicule-electrique-type-2", "diagnostic-obd2", "cle-vidange-8-10mm", "nettoyant-plastique-michelin"],
].entries()) {
  names.forEach((name, column) => {
    recipes.set(`products/accessoires/${name}.png`, {
      source: "screencapture-mister-auto-accessoire-auto-2026-10-10-17_35_36.png",
      crop: { left: 480 + column * 252, top: row === 0 ? 2153 : 2583, width: 204, height: 137 },
      sourceFrameMayBeClipped: true,
    });
  });
}

async function pngFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (within(approvedRoot, absolute)) continue;
    if (entry.isDirectory()) files.push(...await pngFiles(absolute));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) files.push(absolute);
  }
  return files.sort();
}

const sourceCache = new Map();
async function sourceFile(absolute) {
  if (!sourceCache.has(absolute)) {
    const buffer = await readFile(absolute);
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) throw new Error(`Missing dimensions: ${absolute}`);
    sourceCache.set(absolute, {
      buffer,
      path: path.relative(root, absolute).split(path.sep).join("/"),
      sha256: createHash("sha256").update(buffer).digest("hex"),
      width: metadata.width,
      height: metadata.height,
      bytes: buffer.length,
    });
  }
  return sourceCache.get(absolute);
}

function provenance({ path, sha256, width, height, bytes }) {
  return { path, sha256, width, height, bytes };
}

function contentBounds(data, width, height) {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 3;
      if (data[index] === 255 && data[index + 1] === 255 && data[index + 2] === 255) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  if (right < left) throw new Error("A product crop is empty; review its source and coordinates.");
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

const assets = [];
const usedRecipes = new Set();
for (const absolute of await pngFiles(imageRoot)) {
  const relative = path.relative(imageRoot, absolute).split(path.sep).join("/");
  const product = relative.startsWith("products/");
  const original = await sourceFile(absolute);
  const recipe = recipes.get(relative);
  if (recipe) usedRecipes.add(relative);
  const source = recipe ? await sourceFile(path.join(root, recipe.source)) : original;
  const crop = recipe?.crop ?? { left: 0, top: 0, width: source.width, height: source.height };
  if (crop.left + crop.width > source.width || crop.top + crop.height > source.height) {
    throw new Error(`Crop exceeds source bounds: ${relative}`);
  }

  let pipeline = sharp(source.buffer).extract(crop).flatten({ background: "#fff" }).toColourspace("srgb").removeAlpha();
  let bounds = null;
  let frame = null;
  let touchesSourceFrame = false;
  let expectedPixels;
  let verificationCrop;
  if (product) {
    const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });
    if (info.channels !== 3) throw new Error(`Expected RGB pixels: ${relative}`);
    bounds = contentBounds(data, info.width, info.height);
    touchesSourceFrame = bounds.left === 0 || bounds.top === 0 ||
      bounds.left + bounds.width === info.width || bounds.top + bounds.height === info.height;
    if (recipe && touchesSourceFrame && !recipe.sourceFrameMayBeClipped) {
      throw new Error(`Product touches crop boundary; review coordinates: ${relative}`);
    }
    const contentImage = sharp(data, { raw: info }).extract(bounds);
    expectedPixels = await contentImage.clone().raw().toBuffer();
    const content = await contentImage.png().toBuffer();
    const edge = Math.ceil(Math.max(bounds.width, bounds.height) / 0.84);
    frame = {
      left: Math.floor((edge - bounds.width) / 2),
      top: Math.floor((edge - bounds.height) / 2),
      width: edge,
      height: edge,
    };
    pipeline = sharp({ create: { width: edge, height: edge, channels: 3, background: "#fff" } })
      .composite([{ input: content, left: frame.left, top: frame.top }]);
    verificationCrop = { left: frame.left, top: frame.top, width: bounds.width, height: bounds.height };
  } else {
    expectedPixels = await pipeline.clone().raw().toBuffer();
    verificationCrop = { left: 0, top: 0, width: crop.width, height: crop.height };
  }

  const buffer = await pipeline.webp({ lossless: true, effort: 6 }).toBuffer();
  const decodedPixels = await sharp(buffer).extract(verificationCrop).removeAlpha().raw().toBuffer();
  if (!decodedPixels.equals(expectedPixels)) {
    throw new Error(`Lossless pixel verification failed: ${relative}`);
  }
  const outputRelative = relative.replace(/\.png$/i, ".webp");
  const destination = path.join(outputRoot, outputRelative);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, buffer);
  const outputMetadata = await sharp(buffer).metadata();
  assets.push({
    original: { ...provenance(original), publicPath: `/images/${relative}` },
    source: provenance(source),
    crop,
    contentBounds: bounds,
    touchesSourceFrame,
    frame,
    treatment: recipe ? "recovered-source-crop" : product ? "original-crop-reframed" : "lossless-conversion",
    pixelVerification: "passed",
    output: {
      publicPath: `/images/optimized/${outputRelative}`,
      file: outputRelative,
      width: outputMetadata.width,
      height: outputMetadata.height,
      bytes: buffer.length,
      sha256: createHash("sha256").update(buffer).digest("hex"),
    },
  });
}

if (usedRecipes.size !== recipes.size) throw new Error("Some crop recipes do not match an original image.");
if (!assets.length) throw new Error("No source PNGs were found.");
const originalBytes = assets.reduce((sum, asset) => sum + asset.original.bytes, 0);
const outputBytes = assets.reduce((sum, asset) => sum + asset.output.bytes, 0);
const manifest = {
  version: 1,
  policy: {
    productFraming: "Square white canvas; longest content edge occupies at most 84%; no resampling or upscaling.",
    encoding: "Lossless WebP; source pixels, labels and embedded watermarks retained.",
    limitations: "Screenshot resolution is unchanged. Existing product associations are not independently manufacturer-verified. No AI generation.",
  },
  totals: { images: assets.length, recoveredCrops: usedRecipes.size, originalBytes, outputBytes },
  assets,
};
await mkdir(outputRoot, { recursive: true });
await writeFile(path.join(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ output: outputRoot, ...manifest.totals }, null, 2));
