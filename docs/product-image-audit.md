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

## Audit visuel et candidats standardisés

**État : candidats validés visuellement puis intégrés au site.** Les dérivés sont conservés dans `public/images/optimized/`, séparément des originaux. Leur publication sur Vercel nécessite la fusion et le déploiement de ces modifications.

L’inventaire couvre 60 PNG : 53 produits, six bandeaux et un visuel de catégorie. Le SVG d’indisponibilité reste volontairement inchangé. Les seuils de résolution du script d’audit signalent des images à examiner, pas des images nécessairement défectueuses.

L’examen des captures originales révèle des erreurs de recadrage importantes dans les vignettes de freinage et d’huile : bordures et fonds de cartes conservés, pièces coupées, schémas techniques incomplets et bidons tronqués. Les pneus contiennent aussi des fragments des logos placés dans le pied des cartes. Ces éléments d’interface sont distincts des logos, inscriptions et filigranes présents dans les photographies, qui sont conservés.

Le script `scripts/prepare-images.mjs` réextrait les 53 zones photographiques depuis les captures locales, en conservant les associations du catalogue existant. Il ne constitue pas une vérification indépendante des références auprès des fabricants ; les associations et les références incertaines doivent être vérifiées avant un usage commercial.

Pour les produits, seuls les pixels strictement blancs autour du contenu sont retirés. Le contenu est ensuite centré sur un carré blanc et occupe au maximum 84 % de son côté. Aucun pixel produit n’est redimensionné, accentué ou inventé. Les bandeaux et le visuel de catégorie conservent leur cadrage et leurs dimensions. Tous les candidats sont encodés en WebP sans perte ; le script vérifie que les pixels décodés correspondent exactement au contenu source retenu.

| Groupe | Images | PNG actuels | Candidats WebP |
| --- | ---: | ---: | ---: |
| Produits | 53 | 730 999 octets | 438 918 octets |
| Bandeaux | 6 | 1 542 558 octets | 856 352 octets |
| Catégorie | 1 | 279 612 octets | 137 434 octets |
| Total | 60 | 2 553 169 octets | 1 432 704 octets |

Le gain est d’environ 44 % sur ces fichiers sources. Il ne prédit pas le gain réseau du site, qui utilise déjà l’optimisation de `next/image`.

### Reproduction et provenance

```bash
npm run images:prepare -- --out /tmp/mister-auto-image-review
```

Utiliser d’abord un dossier de revue hors du dépôt. Le script refuse les destinations internes au dépôt, sauf `public/images/optimized`, réservé à une intégration après validation. Il ne modifie jamais les PNG ni les captures originales. Après validation, régénérer les fichiers approuvés avec `npm run images:prepare -- --out public/images/optimized`.

Le dossier de sortie contient les WebP et `manifest.json` : chemins d’origine et de sortie, dimensions, coordonnées de recadrage, boîte de contenu, marges, poids, empreintes SHA-256 et résultat de la comparaison des pixels. Les coordonnées sont liées aux captures actuelles ; une nouvelle capture nécessite de revoir ces recettes, pas de réutiliser aveuglément les mêmes positions.

Les chemins explicites du catalogue alimentent l’accueil, les catégories, les listes, les fiches, le panier et les URL image des événements analytiques. L’audit JSON conserve les URL des captures originales et référence désormais les dérivés. Les vignettes produit, dont les carrés natifs ne dépassent pas 241 px, utilisent `next/image` avec `unoptimized` pour éviter une deuxième compression destructive ; dimensions, chargement différé et textes alternatifs restent définis. Les bandeaux et illustrations de catégorie gardent l’optimisation responsive de Next.js. Réévaluer cette stratégie lors de l’arrivée de véritables photos HD.

### Limites à conserver

Les photographies des captures ne contiennent que quelques dizaines à quelques centaines de pixels par axe. Ajouter un grand canevas ou interpoler ces pixels ne donnerait pas de véritables photos HD. Certaines photos d’accessoires sont déjà tronquées dans la capture elle-même ; leur cadrage complet exige un original autorisé. `touchesSourceFrame` signale un contenu qui atteint le bord de la zone source, y compris d’éventuels pixels de compression très pâles : c’est un indicateur de revue, pas une preuve de troncature.

Les visuels très pâles des produits indisponibles sont repris tels quels. Aucune étiquette, marque, cote technique ou partie de produit manquante n’est reconstruite. Les chaînes sans photo SKU restent sans photo SKU.

Les anciennes fiches batterie ajoutaient 135 px de marge autour de leur photo. Cette règle a été supprimée sur desktop et mobile : toutes les fiches utilisent désormais la même marge CSS de 16 px, en plus du cadrage blanc intégré au fichier. La zone de l’image est centrée et limitée à 320 px par axe pour ne pas étirer ces petites sources sur toute une colonne desktop. Les proportions carrées sont également déclarées sur les vignettes produit.

Aucune image n’a été envoyée à Adobe et aucune génération Firefly n’a été exécutée. L’accès à l’application web ne prouve pas l’accès aux API Firefly Services. Pour les photos SKU, la prochaine amélioration de résolution doit privilégier des originaux fabricant autorisés et correctement appariés.
