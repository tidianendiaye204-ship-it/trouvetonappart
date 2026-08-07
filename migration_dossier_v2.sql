-- ============================================================
-- MIGRATION : Formulaire Prospect pour le Dossier Locataire
-- Date      : 2026-08-07
-- ============================================================

-- Ajout des champs du formulaire de candidature à la table contacts_demandes
ALTER TABLE public.contacts_demandes
ADD COLUMN IF NOT EXISTS email_demandeur text,
ADD COLUMN IF NOT EXISTS profession text,
ADD COLUMN IF NOT EXISTS revenu_mensuel numeric(12,2),
ADD COLUMN IF NOT EXISTS type_garant text,
ADD COLUMN IF NOT EXISTS type_piece text;

-- Mise à jour du schéma PostgreSQL pour autoriser Supabase à exposer ces colonnes
NOTIFY pgrst, 'reload schema';
