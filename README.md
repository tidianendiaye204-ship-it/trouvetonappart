# Trouve Ton Appartement

Une plateforme moderne de recherche de logements au Sénégal, connectant directement les propriétaires et les locataires.

## Stack Technique
- **Framework :** Next.js (App Router)
- **Base de données / Auth :** Supabase
- **Styling :** Tailwind CSS
- **Cartographie :** Leaflet (React-Leaflet)

## Prérequis
- Node.js (v18+)
- Un projet Supabase configuré

## Installation

1. Cloner le repository :
```bash
git clone <votre-url-github>
cd trouvetonappartement
```

2. Installer les dépendances :
```bash
npm install
```

- Pagination & filtres avancés (prix, localisation)
- Modération admin / validation

## Monétisation (Sponsorisation)

Le projet intègre un système complet de monétisation permettant aux propriétaires de payer pour mettre leurs annonces en avant :
- **Plans tarifaires** : 7 jours (2 500 CFA), 14 jours (4 500 CFA), 30 jours (8 900 CFA). Modifiables dans `lib/sponsoring/config.ts`.
- **Abstraction PSP** : Les paiements sont gérés via une couche abstraite `IPaymentProvider` (`lib/sponsoring/provider.ts`). 
- **Mode Mock** : Par défaut, le provider `mock` est activé, simulant un paiement réussi instantané (parfait pour le développement).
- **Dashboard** : Historique complet des transactions (`/mes-annonces/sponsorisations`) et agrégation des revenus.
- **Intégration PSP Réel** : Pour intégrer Wave, Orange Money ou PayDunya, il suffit de créer un nouveau provider implémentant `IPaymentProvider` et de configurer l'URL de webhook dans `app/api/sponsoring/webhook/route.ts`.

3. Configuration des variables d'environnement :
Créez un fichier `.env.local` à la racine du projet et ajoutez vos clés Supabase et Turnstile :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
NEXT_PUBLIC_TURNSTILE_SITE_KEY=votre_cle_turnstile
```

4. Lancer le serveur de développement :
```bash
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000) avec votre navigateur pour voir le résultat.

## Base de données
Les fichiers `schema.sql`, `security_migration.sql` et `crm_migration.sql` contiennent l'architecture de la base de données. Ils doivent être exécutés dans le SQL Editor de Supabase pour configurer les tables et les politiques de sécurité.
