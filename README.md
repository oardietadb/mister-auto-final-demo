# Mister Auto — démo e-commerce

Démo responsive d’une boutique française de pièces automobiles, inspirée des captures de référence du dépôt. Réalisée avec Next.js 15 App Router, React, TypeScript et Tailwind CSS 4.

## Démarrer

```bash
npm install
npm run dev
```

La boutique est disponible sur `http://localhost:3000`. Pour vérifier la compilation de production et le lint :

```bash
npm run build
npm run lint
```

## Parcours inclus

- Accueil, catégories, fiches produit, résultats de recherche, garage véhicule et panier.
- Pages de connexion, choix de compte et création de compte distinctes pour les particuliers et les professionnels.
- Catalogue local typé avec familles de produits et listes de références étoffées dans `src/lib/catalog.ts`.
- Panier et garage multi-véhicules conservés localement via un dépôt réutilisable (`src/lib/persistence.ts`). Le garage propose une sélection marque/modèle/motorisation ainsi que le kilométrage et la date du dernier contrôle technique ; ces données restent locales et ne sont pas encore synchronisées avec Supabase.
- Le profil de compte est également exposé côté navigateur sous `mister-auto-demo-user` (sans mot de passe), et `getCartDetails()` fournit les lignes du panier résolues depuis le catalogue ainsi que leurs URL absolues et les totaux.
- Avec les deux variables Supabase configurées, les comptes particuliers et professionnels sont gérés par Supabase Auth et les profils/consentements sont écrits dans Postgres. Sans configuration Supabase, la connexion et l’inscription fonctionnent en mode démo local via `mister-auto-demo-user`, sans appel aux API d’authentification et sans stockage de mot de passe.
- Abonnements newsletter et événements analytiques validés par les Route Handlers puis stockés dans Supabase.
- Événements front typés dans `src/lib/analytics.ts` et appels directs Adobe Tags via `src/lib/track.ts` ; aucun SDK Adobe n’est embarqué.

## Configurer Supabase

1. Créez un projet Supabase, puis appliquez `supabase/migrations/20261013080000_customer_data.sql` depuis le SQL Editor du projet.
2. Copiez `.env.example` vers `.env.local` et renseignez `NEXT_PUBLIC_SUPABASE_URL` et la clé publique `NEXT_PUBLIC_SUPABASE_ANON_KEY` (clé anon/publishable). Ne placez jamais une clé `service_role` dans le navigateur ou dans le dépôt.
3. Dans Supabase Auth > URL Configuration, configurez l’URL du site et autorisez les redirections `/auth/callback` utilisées par votre URL locale et votre domaine Vercel. Activez la confirmation d’adresse e-mail et configurez l’envoi SMTP avant d’utiliser l’inscription hors développement.
4. Ajoutez les deux mêmes variables d’environnement dans Vercel (Preview et Production), puis redéployez.

Les formulaires d’inscription B2C/B2B créent un compte Supabase Auth ; le mot de passe n’est jamais écrit dans `customer_profiles`. Un déclencheur SQL enregistre prénom, nom, type de compte, champs professionnels et consentements. La newsletter enregistre l’adresse et l’horodatage du consentement. Les événements `accountRegistration` et `newsletterSubscribe` ne contiennent pas d’adresse e-mail. Le statut d’abonnement reste à confirmer par e-mail : aucun outil d’envoi de campagnes ni e-mail de confirmation newsletter n’est configuré.

Supabase est facultatif pour la démo : si l’une des deux variables publiques manque, les formulaires de compte utilisent le profil local `mister-auto-demo-user` et les événements analytiques restent disponibles aux intégrations navigateur/Adobe Tags, sans appel à `/api/auth/*` ni `/api/events`.

Le panier et le garage restent locaux. Les événements sont conservés dans Supabase ; le panneau de démonstration des événements reste un aperçu temporaire en mémoire du processus. Les appels directs Adobe Tags sont documentés dans [`docs/event-architecture.md`](docs/event-architecture.md) ; aucun SDK ou endpoint Adobe n’est embarqué.