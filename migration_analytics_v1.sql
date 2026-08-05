-- ============================================================
-- MIGRATION : Analytics Events
-- Date      : 2026-08-05
-- Dépend de : schema.sql (table profiles)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  user_id uuid references public.profiles(id) on delete set null, -- Optionnel (peut être null pour les visiteurs)
  properties jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Index pour accélérer les requêtes d'analyse
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at);

-- ROW LEVEL SECURITY
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- L'insertion se fait uniquement côté backend (Service Role)
-- Seul l'Admin peut lire ces événements
CREATE POLICY "admin_select_analytics" ON public.analytics_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
