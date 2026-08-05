-- ============================================================
-- MIGRATION : CRM Immobilier (V1)
-- Date      : 2026-08-05
-- ============================================================

-- 1. Extension de la table contacts_demandes (Leads)
ALTER TABLE public.contacts_demandes
ADD COLUMN IF NOT EXISTS score int DEFAULT 1 CHECK (score IN (1, 2, 3)), -- 1: Froid, 2: Tiède, 3: Chaud
ADD COLUMN IF NOT EXISTS budget numeric(12,2),
ADD COLUMN IF NOT EXISTS source text DEFAULT 'site' CHECK (source IN ('site', 'whatsapp', 'bouche_a_oreille', 'autre')),
ADD COLUMN IF NOT EXISTS date_visite timestamptz,
ADD COLUMN IF NOT EXISTS resultat_visite text CHECK (resultat_visite IN ('en_attente', 'positif', 'negatif')),
ADD COLUMN IF NOT EXISTS prochaine_relance timestamptz;

-- Mise à jour des statuts possibles (On supprime l'ancienne contrainte si elle existe)
ALTER TABLE public.contacts_demandes DROP CONSTRAINT IF EXISTS contacts_demandes_statut_check;
ALTER TABLE public.contacts_demandes ADD CONSTRAINT contacts_demandes_statut_check 
CHECK (statut IN ('nouveau', 'contacte', 'a_relancer', 'visite_planifiee', 'negociation', 'converti', 'perdu'));

-- 2. Création de la table Historique (Timeline CRM)
CREATE TABLE IF NOT EXISTS public.crm_events (
    id uuid primary key default gen_random_uuid(),
    demande_id uuid not null references public.contacts_demandes(id) on delete cascade,
    profil_id uuid not null references public.profiles(id) on delete cascade, -- L'agent/propriétaire qui a fait l'action
    type_event text not null check (type_event in ('statut_change', 'note_added', 'whatsapp_sent', 'call_made', 'visite_planned')),
    details jsonb, -- Exemple: {"old_statut": "nouveau", "new_statut": "contacte"} ou {"note": "Le client est très intéressé"}
    created_at timestamptz not null default now()
);

-- Index pour la performance
CREATE INDEX IF NOT EXISTS idx_crm_events_demande_id ON public.crm_events(demande_id);
CREATE INDEX IF NOT EXISTS idx_contacts_demandes_prochaine_relance ON public.contacts_demandes(prochaine_relance);

-- ============================================
-- ROW LEVEL SECURITY (RLS) pour crm_events
-- ============================================
ALTER TABLE public.crm_events ENABLE ROW LEVEL SECURITY;

-- Un propriétaire peut lire les events liés à ses propres demandes
CREATE POLICY "crm_events_select" ON public.crm_events
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.contacts_demandes cd
        JOIN public.biens b ON cd.bien_id = b.id
        WHERE cd.id = crm_events.demande_id AND b.proprietaire_id = auth.uid()
    )
);

-- Un propriétaire peut insérer des events pour ses demandes
CREATE POLICY "crm_events_insert" ON public.crm_events
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.contacts_demandes cd
        JOIN public.biens b ON cd.bien_id = b.id
        WHERE cd.id = crm_events.demande_id AND b.proprietaire_id = auth.uid()
    )
);
