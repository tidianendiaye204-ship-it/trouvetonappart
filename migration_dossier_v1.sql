-- ============================================================
-- MIGRATION : Dossier Locataire (Candidatures en ligne)
-- Date      : 2026-08-05
-- ============================================================

-- 1. Extension de la table contacts_demandes pour la gestion du dossier
ALTER TABLE public.contacts_demandes
ADD COLUMN IF NOT EXISTS dossier_statut text DEFAULT 'vide' CHECK (dossier_statut IN ('vide', 'incomplet', 'en_revue', 'valide', 'refuse')),
ADD COLUMN IF NOT EXISTS dossier_score int DEFAULT 0,
ADD COLUMN IF NOT EXISTS dossier_token uuid DEFAULT gen_random_uuid() UNIQUE;

-- Assurer que tous les leads existants ont un token
UPDATE public.contacts_demandes SET dossier_token = gen_random_uuid() WHERE dossier_token IS NULL;
ALTER TABLE public.contacts_demandes ALTER COLUMN dossier_token SET NOT NULL;


-- 2. TABLE : dossiers_documents (Pièces justificatives)
CREATE TABLE IF NOT EXISTS public.dossiers_documents (
  id uuid primary key default gen_random_uuid(),
  demande_id uuid not null references public.contacts_demandes(id) on delete cascade,
  
  type_document text not null check (type_document in ('cni', 'contrat_travail', 'fiches_paie', 'garant_cni', 'garant_revenus', 'autre')),
  file_path text not null,
  
  statut_validation text not null default 'en_attente' check (statut_validation in ('en_attente', 'valide', 'rejete')),
  commentaire text,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS idx_dossiers_documents_demande ON public.dossiers_documents(demande_id);

-- RLS pour la base de données
ALTER TABLE public.dossiers_documents ENABLE ROW LEVEL SECURITY;

-- Le propriétaire du bien lié à la demande peut lire et modifier les documents
CREATE POLICY "dossiers_documents_select_own" ON public.dossiers_documents
  FOR SELECT USING (
    exists (
      select 1 from public.contacts_demandes d
      join public.biens b on d.bien_id = b.id
      where d.id = demande_id and b.proprietaire_id = auth.uid()
    )
  );

CREATE POLICY "dossiers_documents_update_own" ON public.dossiers_documents
  FOR UPDATE USING (
    exists (
      select 1 from public.contacts_demandes d
      join public.biens b on d.bien_id = b.id
      where d.id = demande_id and b.proprietaire_id = auth.uid()
    )
  );

-- TRIGGER pour updated_at
drop trigger if exists trg_dossiers_documents_updated_at on public.dossiers_documents;
create trigger trg_dossiers_documents_updated_at
  before update on public.dossiers_documents
  for each row execute function public.set_updated_at();


-- ============================================================
-- 3. STORAGE BUCKET PRIVE (dossiers-prives)
-- ============================================================
insert into storage.buckets (id, name, public) 
values ('dossiers-prives', 'dossiers-prives', false) 
on conflict do nothing;

-- Politique pour le Storage (Lecture)
-- Le propriétaire ne peut lire que les fichiers de ses candidats
create policy "Proprietaires peuvent lire les dossiers de leurs leads"
  on storage.objects for select
  using (
    bucket_id = 'dossiers-prives'
    and auth.uid() in (
      select b.proprietaire_id
      from public.contacts_demandes d
      join public.biens b on d.bien_id = b.id
      where d.id::text = (string_to_array(name, '/'))[1] -- Le nom du fichier sera demande_id/nom_fichier.pdf
    )
  );

-- NB: L'upload (INSERT) et la lecture par le candidat se feront via une route API avec service_role
-- car le candidat n'a pas de compte Auth (utilisation du token magique).
