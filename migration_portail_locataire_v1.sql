-- ============================================================
-- MIGRATION : Portail Locataire V1 (Lien magique)
-- Date      : 2026-08-05
-- ============================================================

-- 1. Ajout du token d'accès unique (Lien Magique) pour chaque locataire
ALTER TABLE public.locataires 
ADD COLUMN IF NOT EXISTS access_token uuid DEFAULT gen_random_uuid() UNIQUE;

-- Assurer que tous les locataires existants reçoivent un token unique
UPDATE public.locataires SET access_token = gen_random_uuid() WHERE access_token IS NULL;

-- 2. Modification de la contrainte (si nécessaire)
ALTER TABLE public.locataires ALTER COLUMN access_token SET NOT NULL;

-- 3. (Optionnel) Ajout d'une vue sécurisée pour le dashboard locataire si on utilise le client Supabase standard
-- NB: Dans l'application, nous utiliserons le 'service_role' dans un Server Component (Next.js)
-- pour récupérer les données grâce au token. Cela évite d'ouvrir le RLS public basé sur le token.
