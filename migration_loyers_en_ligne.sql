-- ============================================================
-- MIGRATION : Paiement de Loyer en Ligne
-- Version   : 1.0
-- Date      : 2026-08-05
-- Dépend de : schema.sql (tables baux, paiements, locataires, profils)
-- ============================================================

-- ============================================================
-- 1. Modification table paiements existante
-- ============================================================
-- On ajoute une colonne pour tracer la méthode de paiement (ex: especes, en_ligne)
alter table public.paiements 
  add column if not exists methode_paiement text default 'manuel' 
  check (methode_paiement in ('manuel', 'en_ligne', 'virement', 'cheque'));

-- ============================================================
-- 2. TABLE : transactions_loyers
-- Tracabilité des transactions initiées par les locataires en ligne.
-- ============================================================
create table if not exists public.transactions_loyers (
  id                  uuid primary key default gen_random_uuid(),
  paiement_id         uuid not null references public.paiements(id) on delete cascade,
  bail_id             uuid not null references public.baux(id) on delete cascade,
  locataire_id        uuid not null references public.locataires(id) on delete cascade,
  proprietaire_id     uuid not null references public.profiles(id) on delete cascade,

  -- Données financières
  montant             numeric(10, 2) not null check (montant > 0),

  -- Cycle de vie du paiement
  statut              text not null default 'pending'
                        check (statut in ('pending', 'paid', 'failed', 'refunded', 'expired')),

  -- Informations PSP
  provider            text not null default 'mock'
                        check (provider in ('mock', 'wave', 'orange_money', 'stripe', 'paydunya')),
  reference_paiement  text unique,           -- Référence unique fournie par le PSP
  metadata_psp        jsonb default '{}',    -- Données brutes du PSP

  -- Timestamps métier
  expires_at          timestamptz not null   -- TTL de la transaction pending (défaut : 30 min)
                        default (now() + interval '30 minutes'),
  paid_at             timestamptz,           -- Horodatage du paiement confirmé

  -- Audit
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ============================================================
-- 3. INDEXES
-- ============================================================
create index if not exists idx_trx_loyers_paiement on public.transactions_loyers(paiement_id);
create index if not exists idx_trx_loyers_bail on public.transactions_loyers(bail_id);
create index if not exists idx_trx_loyers_proprietaire on public.transactions_loyers(proprietaire_id);
create index if not exists idx_trx_loyers_statut on public.transactions_loyers(statut);
create index if not exists idx_trx_loyers_reference on public.transactions_loyers(reference_paiement) where reference_paiement is not null;

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================
alter table public.transactions_loyers enable row level security;

-- Le propriétaire peut lire les transactions liées à ses biens
drop policy if exists "trx_loyers_select_own" on public.transactions_loyers;
create policy "trx_loyers_select_own" on public.transactions_loyers
  for select
  using (auth.uid() = proprietaire_id);

-- L'insertion et l'update se feront via le service_role (API Routes)
-- car le locataire (qui n'a pas de compte auth) initiera la transaction.

-- ============================================================
-- 5. TRIGGER : mise à jour de updated_at automatique
-- ============================================================
drop trigger if exists trg_trx_loyers_updated_at on public.transactions_loyers;
create trigger trg_trx_loyers_updated_at
  before update on public.transactions_loyers
  for each row execute function public.set_updated_at();

-- ============================================================
-- FIN DE LA MIGRATION
-- ============================================================
