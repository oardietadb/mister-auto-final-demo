# Images produits

Les visuels sont des recadrages locaux de produits présentés dans les captures de référence conservées à la racine du dépôt :

- `batteries/` depuis `batteries.png` ;
- `freinage/` depuis `frinage.png` ;
- `pneus/` depuis `pneus.png` ;
- `huile-moteur/` depuis `screencapture-mister-auto-huile-moteur-3224-g-2026-10-10-17_34_59.png` ;
- `accessoires/` depuis `screencapture-mister-auto-accessoire-auto-2026-10-10-17_35_36.png`.

Le catalogue associe les recadrages aux fiches par une entrée produit explicite et stocke le chemin local, le texte alternatif et l’URL de la capture source. Les composants utilisent `next/image`. Les captures originales restent intactes.

Les PNG de ce dossier sont conservés comme originaux. Les visuels approuvés servis par le catalogue se trouvent dans `public/images/optimized/products/` : recadrage depuis les captures, fond blanc carré, proportions conservées, aucun agrandissement artificiel et WebP sans perte. `public/images/optimized/manifest.json` relie chaque dérivé à ses sources et coordonnées de recadrage. La préparation locale est reproductible avec `npm run images:prepare -- --out <dossier-de-revue-hors-du-depot>` ; voir `docs/product-image-audit.md` pour la validation, les limites et l’intégration.

`chaines.png` ne montre pas de liste de produits. Son bandeau est utilisé uniquement comme image de catégorie dans `public/images/categories/` ; il n’est pas présenté comme une photo d’une chaîne à neige référencée. Demander une capture de la liste des chaînes pour associer leurs images SKU.
