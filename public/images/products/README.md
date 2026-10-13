# Images produits

Les 14 visuels de batteries actuellement utilisés sont des recadrages individuels des photos produit visibles dans `batteries.png`, une capture de référence conservée à la racine du dépôt. Ils sont stockés dans `batteries/` et associés par référence dans `src/lib/catalog.ts`.

La capture source mesure 1920 × 6934 pixels ; chaque visuel recadré mesure 110 × 105 pixels, soit une définition adaptée aux vignettes de la page catégorie de référence. Les images sont servies depuis `public/` avec `next/image`, sans dépendance à une URL distante.

Pour ajouter d'autres catégories, fournir une capture de référence contenant les produits et conserver une correspondance contrôlable entre chaque produit visible, sa référence et son fichier recadré. Ne pas associer une photo sur la seule base de sa position dans une grille.
