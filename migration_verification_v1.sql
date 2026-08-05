-- ============================================================
-- MIGRATION : Système de Confiance & Vérification
-- Date      : 2026-08-05
-- ============================================================

-- 1. Ajout des flags de confiance sur les Profils
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_verified boolean not null default false;

-- 2. Ajout des flags de confiance sur les Biens
ALTER TABLE public.biens 
  ADD COLUMN IF NOT EXISTS photos_verified boolean not null default false,
  ADD COLUMN IF NOT EXISTS availability_confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS trust_score integer not null default 0;

-- 3. Table de Journalisation (Audit Log)
CREATE TABLE IF NOT EXISTS public.verification_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id),
  target_type text not null check (target_type in ('profile', 'bien')),
  target_id uuid not null,
  action text not null,
  notes text,
  created_at timestamptz not null default now()
);

-- Index pour les logs
CREATE INDEX IF NOT EXISTS idx_verification_logs_target ON public.verification_logs(target_type, target_id);

-- 4. Sécurité (RLS) sur les logs
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent lire/écrire les logs de vérification
CREATE POLICY "admin_all_verification_logs" ON public.verification_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
