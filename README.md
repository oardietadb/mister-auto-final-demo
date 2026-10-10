# Mister Auto — démo e-commerce

Démo responsive d’une boutique française de pièces automobiles, inspirée des captures de référence du dépôt. Réalisée avec Next.js 15 App Router, React, TypeScript et Tailwind CSS 4.

## Démarrer

```bash
npm install
npm run dev
```

La démo est disponible sur `http://localhost:3000`. Pour vérifier la compilation de production et le lint :

```bash
npm run build
npm run lint
```

## Parcours inclus

- Accueil, catégories, fiches produit, résultats de recherche, garage véhicule et panier.
- Pages de connexion et création de compte distinctes pour les particuliers et les professionnels.
- Données de catalogue locales et typées dans `src/lib/catalog.ts`.
- Panier et véhicule conservés localement via un dépôt réutilisable (`src/lib/persistence.ts`).
- Compte de démonstration distinct particulier/PRO derrière un adaptateur (`src/lib/auth.ts`).
- Interface d’événements typée dans `src/lib/analytics.ts`, sans SDK externe.

L’authentification, les codes promo, les disponibilités et la validation de commande sont des simulations locales : ne saisissez pas de vrais identifiants et aucun paiement ni commande n’est transmis. Aucun mot de passe n’est persisté. Les intégrations Adobe ne sont pas incluses.