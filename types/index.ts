export type TypeBien = 'terrain' | 'maison' | 'appartement'
export type Transaction = 'location' | 'vente'
export type StatutBien = 'disponible' | 'reserve' | 'loue' | 'vendu'
export type StatutPaiement = 'en_attente' | 'paye' | 'en_retard'
export type StatutBail = 'actif' | 'termine' | 'resilie'

export type BienImage = {
  url: string
  ordre: number
}

export type Bien = {
  id: string
  titre: string
  type: TypeBien
  transaction: Transaction
  prix: number
  superficie: number | null
  nb_chambres: number | null
  quartier: string | null
  ville: string | null
  adresse?: string | null
  latitude: number | null
  longitude: number | null
  publie: boolean
  statut: StatutBien
  description?: string | null
  proprietaire_id?: string
  created_at?: string
  sponsorise_jusqu_a?: string | null
  image_principale?: string | null
  biens_images?: BienImage[]
}

export type Locataire = {
  id: string
  proprietaire_id: string
  prenom: string
  nom: string
  email: string | null
  telephone: string
  cni: string | null
  notes: string | null
  created_at?: string
}

export type Bail = {
  id: string
  bien_id: string
  locataire_id: string
  date_debut: string
  date_fin: string | null
  loyer_mensuel: number
  statut: StatutBail
  created_at?: string
  biens?: Partial<Bien>
  locataires?: Partial<Locataire>
}

export type Paiement = {
  id: string
  bail_id: string
  mois: number
  annee: number
  montant: number
  date_paiement: string | null
  statut: StatutPaiement
  created_at?: string
  baux?: Partial<Bail>
}

export type DemandeContact = {
  id: string
  bien_id: string
  nom_demandeur: string
  telephone_demandeur: string
  message: string | null
  statut: 'nouveau' | 'a_relancer' | 'visite_planifiee' | 'converti' | 'perdu'
  notes_privees: string | null
  date_dernier_contact: string | null
  created_at?: string
  biens?: Partial<Bien>
}
