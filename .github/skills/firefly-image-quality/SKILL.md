---
name: firefly-image-quality
description: Audit and improve Mister Auto website images, prepare Adobe Firefly workflows, and review product-photo fidelity. Use for blurry product photos, image resolution, image enhancement, Firefly, upscaling, backgrounds, and image-quality reviews. This is a project-authored workflow, not an official Adobe connector.
---

# Mister Auto image quality with Adobe Firefly

Improve image presentation without misrepresenting the product being sold.
This skill supplies instructions and a local audit tool. It does not install an
MCP server, authenticate to Adobe, or grant Firefly API access.

## Establish the actual connection

Distinguish these states explicitly:

- **Web access only:** the user can use firefly.adobe.com. This does not prove
  API access, even when the page shows available generation credits.
- **API available but unverified:** the user has Firefly Services credentials
  from Adobe Developer Console, but no authenticated operation has succeeded.
- **API verified:** an authorized operation against the requested Adobe API
  succeeded in this environment. Name the operation and its result.

Never report "Firefly connected" from a screenshot, a skill installation,
environment-variable presence, or an untested MCP entry.

Do not request passwords, cookies, Client Secrets, or access tokens in chat.
Never copy credentials into source files, reports, commits, or client-side code.
Do not use a browser session as a substitute for API authentication.

## Audit before editing

1. Read `docs/product-image-audit.md`, `docs/product-image-audit.json`,
   `public/images/products/README.md`, and the relevant entries in
   `src/lib/catalog.ts`.
2. Run from the repository root:

   ```bash
   node .github/skills/firefly-image-quality/scripts/audit-pngs.mjs
   ```

   The tool reads local PNG metadata only and prints JSON to stdout. It does
   not upload images, change files, or use Adobe credits. Its thresholds are
   conservative review targets, not guarantees of visual quality. Other
   formats are counted separately, not assessed.
3. Inspect both the source and its actual rendered size. Distinguish a
   low-resolution original from incorrect CSS sizing, excess whitespace,
   compression, cropping, or a screenshot containing UI fragments.
4. Prioritize images visible on the homepage and product details. Report the
   source dimensions, displayed dimensions, affected surfaces, and proposed
   action. Keep scratch reports outside the repository unless requested.

For this repository's existing screenshots, prepare reversible local candidates:

```bash
npm run images:prepare -- --out /tmp/mister-auto-image-review
```

The reviewed crop recipes are in `scripts/prepare-images.mjs`. They recover
photographic areas, center product pixels on white square canvases without
resampling, and encode lossless WebP. The manifest records source hashes,
coordinates, dimensions, file sizes, and exact decoded-pixel verification.
Review these coordinates again if a source screenshot changes. They preserve
existing catalogue associations, not independent manufacturer verification.
Do not integrate this output before visual approval.

The existing product thumbnails were cropped from reference screenshots.
Their pixels do not contain the detail of an original manufacturer photograph.
Prefer an authorized, reference-matched high-resolution original before
attempting enhancement.

## Choose the safe treatment

### Product photographs

- Preserve the exact SKU, geometry, dimensions, terminals, tread, connectors,
  packaging, labels, logos, and printed specifications.
- Never generate a substitute product photograph and present it as an exact
  reference match. Never invent details to make a crop appear sharper.
- Prefer better source material, correct sizing, lossless cropping, whitespace
  adjustment, or reversible presentation fixes.
- Treat AI upscaling and background removal as candidates requiring review,
  not fidelity-preserving operations. Compare labels and fine details with the
  original. Reject any altered product detail.
- Do not erase watermarks or reconstruct missing labels or branding.
- If the source cannot support a faithful result, report "HD source required".
  Leave an existing unavailable-image state intact instead of substituting a
  photograph of another product.

### Editorial and campaign imagery

Firefly may help create backgrounds or non-SKU-specific editorial imagery when
the user approves the purpose. Keep actual product cutouts separate from
generated scenery. Do not generate promotional prices, discounts, ratings,
logos, factual claims, or UI text inside an image.

## Firefly execution

### With web access only

Prepare a brief containing the approved source, destination surface, aspect
ratio, target dimensions, and a proposed prompt. Explain which steps the user
must perform in Firefly, then wait for the exported result. Do not claim to have
generated, enhanced, or downloaded a result that does not exist.

For background-only work, a starting prompt is:

> Create a clean automotive editorial background with ample empty space for
> separately composited product photography. No products, text, logos, prices,
> ratings, or watermarks. Do not recreate the supplied product.

Adapt the brief to the existing Mister Auto references; do not silently change
the visual identity.

### With an authorized API connection

Before implementing or using an API workflow, verify the current operation,
authentication requirements, supported inputs, limits, retention terms, and
credit implications in official Adobe documentation:

- https://developer.adobe.com/firefly-services/docs/guides/
- https://developer.adobe.com/firefly-services/docs/firefly-api/guides/

Firefly Services requires a suitable API entitlement and server-side
credentials; web-app credits alone are not sufficient evidence. Do not guess
an upscale endpoint or assume every feature in the web app is in the API.

Obtain approval for the source files, their transfer to Adobe, and the bounded
number of paid operations before submitting anything. Send only authorized,
non-sensitive image assets: never repository code, environment files, account
data, or credentials. Stop on authentication, entitlement, rate-limit, or
billing errors and report the failure; do not retry generation indefinitely.

Do not add Firefly calls to the storefront, automatic builds, or customer
requests. Asset preparation belongs to a separate development workflow.

## Review and integrate

1. Keep originals unchanged. Stage candidates outside the repository until
   the user approves a side-by-side comparison.
2. Check fidelity, edge artifacts, legible existing labels, natural shadows,
   resolution, file size, aspect ratio, and desktop/mobile rendering.
3. After approval, integrate only the selected assets. Preserve product URLs,
   image provenance, accessibility text, `next/image` sizing, and unavailable
   states. Update the existing image audit when an asset or its source changes;
   a generated derivative must not be relabeled as a verified original.
4. Run the smallest relevant checks. Run `npm run build` when changing runtime
   image imports or catalogue entries, and inspect affected rendered surfaces.
5. Report separately what was audited, proposed, actually processed, approved,
   and integrated. Do not merge or deploy changes without authorization.
