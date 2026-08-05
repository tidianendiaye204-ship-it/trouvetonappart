-- ============================================================
-- MIGRATION : Mode Multi-Utilisateurs (Agences)
-- Date      : 2026-08-05
-- ============================================================

-- 1. Table des Organisations (Agences)
CREATE TABLE IF NOT EXISTS public.agences (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- 2. Table des Membres
CREATE TABLE IF NOT EXISTS public.agence_membres (
  agence_id uuid not null references public.agences(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'agent' check (role in ('admin', 'agent', 'comptable', 'lecture_seule')),
  created_at timestamptz not null default now(),
  primary key (agence_id, user_id)
);

-- 3. Ajout de la liaison Agence sur les Biens
ALTER TABLE public.biens ADD COLUMN IF NOT EXISTS agence_id uuid references public.agences(id) on delete set null;

-- 4. Fonctions de sécurité (Security Definer pour contourner les limitations de RLS circulaires)
CREATE OR REPLACE FUNCTION public.is_agency_member(p_agence_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.agence_membres 
    WHERE agence_id = p_agence_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Mise à jour des Politiques (RLS) sur les Biens
-- On supprime les anciennes pour les remplacer
DROP POLICY IF EXISTS "biens_select_publiques" ON public.biens;
DROP POLICY IF EXISTS "biens_insert_own" ON public.biens;
DROP POLICY IF EXISTS "biens_update_own" ON public.biens;
DROP POLICY IF EXISTS "biens_delete_own" ON public.biens;

CREATE POLICY "biens_select_access" ON public.biens
  FOR SELECT USING (
    publie = true 
    OR auth.uid() = proprietaire_id 
    OR (agence_id IS NOT NULL AND public.is_agency_member(agence_id))
  );

CREATE POLICY "biens_insert_access" ON public.biens
  FOR INSERT WITH CHECK (
    auth.uid() = proprietaire_id 
    -- Seul le proprio direct ou l'app (via service role) insère.
    -- L'agent pourrait insérer au nom de l'agence si agence_id est fourni, 
    -- on le permet si l'agent est membre.
    OR (agence_id IS NOT NULL AND public.is_agency_member(agence_id))
  );

CREATE POLICY "biens_update_access" ON public.biens
  FOR UPDATE USING (
    auth.uid() = proprietaire_id 
    OR (agence_id IS NOT NULL AND public.is_agency_member(agence_id))
  );

CREATE POLICY "biens_delete_access" ON public.biens
  FOR DELETE USING (
    auth.uid() = proprietaire_id 
    OR (
      agence_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.agence_membres 
        WHERE agence_id = public.biens.agence_id 
        AND user_id = auth.uid() 
        AND role = 'admin' -- Seul un admin de l'agence peut supprimer
      )
    )
  );

-- RLS sur les tables agences et membres
ALTER TABLE public.agences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agence_membres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agences_select" ON public.agences
  FOR SELECT USING (public.is_agency_member(id));

CREATE POLICY "agences_membres_select" ON public.agence_membres
  FOR SELECT USING (public.is_agency_member(agence_id));
