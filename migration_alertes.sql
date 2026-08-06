-- Migration: Alertes Recherche
-- Créer la table pour stocker les alertes emails des utilisateurs

CREATE TABLE IF NOT EXISTS public.alertes_recherche (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  transaction VARCHAR(50),
  ville VARCHAR(100),
  prix_max INTEGER,
  is_active BOOLEAN DEFAULT true,
  last_notified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour des recherches plus rapides par le script de cron
CREATE INDEX IF NOT EXISTS idx_alertes_active ON public.alertes_recherche(is_active);
CREATE INDEX IF NOT EXISTS idx_alertes_last_notified ON public.alertes_recherche(last_notified_at);

-- RLS (Row Level Security)
ALTER TABLE public.alertes_recherche ENABLE ROW LEVEL SECURITY;

-- Autoriser tout le monde à insérer (pour les visiteurs non connectés)
CREATE POLICY "Allow public insert on alertes" 
ON public.alertes_recherche FOR INSERT 
TO public 
WITH CHECK (true);

-- Seul le propriétaire peut lire ses alertes via email (Optionnel pour plus tard)
-- La lecture globale sera faite via la service_role_key par le cron job

-- Commentaires
COMMENT ON TABLE public.alertes_recherche IS 'Stocke les critères d''alerte email des utilisateurs';
