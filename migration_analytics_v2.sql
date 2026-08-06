-- Ajouter la colonne vues pour la preuve de valeur
ALTER TABLE biens ADD COLUMN vues INTEGER DEFAULT 0;

-- Fonction RPC pour incrémenter les vues
CREATE OR REPLACE FUNCTION increment_vues_bien(p_bien_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE biens 
  SET vues = COALESCE(vues, 0) + 1 
  WHERE id = p_bien_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
