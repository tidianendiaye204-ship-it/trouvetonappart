-- ============================================
-- MIGRATION ADMIN V1
-- ============================================

-- 1. PROFILES : Ajout du statut_compte
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS statut_compte text NOT NULL DEFAULT 'actif' 
CHECK (statut_compte IN ('actif', 'suspendu'));

-- 2. BIENS : Ajout du statut_moderation
ALTER TABLE public.biens 
ADD COLUMN IF NOT EXISTS statut_moderation text NOT NULL DEFAULT 'valide' 
CHECK (statut_moderation IN ('en_attente', 'valide', 'rejete', 'suspendu'));

-- (Optionnel) on peut repasser les annonces existantes en 'valide' si on veut éviter qu'elles disparaissent, 
-- ce qui est fait par le DEFAULT 'valide' au-dessus.

-- 3. TABLE SIGNALEMENTS
CREATE TABLE IF NOT EXISTS public.signalements (
    id uuid primary key default gen_random_uuid(),
    bien_id uuid not null references public.biens(id) on delete cascade,
    -- Le profil_id peut être nul si on autorise les visiteurs non connectés à signaler
    profil_id uuid references public.profiles(id) on delete set null,
    motif text not null check (motif in ('fraude', 'deja_loue', 'inapproprie', 'autre')),
    description text,
    statut text not null default 'nouveau' check (statut in ('nouveau', 'traite', 'rejete')),
    created_at timestamptz not null default now()
);

-- 4. TABLE ADMIN LOGS
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id uuid primary key default gen_random_uuid(),
    admin_id uuid not null references public.profiles(id) on delete cascade,
    action text not null,
    cible_id uuid, -- ID de l'utilisateur, du bien ou du signalement concerné
    details jsonb,
    created_at timestamptz not null default now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_biens_statut_moderation ON public.biens(statut_moderation);
CREATE INDEX IF NOT EXISTS idx_signalements_statut ON public.signalements(statut);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE public.signalements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Les profils admins peuvent tout voir et modifier
-- (On vérifie que le role est 'admin')

-- SIGNALEMENTS :
-- Tout le monde peut insérer
CREATE POLICY "signalements_insert" ON public.signalements
    FOR INSERT WITH CHECK (true);

-- Seul l'admin peut voir et modifier
CREATE POLICY "signalements_select_admin" ON public.signalements
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "signalements_update_admin" ON public.signalements
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ADMIN LOGS :
-- Seul l'admin peut voir et insérer (et c'est géré côté serveur avec service_role de toute façon)
CREATE POLICY "admin_logs_select" ON public.admin_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "admin_logs_insert" ON public.admin_logs
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- MISE À JOUR DES POLITIQUES EXISTANTES (BIENS)
-- Les biens ne sont publics que si publie = true ET statut_moderation = 'valide'
DROP POLICY IF EXISTS "biens_select_publiques" ON public.biens;
CREATE POLICY "biens_select_publiques" ON public.biens
  FOR SELECT USING (
    (publie = true AND statut_moderation = 'valide') OR 
    auth.uid() = proprietaire_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Les admins peuvent mettre à jour n'importe quel bien (pour modération)
CREATE POLICY "biens_update_admin" ON public.biens
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Les admins peuvent mettre à jour n'importe quel profil (pour suspension)
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Les admins peuvent voir tous les profils
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
