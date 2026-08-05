export type TypeBien = 'terrain' | 'maison' | 'appartement'
export type Transaction = 'location' | 'vente'
export type StatutBien = 'disponible' | 'reserve' | 'loue' | 'vendu'
export type StatutPaiement = 'en_attente' | 'paye' | 'en_retard'
export type StatutBail = 'actif' | 'termine' | 'resilie'

// ─── Sponsoring ──────────────────────────────────────────────
export type PlanSponsoring = 7 | 14 | 30
export type StatutTransactionSponsoring = 'pending' | 'paid' | 'failed' | 'expired'
export type ProviderPaiement = 'mock' | 'wave' | 'orange_money' | 'stripe'

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
  statut_moderation?: StatutModeration
  description?: string | null
  proprietaire_id?: string
  created_at?: string
  sponsorise_jusqu_a?: string | null
  image_principale?: string | null
  biens_images?: BienImage[]
  telephone?: string
  whatsapp?: string
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

export type MethodePaiement = 'manuel' | 'en_ligne' | 'virement' | 'cheque'

export type Paiement = {
  id: string
  bail_id: string
  mois: number
  annee: number
  montant: number
  date_paiement: string | null
  statut: StatutPaiement
  methode_paiement?: MethodePaiement
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

// ─── Transactions Sponsoring ─────────────────────────────────
export type TransactionSponsoring = {
  id: string
  bien_id: string
  proprietaire_id: string
  plan_jours: PlanSponsoring
  montant: number
  statut: StatutTransactionSponsoring
  provider: ProviderPaiement
  reference_paiement: string | null
  metadata_psp: Record<string, unknown>
  expires_at: string
  paid_at: string | null
  activated_at: string | null
  created_at: string
  updated_at: string
  // Joined via view
  biens?: Partial<Bien>
}

export type PlanSponsoringConfig = {
  jours: PlanSponsoring
  montant: number       // en FCFA
  label: string
  description: string
  badge?: string        // Label promotionnel optionnel
  populaire?: boolean
}

export type InitierPaiementResponse =
  | { success: true; transactionId: string; redirectUrl?: string }
  | { success: false; error: string }

export type ConfirmerPaiementResponse =
  | { success: true; sponsoriseJusquA: string }
  | { success: false; error: string }

export type RevenusSponsoring = {
  total_transactions_payees: number
  revenus_totaux: number
  transactions_ce_mois: number
  revenus_ce_mois: number
  transactions_en_attente: number
  transactions_echouees: number
}

// ─── Transactions Loyers en ligne ────────────────────────────
export type StatutTransactionLoyer = 'pending' | 'paid' | 'failed' | 'refunded' | 'expired'

export type TransactionLoyer = {
  id: string
  paiement_id: string
  bail_id: string
  locataire_id: string
  proprietaire_id: string
  montant: number
  statut: StatutTransactionLoyer
  provider: ProviderPaiement
  reference_paiement: string | null
  metadata_psp: Record<string, unknown>
  expires_at: string
  paid_at: string | null
  created_at: string
  updated_at: string
}

// ─── Administration & Modération ─────────────────────────────
export type Role = 'proprietaire' | 'chercheur' | 'admin'
export type StatutCompte = 'actif' | 'suspendu'
export type StatutModeration = 'en_attente' | 'valide' | 'rejete' | 'suspendu'
export type MotifSignalement = 'fraude' | 'deja_loue' | 'inapproprie' | 'autre'
export type StatutSignalement = 'nouveau' | 'traite' | 'rejete'

export type Profile = {
  id: string
  role: Role
  nom: string
  telephone: string | null
  abonnement_actif: boolean
  date_debut_abonnement: string | null
  statut_compte: StatutCompte
  created_at: string
}

export type Signalement = {
  id: string
  bien_id: string
  profil_id: string | null
  motif: MotifSignalement
  description: string | null
  statut: StatutSignalement
  created_at: string
  // relations jointes pour l'admin
  biens?: Bien
  profiles?: Profile
}

export type AdminLog = {
  id: string
  admin_id: string
  action: string
  cible_id: string | null
  details: Record<string, unknown> | null
  created_at: string
  profiles?: Profile // Pour afficher le nom de l'admin
}
