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
- Pages de connexion, choix de compte et création de compte distinctes pour les particuliers et les professionnels.
- Catalogue local typé avec familles de produits et listes de références étoffées dans `src/lib/catalog.ts`.
- Panier, garage multi-véhicules et compte de démonstration conservés localement via un dépôt réutilisable (`src/lib/persistence.ts`).
- Compte de démonstration distinct particulier/PRO derrière un adaptateur (`src/lib/auth.ts`).
- Inscription newsletter et événements de démonstration validés par des Route Handlers.
- Interface d’événements typée dans `src/lib/analytics.ts`, sans SDK externe Adobe.

L’authentification, le garage, les codes promo, les disponibilités et la validation de commande sont des simulations : ne saisissez pas de vrais identifiants et aucun paiement ni commande n’est transmis. Aucun mot de passe n’est conservé. Les événements/newsletter utilisent uniquement un stockage temporaire en mémoire du processus, non adapté à la production. Aucune intégration Adobe n’est incluse. Voir [`docs/event-architecture.md`](docs/event-architecture.md) pour les limites et l’adaptateur externe désactivé par défaut.