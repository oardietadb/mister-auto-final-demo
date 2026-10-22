import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const imageDirectory = path.join(root, "public", "images");
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const otherFormats = new Map();

async function collectPngs(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, "en"))) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectPngs(file));
    } else if (entry.isFile()) {
      const extension = path.extname(entry.name).toLowerCase();
      if (extension === ".png") files.push(file);
      else if ([".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"].includes(extension)) {
        otherFormats.set(extension, (otherFormats.get(extension) ?? 0) + 1);
      }
    }
  }
  return files;
}

async function audit(file) {
  const bytes = await readFile(file);
  if (bytes.length < 33 || !bytes.subarray(0, 8).equals(signature)
    || bytes.readUInt32BE(8) !== 13 || bytes.toString("ascii", 12, 16) !== "IHDR") {
    throw new Error(`Invalid PNG header: ${path.relative(root, file)}`);
  }
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (!width || !height) throw new Error(`Invalid PNG dimensions: ${path.relative(root, file)}`);
  const relative = path.relative(imageDirectory, file).split(path.sep).join("/");
  const kind = relative.startsWith("products/") ? "product"
    : relative.startsWith("banners/") ? "banner" : "category";
  const target = kind === "product" ? 960 : kind === "banner" ? 2360 : 400;
  const sourceEdge = kind === "banner" ? width : Math.max(width, height);
  return {
    path: `public/images/${relative}`,
    kind,
    width,
    height,
    bytes: bytes.length,
    reviewTargetPixels: target,
    measuredAxis: kind === "banner" ? "width" : "longestEdge",
    belowReviewTarget: sourceEdge < target,
    recommendation: sourceEdge < target
      ? "Review rendered size; prefer an authorized higher-resolution original. AI cannot guarantee missing product detail."
      : "Review visual fidelity, crop, and file size at the actual rendered dimensions.",
  };
}

try {
  const files = await collectPngs(imageDirectory);
  if (!files.length) throw new Error("No PNG assets found in public/images; run from the repository root.");
  const images = await Promise.all(files.map(audit));
  console.log(JSON.stringify({
    scope: "Local PNG metadata only; no uploads, generation, or modifications.",
    targets: {
      product: "960px longest edge: conservative target for a 480px detail view at DPR 2.",
      banner: "2360px width: conservative target for a 1180px banner at DPR 2.",
      category: "400px longest edge: conservative target for a 200px tile at DPR 2.",
    },
    pngCount: images.length,
    belowReviewTargetCount: images.filter((image) => image.belowReviewTarget).length,
    otherImageFormatsNotAudited: Object.fromEntries(otherFormats),
    images,
  }, null, 2));
} catch (error) {
  console.error(`Image audit failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
