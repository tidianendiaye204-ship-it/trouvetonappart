-- Migration : Ajouter les champs telephone et whatsapp à la table biens
-- À exécuter dans le SQL Editor de Supabase (https://supabase.com/dashboard)

ALTER TABLE public.biens ADD COLUMN IF NOT EXISTS telephone VARCHAR(20);
ALTER TABLE public.biens ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);
