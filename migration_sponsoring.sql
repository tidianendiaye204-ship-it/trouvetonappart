-- ============================================================
-- MIGRATION : Monétisation de la Sponsorisation d'Annonces
-- Version   : 1.0
-- Date      : 2026-08-05
-- Dépend de : schema.sql (tables biens, profiles)
-- ============================================================

-- ============================================================
-- 1. TABLE : transactions_sponsoring
-- Cycle de vie d'une transaction de sponsorisation d'annonce.
-- statut : pending → paid | failed | expired
-- ============================================================
create table if not exists public.transactions_sponsoring (
  id                  uuid primary key default gen_random_uuid(),
  bien_id             uuid not null references public.biens(id) on delete cascade,
  proprietaire_id     uuid not null references public.profiles(id) on delete cascade,

  -- Plan choisi
  plan_jours          int not null check (plan_jours in (7, 14, 30)),
  montant             numeric(10, 2) not null check (montant > 0),

  -- Cycle de vie du paiement
  statut              text not null default 'pending'
                        check (statut in ('pending', 'paid', 'failed', 'expired')),

  -- Informations PSP
  provider            text not null default 'mock'
                        check (provider in ('mock', 'wave', 'orange_money', 'stripe')),
  reference_paiement  text unique,           -- Référence unique fournie par le PSP
  metadata_psp        jsonb default '{}',    -- Données brutes du PSP (webhook, etc.)

  -- Timestamps métier
  expires_at          timestamptz not null   -- TTL de la transaction pending (défaut : 30 min)
                        default (now() + interval '30 minutes'),
  paid_at             timestamptz,           -- Horodatage du paiement confirmé
  activated_at        timestamptz,           -- Horodatage d'activation de sponsorise_jusqu_a

  -- Audit
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ============================================================
-- 2. INDEXES pour les requêtes courantes
-- ============================================================
create index if not exists idx_trx_sponsoring_bien
  on public.transactions_sponsoring(bien_id);

create index if not exists idx_trx_sponsoring_proprietaire
  on public.transactions_sponsoring(proprietaire_id);

create index if not exists idx_trx_sponsoring_statut
  on public.transactions_sponsoring(statut);

create index if not exists idx_trx_sponsoring_reference
  on public.transactions_sponsoring(reference_paiement)
  where reference_paiement is not null;

-- Index partiel pour le nettoyage des pending expirés
create index if not exists idx_trx_sponsoring_expires
  on public.transactions_sponsoring(expires_at)
  where statut = 'pending';

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================
alter table public.transactions_sponsoring enable row level security;

-- Le propriétaire peut lire ses propres transactions
drop policy if exists "trx_sponsoring_select_own" on public.transactions_sponsoring;
create policy "trx_sponsoring_select_own" on public.transactions_sponsoring
  for select
  using (auth.uid() = proprietaire_id);

-- Le propriétaire peut créer une transaction pour ses biens uniquement
drop policy if exists "trx_sponsoring_insert_own" on public.transactions_sponsoring;
create policy "trx_sponsoring_insert_own" on public.transactions_sponsoring
  for insert
  with check (
    auth.uid() = proprietaire_id
    and exists (
      select 1 from public.biens b
      where b.id = bien_id
        and b.proprietaire_id = auth.uid()
    )
  );

-- Pas d'UPDATE direct par l'utilisateur (géré par service_role côté serveur)
-- La confirmation de paiement passe par une API Route avec service_role

-- ============================================================
-- 4. TRIGGER : mise à jour de updated_at automatique
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_trx_sponsoring_updated_at on public.transactions_sponsoring;
create trigger trg_trx_sponsoring_updated_at
  before update on public.transactions_sponsoring
  for each row execute function public.set_updated_at();

-- ============================================================
-- 5. FONCTION : Expiration des transactions pending dépassées
-- À appeler périodiquement (cron Supabase ou pg_cron).
-- ============================================================
create or replace function public.expire_old_sponsoring_transactions()
returns integer as $$
declare
  v_count integer;
begin
  update public.transactions_sponsoring
  set statut = 'expired', updated_at = now()
  where statut = 'pending'
    and expires_at < now();

  get diagnostics v_count = row_count;
  return v_count;
end;
$$ language plpgsql security definer;

-- ============================================================
-- 6. VUE : Sponsorisations actives par propriétaire
-- Pratique pour le dashboard.
-- ============================================================
create or replace view public.v_sponsorisations_actives with (security_invoker = on) as
  select
    ts.id,
    ts.proprietaire_id,
    ts.bien_id,
    b.titre as bien_titre,
    b.ville as bien_ville,
    ts.plan_jours,
    ts.montant,
    ts.provider,
    ts.reference_paiement,
    ts.paid_at,
    ts.activated_at,
    b.sponsorise_jusqu_a as expire_le
  from public.transactions_sponsoring ts
  join public.biens b on b.id = ts.bien_id
  where ts.statut = 'paid'
    and b.sponsorise_jusqu_a > now()
  order by ts.paid_at desc;

-- ============================================================
-- 7. VUE : Revenus sponsoring par propriétaire
-- ============================================================
create or replace view public.v_revenus_sponsoring with (security_invoker = on) as
  select
    ts.proprietaire_id,
    count(*) filter (where ts.statut = 'paid')           as total_transactions_payees,
    coalesce(sum(ts.montant) filter (where ts.statut = 'paid'), 0) as revenus_totaux,
    count(*) filter (
      where ts.statut = 'paid'
        and ts.paid_at >= date_trunc('month', current_date)
    ) as transactions_ce_mois,
    coalesce(sum(ts.montant) filter (
      where ts.statut = 'paid'
        and ts.paid_at >= date_trunc('month', current_date)
    ), 0) as revenus_ce_mois,
    count(*) filter (where ts.statut = 'pending')  as transactions_en_attente,
    count(*) filter (where ts.statut = 'failed')   as transactions_echouees
  from public.transactions_sponsoring ts
  group by ts.proprietaire_id;

-- ============================================================
-- FIN DE LA MIGRATION
-- Appliquer via : Supabase SQL Editor ou psql
-- ============================================================
