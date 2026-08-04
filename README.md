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
