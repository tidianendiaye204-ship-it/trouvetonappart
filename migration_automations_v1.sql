-- ============================================================
-- MIGRATION : Système d'Automatisations et Rappels
-- Date      : 2026-08-05
-- Dépend de : schema.sql
-- ============================================================

-- 1. PREFERENCES UTILISATEURS
CREATE TABLE IF NOT EXISTS public.automations_preferences (
    profil_id uuid primary key references public.profiles(id) on delete cascade,
    
    -- Loyers
    rappel_loyer_retard_whatsapp boolean default true,
    rappel_loyer_retard_email boolean default true,
    rappel_loyer_retard_sms boolean default false,
    
    -- CRM & Leads
    relance_lead_whatsapp boolean default true,
    relance_lead_email boolean default false,
    
    -- Visites
    rappel_visite_whatsapp boolean default true,
    
    updated_at timestamptz not null default now()
);

-- 2. TEMPLATES DE MESSAGES (Modèles personnalisés par l'utilisateur)
CREATE TABLE IF NOT EXISTS public.automations_templates (
    id uuid primary key default gen_random_uuid(),
    profil_id uuid not null references public.profiles(id) on delete cascade,
    
    trigger_type text not null check (trigger_type in ('loyer_retard', 'loyer_echeance', 'lead_relance', 'visite_rappel')),
    channel text not null check (channel in ('whatsapp', 'email', 'sms')),
    
    subject text, -- Uniquement pour l'email
    content text not null, -- Peut contenir des variables comme {{nom}}, {{montant}}
    
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    
    -- Contrainte d'unicité : un profil ne peut avoir qu'un seul template actif par trigger et canal
    unique(profil_id, trigger_type, channel)
);

-- 3. HISTORIQUE D'ENVOI (Anti-spam / Idempotence)
CREATE TABLE IF NOT EXISTS public.automations_history (
    id uuid primary key default gen_random_uuid(),
    profil_id uuid not null references public.profiles(id) on delete cascade,
    
    trigger_type text not null,
    channel text not null,
    
    entity_id uuid not null, -- ID de la demande CRM ou du paiement (sert de clé d'idempotence)
    recipient text not null, -- Numéro de tél ou email
    
    content_sent text,
    status text not null check (status in ('sent', 'failed', 'pending')),
    error_log text,
    
    created_at timestamptz not null default now(),
    
    -- Pour éviter d'envoyer deux fois un rappel de retard pour LE MEME paiement sur LE MEME canal
    unique(trigger_type, channel, entity_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_automations_history_profil ON public.automations_history(profil_id);
CREATE INDEX IF NOT EXISTS idx_automations_history_entity ON public.automations_history(entity_id);

-- ============================================
-- RLS (ROW LEVEL SECURITY)
-- ============================================
ALTER TABLE public.automations_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations_history ENABLE ROW LEVEL SECURITY;

-- Preferences
CREATE POLICY "automations_preferences_select" ON public.automations_preferences FOR SELECT USING (auth.uid() = profil_id);
CREATE POLICY "automations_preferences_insert" ON public.automations_preferences FOR INSERT WITH CHECK (auth.uid() = profil_id);
CREATE POLICY "automations_preferences_update" ON public.automations_preferences FOR UPDATE USING (auth.uid() = profil_id);

-- Templates
CREATE POLICY "automations_templates_select" ON public.automations_templates FOR SELECT USING (auth.uid() = profil_id);
CREATE POLICY "automations_templates_insert" ON public.automations_templates FOR INSERT WITH CHECK (auth.uid() = profil_id);
CREATE POLICY "automations_templates_update" ON public.automations_templates FOR UPDATE USING (auth.uid() = profil_id);
CREATE POLICY "automations_templates_delete" ON public.automations_templates FOR DELETE USING (auth.uid() = profil_id);

-- History (Lecture seule pour l'utilisateur, l'insertion se fait via le CRON en service_role)
CREATE POLICY "automations_history_select" ON public.automations_history FOR SELECT USING (auth.uid() = profil_id);
