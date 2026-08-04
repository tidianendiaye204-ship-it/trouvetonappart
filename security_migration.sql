-- MIGRATION: Sécurisation anti-spam de la table contacts_demandes

-- 1. On supprime la permission d'insertion publique (qui permettait aux bots de spammer l'API)
DROP POLICY IF EXISTS "contacts_insert_public" ON public.contacts_demandes;

-- 2. Désormais, SEUL le backend Next.js (utilisant le SUPABASE_SERVICE_ROLE_KEY) pourra
-- insérer des données dans cette table après avoir validé le Captcha.
-- Aucune policy 'INSERT' n'est définie pour les utilisateurs anonymes ou authentifiés
-- via le client public. Cela ferme la faille.
