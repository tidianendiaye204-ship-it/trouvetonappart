-- MIGRATION V3 : Pipeline CRM Complet

-- 1. Mise à jour des données existantes : On bascule 'a_relancer' vers 'contacte'
UPDATE public.contacts_demandes
SET statut = 'contacte'
WHERE statut = 'a_relancer';

-- 2. Suppression explicite de l'ancienne contrainte CHECK sur la colonne statut
ALTER TABLE public.contacts_demandes DROP CONSTRAINT IF EXISTS contacts_demandes_statut_check;

-- 3. Ajout de la nouvelle contrainte CHECK avec le pipeline complet
ALTER TABLE public.contacts_demandes
ADD CONSTRAINT contacts_demandes_statut_check 
CHECK (statut IN ('nouveau', 'contacte', 'visite_planifiee', 'dossier_recu', 'negociation', 'converti', 'perdu'));

