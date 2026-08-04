-- ============================================
-- SCHEMA V1 : Mise en relation (annonces + recherche + carte)
-- La gestion locative (locataires/paiements) sera ajoutée en V2
-- ============================================

-- 1. PROFILS (extension de auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'proprietaire' check (role in ('proprietaire', 'chercheur', 'admin')),
  nom text not null,
  telephone text,
  abonnement_actif boolean not null default false,
  date_debut_abonnement timestamptz,
  created_at timestamptz not null default now()
);

-- 2. BIENS (annonces : terrains, maisons, appartements)
create table public.biens (
  id uuid primary key default gen_random_uuid(),
  proprietaire_id uuid not null references public.profiles(id) on delete cascade,
  titre text not null,
  type text not null check (type in ('terrain', 'maison', 'appartement')),
  transaction text not null check (transaction in ('location', 'vente')),
  description text,
  adresse text,
  quartier text,
  ville text,
  latitude double precision,
  longitude double precision,
  prix numeric(12,2) not null,
  superficie numeric(10,2), -- en m², utile pour les terrains
  nb_chambres int,
  statut text not null default 'disponible' check (statut in ('disponible', 'reserve', 'loue', 'vendu')),
  publie boolean not null default false, -- annonce visible publiquement ou pas
  sponsorise_jusqu_a timestamptz, -- Date d'expiration de la sponsorisation
  created_at timestamptz not null default now()
);

-- 3. IMAGES DES BIENS
create table public.biens_images (
  id uuid primary key default gen_random_uuid(),
  bien_id uuid not null references public.biens(id) on delete cascade,
  url text not null,
  ordre int not null default 0,
  created_at timestamptz not null default now()
);

-- 4. CONTACTS / DEMANDES (quand un chercheur veut contacter un propriétaire)
create table public.contacts_demandes (
  id uuid primary key default gen_random_uuid(),
  bien_id uuid not null references public.biens(id) on delete cascade,
  nom_demandeur text not null,
  telephone_demandeur text not null,
  message text,
  statut text not null default 'nouveau' check (statut in ('nouveau', 'a_relancer', 'visite_planifiee', 'converti', 'perdu')),
  notes_privees text,
  date_dernier_contact timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================
-- INDEXES utiles
-- ============================================
create index idx_biens_proprietaire on public.biens(proprietaire_id);
create index idx_biens_statut on public.biens(statut) where publie = true;
create index idx_biens_type on public.biens(type);
create index idx_biens_ville on public.biens(ville);
create index idx_biens_images_bien on public.biens_images(bien_id);
create index idx_contacts_bien on public.contacts_demandes(bien_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
alter table public.profiles enable row level security;
alter table public.biens enable row level security;
alter table public.biens_images enable row level security;
alter table public.contacts_demandes enable row level security;

-- PROFILES
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- BIENS : tout le monde peut voir les annonces publiées, seul le proprio gère les siennes
create policy "biens_select_publiques" on public.biens
  for select using (publie = true or auth.uid() = proprietaire_id);

create policy "biens_insert_own" on public.biens
  for insert with check (auth.uid() = proprietaire_id);

create policy "biens_update_own" on public.biens
  for update using (auth.uid() = proprietaire_id);

create policy "biens_delete_own" on public.biens
  for delete using (auth.uid() = proprietaire_id);

-- BIENS_IMAGES : visibles si le bien est publié, gérables par le proprio
create policy "biens_images_select" on public.biens_images
  for select using (
    exists (select 1 from public.biens b where b.id = bien_id and (b.publie = true or b.proprietaire_id = auth.uid()))
  );

create policy "biens_images_insert_own" on public.biens_images
  for insert with check (
    exists (select 1 from public.biens b where b.id = bien_id and b.proprietaire_id = auth.uid())
  );

create policy "biens_images_delete_own" on public.biens_images
  for delete using (
    exists (select 1 from public.biens b where b.id = bien_id and b.proprietaire_id = auth.uid())
  );

-- CONTACTS_DEMANDES : Le backend Next.js insère les données (avec service_role).
-- Les utilisateurs publics ne peuvent pas insérer directement pour éviter le spam.
-- Seul le proprio du bien concerné peut les lire.
create policy "contacts_select_own" on public.contacts_demandes
  for select using (
    exists (select 1 from public.biens b where b.id = bien_id and b.proprietaire_id = auth.uid())
  );

create policy "contacts_update_own" on public.contacts_demandes
  for update using (
    exists (select 1 from public.biens b where b.id = bien_id and b.proprietaire_id = auth.uid())
  );

-- ============================================
-- TRIGGER : création auto du profil à l'inscription
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nom)
  values (new.id, coalesce(new.raw_user_meta_data->>'nom', 'Nouvel utilisateur'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- STORAGE BUCKET pour les images (à créer via l'UI Supabase ou en SQL)
-- ============================================
-- insert into storage.buckets (id, name, public) values ('biens-images', 'biens-images', true);

-- ============================================
-- SCHEMA V2 : Gestion Locative (SaaS Propriétaire)
-- ============================================

-- 5. LOCATAIRES (Répertoire de contacts du propriétaire)
create table public.locataires (
  id uuid primary key default gen_random_uuid(),
  proprietaire_id uuid not null references public.profiles(id) on delete cascade,
  prenom text not null,
  nom text not null,
  email text,
  telephone text not null,
  cni text,
  notes text,
  created_at timestamptz not null default now()
);

-- 6. BAUX (Contrats de location)
create table public.baux (
  id uuid primary key default gen_random_uuid(),
  bien_id uuid not null references public.biens(id) on delete restrict,
  locataire_id uuid not null references public.locataires(id) on delete restrict,
  date_debut date not null,
  date_fin date,
  loyer_mensuel numeric(10,2) not null,
  statut text not null default 'actif' check (statut in ('actif', 'termine', 'resilie')),
  created_at timestamptz not null default now()
);

-- 7. PAIEMENTS (Suivi des loyers)
create table public.paiements (
  id uuid primary key default gen_random_uuid(),
  bail_id uuid not null references public.baux(id) on delete cascade,
  mois int not null check (mois >= 1 and mois <= 12),
  annee int not null,
  montant numeric(10,2) not null,
  date_paiement date,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'paye', 'en_retard')),
  created_at timestamptz not null default now()
);

-- INDEXES V2
create index idx_locataires_proprietaire on public.locataires(proprietaire_id);
create index idx_baux_bien on public.baux(bien_id);
create index idx_baux_locataire on public.baux(locataire_id);
create index idx_paiements_bail on public.paiements(bail_id);

-- RLS V2
alter table public.locataires enable row level security;
alter table public.baux enable row level security;
alter table public.paiements enable row level security;

-- Locataires RLS
create policy "locataires_select_own" on public.locataires
  for select using (auth.uid() = proprietaire_id);
create policy "locataires_insert_own" on public.locataires
  for insert with check (auth.uid() = proprietaire_id);
create policy "locataires_update_own" on public.locataires
  for update using (auth.uid() = proprietaire_id);
create policy "locataires_delete_own" on public.locataires
  for delete using (auth.uid() = proprietaire_id);

-- Baux RLS
create policy "baux_select_own" on public.baux
  for select using (
    exists (select 1 from public.biens b where b.id = bien_id and b.proprietaire_id = auth.uid())
  );
create policy "baux_insert_own" on public.baux
  for insert with check (
    exists (select 1 from public.biens b where b.id = bien_id and b.proprietaire_id = auth.uid())
  );
create policy "baux_update_own" on public.baux
  for update using (
    exists (select 1 from public.biens b where b.id = bien_id and b.proprietaire_id = auth.uid())
  );
create policy "baux_delete_own" on public.baux
  for delete using (
    exists (select 1 from public.biens b where b.id = bien_id and b.proprietaire_id = auth.uid())
  );

-- Paiements RLS
create policy "paiements_select_own" on public.paiements
  for select using (
    exists (select 1 from public.baux bx join public.biens b on bx.bien_id = b.id where bx.id = bail_id and b.proprietaire_id = auth.uid())
  );
create policy "paiements_insert_own" on public.paiements
  for insert with check (
    exists (select 1 from public.baux bx join public.biens b on bx.bien_id = b.id where bx.id = bail_id and b.proprietaire_id = auth.uid())
  );
create policy "paiements_update_own" on public.paiements
  for update using (
    exists (select 1 from public.baux bx join public.biens b on bx.bien_id = b.id where bx.id = bail_id and b.proprietaire_id = auth.uid())
  );
create policy "paiements_delete_own" on public.paiements
  for delete using (
    exists (select 1 from public.baux bx join public.biens b on bx.bien_id = b.id where bx.id = bail_id and b.proprietaire_id = auth.uid())
  );

-- ============================================
-- 8. RPC (Remote Procedure Call) pour la génération paresseuse
-- ============================================
create or replace function public.generer_paiements_automatiques(p_proprietaire_id uuid)
returns void as $$
declare
  v_mois_courant int := extract(month from current_date);
  v_annee_courante int := extract(year from current_date);
  v_jour_courant int := extract(day from current_date);
begin
  -- 1. Générer les paiements manquants pour le mois courant
  insert into public.paiements (bail_id, mois, annee, montant, statut)
  select 
    bx.id,
    v_mois_courant,
    v_annee_courante,
    bx.loyer_mensuel,
    'en_attente'
  from public.baux bx
  join public.biens b on b.id = bx.bien_id
  where b.proprietaire_id = p_proprietaire_id
    and bx.statut = 'actif'
    and bx.date_debut <= current_date
    and (bx.date_fin is null or bx.date_fin >= current_date)
    and not exists (
      select 1 from public.paiements p
      where p.bail_id = bx.id
        and p.mois = v_mois_courant
        and p.annee = v_annee_courante
    );

  -- 2. Mettre à jour les paiements 'en_attente' vers 'en_retard'
  -- Retard si mois précédent ou si on est > 10 du mois courant
  update public.paiements p
  set statut = 'en_retard'
  from public.baux bx
  join public.biens b on b.id = bx.bien_id
  where p.bail_id = bx.id
    and b.proprietaire_id = p_proprietaire_id
    and p.statut = 'en_attente'
    and (
      (p.annee < v_annee_courante)
      or 
      (p.annee = v_annee_courante and p.mois < v_mois_courant)
      or
      (p.annee = v_annee_courante and p.mois = v_mois_courant and v_jour_courant > 10)
    );
end;
$$ language plpgsql security definer;