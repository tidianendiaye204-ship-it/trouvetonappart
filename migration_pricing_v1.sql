-- ============================================================
-- MIGRATION : Ajout des Plans Pricing (Feature Gating)
-- Date      : 2026-08-05
-- Dépend de : schema.sql (table profiles)
-- ============================================================

-- Ajout des colonnes pour la gestion de l'abonnement
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS plan_nom text default 'gratuit' check (plan_nom in ('gratuit', 'solo', 'pro', 'business')),
  ADD COLUMN IF NOT EXISTS billing_period text default 'monthly' check (billing_period in ('monthly', 'yearly')),
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

-- Note : abonnement_actif (boolean) existe déjà dans schema.sql
-- On peut considérer qu'un utilisateur a abonnement_actif=false mais un plan_nom='gratuit'.
-- Si abonnement_actif=true, alors le plan_nom dicte les limites.
