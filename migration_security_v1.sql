-- ============================================================
-- MIGRATION : Sécurité, Anti-Spam et Rate Limiting
-- Date      : 2026-08-05
-- ============================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  ip text not null,
  endpoint text not null,
  request_count int not null default 1,
  last_request timestamptz not null default now(),
  blocked_until timestamptz,
  primary key (ip, endpoint)
);

-- RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- Aucun accès public, la table est manipulée uniquement via Service Role ou RPC
-- Pas de policies nécessaires car le backend (Next.js server actions) utilise le Service Role
-- pour vérifier et écrire les rate limits.

-- Fonction RPC pour vérifier le rate limit de manière atomique
-- Cela évite les conditions de course si le bot envoie 100 requêtes en même temps.
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_ip text,
  p_endpoint text,
  p_max_requests int,
  p_window_seconds int
) RETURNS boolean AS $$
DECLARE
  v_count int;
  v_last timestamptz;
  v_blocked timestamptz;
BEGIN
  -- Tenter de récupérer l'enregistrement
  SELECT request_count, last_request, blocked_until 
  INTO v_count, v_last, v_blocked
  FROM public.rate_limits 
  WHERE ip = p_ip AND endpoint = p_endpoint
  FOR UPDATE; -- Verrouille la ligne pour la transaction
  
  IF FOUND THEN
    -- Si bloqué
    IF v_blocked IS NOT NULL AND v_blocked > now() THEN
      RETURN false;
    END IF;

    -- Si on a dépassé la fenêtre de temps, on réinitialise
    IF EXTRACT(EPOCH FROM (now() - v_last)) > p_window_seconds THEN
      UPDATE public.rate_limits 
      SET request_count = 1, last_request = now(), blocked_until = null
      WHERE ip = p_ip AND endpoint = p_endpoint;
      RETURN true;
    END IF;

    -- Si dans la fenêtre, on incrémente
    IF v_count < p_max_requests THEN
      UPDATE public.rate_limits 
      SET request_count = request_count + 1, last_request = now()
      WHERE ip = p_ip AND endpoint = p_endpoint;
      RETURN true;
    ELSE
      -- On bloque pour la durée de la fenêtre entière
      UPDATE public.rate_limits 
      SET blocked_until = now() + (p_window_seconds || ' seconds')::interval, last_request = now()
      WHERE ip = p_ip AND endpoint = p_endpoint;
      RETURN false;
    END IF;
  ELSE
    -- Premier appel
    INSERT INTO public.rate_limits (ip, endpoint, request_count, last_request)
    VALUES (p_ip, p_endpoint, 1, now());
    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
