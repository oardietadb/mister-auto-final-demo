# Audit des images produit

Audit mis à jour le 13 octobre 2026.

## Images issues des captures de catégories

Les vignettes locales sont des recadrages de produits visibles dans les captures conservées à la racine du dépôt. Elles sont associées aux fiches du catalogue dans `src/lib/catalog.ts` et utilisées sur les cartes produit, les fiches détaillées et le panier. Les fichiers sources n’ont pas été modifiés.

| Catégorie | Produits illustrés | Capture source | Dossier des recadrages |
| --- | ---: | --- | --- |
| Batteries | 14 | [`batteries.png`](../batteries.png) | `public/images/products/batteries/` |
| Freinage | 20 | [`frinage.png`](../frinage.png) | `public/images/products/freinage/` |
| Pneus | 4 | [`pneus.png`](../pneus.png) | `public/images/products/pneus/` |
| Huile moteur | 7 | [`screencapture-mister-auto-huile-moteur-3224-g-2026-10-10-17_34_59.png`](../screencapture-mister-auto-huile-moteur-3224-g-2026-10-10-17_34_59.png) | `public/images/products/huile-moteur/` |
| Accessoires | 8 | [`screencapture-mister-auto-accessoire-auto-2026-10-10-17_35_36.png`](../screencapture-mister-auto-accessoire-auto-2026-10-10-17_35_36.png) | `public/images/products/accessoires/` |

Les références, marques et prix ne sont renseignés que lorsqu’ils sont lisibles dans la capture. Une référence absente est affichée comme non indiquée ; un prix illisible ou une offre sans prix est présenté comme indisponible, jamais comme un prix nul. Les extraits reprennent les visuels réels des cartes de référence ; leur taille et leur cadrage peuvent différer selon la capture source.

Les anciennes fiches de démonstration remplacées pour ces catégories restent dans le catalogue afin de préserver les URL produit déjà publiées, mais elles ne sont plus visibles dans les listes. La capture Freinage couvre les plaquettes : les anciennes fiches de freinage (dont les disques) restent accessibles par leur URL, mais leur famille n’est pas publiée comme une sélection illustrée faute de capture de disques. Les visuels batterie précédemment validés gardent le même comportement.

## Chaînes à neige

La capture [`chaines.png`](../chaines.png) est une page d’accueil de catégorie et ne montre pas de fiches SKU avec photos individuelles. Une image recadrée du bandeau est utilisée uniquement comme visuel de catégorie dans la bannière de listing (`public/images/categories/chaines-neige-reference.png`). Elle n’est pas attribuée aux produits individuels : leurs images restent non appariées tant qu’une capture de listing produit n’est pas disponible.

Le fichier `product-image-audit.json` contient l’état par fiche produit, le chemin local de l’image et la source de capture associée. Aucun visuel distant ni aucune photo d’un autre produit n’est réutilisé comme substitut.
