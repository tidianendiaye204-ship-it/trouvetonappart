-- MIGRATION: Transformation des Demandes de Contact en Mini-CRM

-- 1. Ajouter les nouvelles colonnes à la table contacts_demandes
ALTER TABLE public.contacts_demandes
ADD COLUMN IF NOT EXISTS statut text NOT NULL DEFAULT 'nouveau' CHECK (statut in ('nouveau', 'a_relancer', 'visite_planifiee', 'converti', 'perdu')),
ADD COLUMN IF NOT EXISTS notes_privees text,
ADD COLUMN IF NOT EXISTS date_dernier_contact timestamptz;

-- 2. Mettre à jour la Row Level Security (RLS) pour permettre aux propriétaires
-- de modifier (UPDATE) le statut et les notes de leurs propres prospects.
-- On supprime l'ancienne policy s'il y en avait une par sécurité, puis on la recrée.
DROP POLICY IF EXISTS "contacts_update_own" ON public.contacts_demandes;

CREATE POLICY "contacts_update_own" ON public.contacts_demandes
  FOR UPDATE USING (
    exists (select 1 from public.biens b where b.id = bien_id and b.proprietaire_id = auth.uid())
  );
