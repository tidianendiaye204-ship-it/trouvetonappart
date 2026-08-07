-- ============================================================
-- MIGRATION : Système de Confiance V2 & Statuts 
-- Date      : 2026-08-07
-- ============================================================

-- 1. Ajout de la notion de type de compte sur les profils pour différencier Agence et Particulier
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS type_compte text not null default 'particulier' check (type_compte in ('particulier', 'agence'));

-- 2. Mise à jour de la contrainte check sur le statut des biens pour inclure 'visite_en_cours'
-- Dans postgres, pour modifier un check constraint, il faut le recréer
ALTER TABLE public.biens DROP CONSTRAINT IF EXISTS biens_statut_check;
ALTER TABLE public.biens ADD CONSTRAINT biens_statut_check 
  CHECK (statut in ('disponible', 'visite_en_cours', 'reserve', 'loue', 'vendu'));
