// ✅ TYPES CORRIGÉS POUR CAMGAZ-TECH - Intégration avec le backend Java

// Types de base existants
export interface User {
  id: string;
  username: string;
  role: string;
}

// Enums basés sur les classes Java
export enum TypeEquipement {
  MOTOPOMPE = 'MOTOPOMPE',
  BORNE_DE_DISTRIBUTION = 'BORNE_DE_DISTRIBUTION',
  ARMOIRE_ELECTRIQUE = 'ARMOIRE_ELECTRIQUE',
  CITERNE = 'CITERNE',
  VAPORISATEUR = 'VAPORISATEUR',
  REGULATEUR = 'REGULATEUR'
}

export enum TypeInstallation {
  CARBURATION = 'CARBURATION',
  VAPORISATION_SIMPLE = 'VAPORISATION_SIMPLE',
  VAPORISATION_ELECTRIQUE = 'VAPORISATION_ELECTRIQUE',
  AUTRE = 'AUTRE'
}

export enum UniteFrequence {
  JOURS = 'JOURS',
  SEMAINES = 'SEMAINES',
  MOIS = 'MOIS',
  ANNEES = 'ANNEES',
  HEURES_UTILISATION = 'HEURES_UTILISATION'
}

export enum FrequenceStandard {
  QUOTIDIENNE = 'QUOTIDIENNE',
  HEBDOMADAIRE = 'HEBDOMADAIRE',
  MENSUELLE = 'MENSUELLE',
  BIMENSUELLE = 'BIMENSUELLE',
  TRIMESTRIELLE = 'TRIMESTRIELLE',
  SEMESTRIELLE = 'SEMESTRIELLE',
  ANNUELLE = 'ANNUELLE',
  CINQ_ANS = 'CINQ_ANS',
  DIX_ANS = 'DIX_ANS'
}

export enum TypeTache {
  VISITE = 'VISITE',
  ENTRETIEN = 'ENTRETIEN',
  PREVENTIF = 'PREVENTIF'
}

export enum TypeIntervention {
  MAINTENANCE_PLANIFIEE = 'MAINTENANCE_PLANIFIEE',
  DEFAILLANCE = 'DEFAILLANCE'
}

export enum Resultat {
  OK = 'OK',
  REPARE = 'REPARE',
  SUIVI_NECESSAIRE = 'SUIVI_NECESSAIRE'
}

export enum StatutMaintenance {
  PLANIFIEE = 'PLANIFIEE',
  REALISEE = 'REALISEE',
  ANNULEE = 'ANNULEE',
  REPORTEE = 'REPORTEE'
}

export enum StatutTache {
  PLANIFIEE = 'PLANIFIEE',
  REALISEE = 'REALISEE',
  ANNULEE = 'ANNULEE',
  REPORTEE = 'REPORTEE'
}

export enum TypeTachePlanifie {
  VISITE = 'VISITE',
  ENTRETIEN = 'ENTRETIEN',
  PREVENTIF = 'PREVENTIF'
}


export interface OccurrenceFuture {
  date: string;
  tache: TachePlanifie;
  site: Site;
  isOverdue?: boolean;
  daysFromNow?: number;
}
// ✅ INTERFACE PLANIFIER (NOUVELLE STRUCTURE JAVA)
export interface Planifier {
  id_Planifier?: number;
  site: Site;
  tachePlanifie?: TachePlanifie; // @JsonIgnore côté Java
  datePlanifie: string; // LocalDate sérialisé en string ISO "YYYY-MM-DD"
}

// Interfaces basées sur les classes Java
export interface Frequence {
  id_frequence?: number;
  frequenceStandard?: FrequenceStandard;
  valeurPersonnalisee?: number;
  unitePersonnalisee?: UniteFrequence;
  heuresTotales?: number;
  heuresMoyennesParJour?: number;
}

export interface Equipement {
  id_equipement?: number;
  nom: string;
  reference: string;
  type: string; // TypeEquipement en string
  fabricant?: string;
  modele?: string;
  numeroSerie?: string;
  dateAcquisition?: string;
  garantie?: string;
  documentation?: string;
  taches?: Tache[];
  pieces?: Piece[];
}

export interface Tache {
  id_tache?: number;
  equipement?: Equipement;
  nom: string;
  description?: string;
  dureeEstimee?: number;
  niveauDifficulte?: 'FACILE' | 'MOYEN' | 'DIFFICILE' | 'EXPERT';
  frequence?: Frequence;
  occurenceMainteance?: OccurenceMainteance;
}

export interface OccurenceMainteance {
  id_occurenceMainteance?: number;
  equipementInstalle?: EquipementInstalle;
  tache?: Tache;
  dateCreation?: string; // LocalDate as string
  datePrevue: string; // LocalDate as string
  statut: StatutMaintenance;
}

export interface FicheIntervention {
  id_ficheIntervention?: number;
  type: TypeIntervention;
  dateHeureIntervention: string; // LocalDateTime as string
  equipement?: Equipement;
  descriptionIntervention: string;
  problemeRencontre?: string;
  cause?: string;
  travauxEffectues: string;
  piecesRemplacees?: PieceRemplacee[];
  coutTotal?: number;
  resultat: Resultat;
  nomsIntervenants?: string[];
  commentairesAdditionnels?: string;
  piecesJointes?: string[];
}

export interface PieceRemplacee {
  id_pieceRemplacee?: number;
  piece: Piece;
  ficheIntervention?: FicheIntervention;
  quantiteUtilisee: number;
}

// ✅ INTERFACE TACHE PLANIFIEE MISE À JOUR
export interface TachePlanifie {
  id_tachePlanifie?: number;
  // ✅ Nouvelle structure avec planifiers (relation Java)
  planifiers?: Planifier[]; // @JsonIgnore côté Java, chargé séparément
  nom: string;
  responsable?: string;
  statut: StatutTache;
  type: TypeTachePlanifie;
  // ✅ List<LocalDate> côté Java -> array de strings ISO côté frontend
  dernierIntervention?: string; // ["2024-01-15", "2024-01-20"]
  frequence?: Frequence;
  datePrevu?: string; // LocalDate as string "YYYY-MM-DD"
  
  // ✅ Compatibilité avec l'ancienne structure (à supprimer progressivement)
  sites?: Site[]; // Ancienne structure pour compatibilité
  site?: Site; // Site unique pour compatibilité
}

export interface EquipementInstalle {
  id_equipementInstalle?: number;
  site?: Site;
  equipement: Equipement;
  date_installation: string; // LocalDate as string "YYYY-MM-DD"
  derniere_maintenance?: { [key: number]: string }; // Map<Integer, Date> as object
}

export interface Site {
  id_site?: number;
  nom: string;
  ville: string;
  nom_contact?: string;
  tel_contact?: string;
  type: string; // TypeInstallation en string - ✅ NOUVEAU CHAMP AJOUTÉ
  dateCreation?: string; // LocalDate as string "YYYY-MM-DD"
  // ✅ Relations avec les entités Java
  planifies?: Planifier[]; // @JsonIgnore côté Java
  equipementInstalles?: EquipementInstalle[];
}

export interface Piece {
  id_piece?: number;
  equipement?: Equipement;
  nom: string;
  reference: string;
  description?: string;
  prixUnitaire?: number;
  fournisseur?: string;
}

export interface Stock {
  id_stock?: number;
  quantite: number;
  seuil_critique: number;
  piece?: Piece;
}

// Types utilitaires pour l'interface
export type MovementType = 'Entrée' | 'Sortie' | 'Ajustement' | 'Consommation automatique';

// Interface pour les mouvements de stock
export interface StockMovement {
  id: string;
  pieceId: number;
  type: MovementType;
  quantity: number;
  reason: string;
  date: Date;
  userId: string;
  interventionId?: string;
}

// Interface pour les alertes de stock (basée sur les entités Java)
export interface StockAlert {
  id: string;
  stockId: number;
  pieceReference: string;
  pieceDesignation: string;
  currentQuantity: number;
  criticalThreshold: number;
  triggeredAt: Date;
}

// Interface pour les défaillances
export interface Defaillance {
  id: string;
  equipementInstalleId: number;
  problem: string;
  cause: string;
  reportedDate: Date;
  ficheInterventionId?: number;
  reportedBy: string;
}

// Interface pour les logs d'audit
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: any;
  timestamp: Date;
}

// ✅ INTERFACES POUR LES REQUÊTES API MISES À JOUR

// ✅ Requête pour créer une tâche planifiée (avec planifiers)
export interface RequetCreateTachePlanifie {
  tachePlanifie?: TachePlanifie;
  planifiers?: Planifier[]; // Nouvelle structure
  // Compatibilité
  siteIds?: number[];
}

// ✅ Requête pour mettre à jour une tâche planifiée
export interface RequetUpdateTachePlanifie {
  tachePlanifie: TachePlanifie;
  planifiers?: Planifier[];
  // Compatibilité
  siteId?: number;
  siteIds?: number[];
}

// Interface pour la réponse du planning
export interface RequetGetPlanning {
  occurenceMainteance: OccurenceMainteance;
  equipement: Equipement;
  tacheList?: Tache[];
  // Compatibilité
  site?: Site;
  tachesPlanifiees?: TachePlanifie[];
  prochaineDateMaintenance?: string;
}

// Interface pour créer une fiche d'intervention
export interface RequetCreateFiche {
  ficheIntervention: FicheIntervention;
  equipementId: number;
  pieceList: number[];
  // Compatibilité
  equipementInstalleId?: number;
}

// ✅ REQUÊTE POUR CRÉER UN SITE MISE À JOUR
export interface RequetCreateSite {
  site: Site; // Inclut maintenant le champ 'type'
  equipementIdList: number[];
  dateInstall: string; // Date par défaut (non utilisée)
  dateMap: { [key: number]: string }; // Dates d'installation par équipement
}

// ✅ INTERFACES UTILITAIRES POUR LA GESTION DES DATES

// Interface pour gérer les sites avec leurs dates individuelles
export interface SiteAvecDate {
  site: Site;
  dateDerniereIntervention: string; // Format ISO string
  index: number; // Index correspondant dans le tableau dernierIntervention
}

// ✅ FONCTIONS UTILITAIRES POUR LES DATES
export const parseJavaDate = (javaDate: any): Date | null => {
  if (!javaDate) return null;
  
  // Si c'est déjà une Date
  if (javaDate instanceof Date) return javaDate;
  
  // Si c'est un objet LocalDate Java sérialisé {year: 2024, month: 1, day: 15}
  if (typeof javaDate === 'object' && javaDate.year && javaDate.month && javaDate.day) {
    return new Date(javaDate.year, javaDate.month - 1, javaDate.day);
  }
  
  // Si c'est une string ISO
  if (typeof javaDate === 'string') {
    try {
      return new Date(javaDate);
    } catch {
      return null;
    }
  }
  
  return null;
};

export const formatDateForDisplay = (date: string | Date | null, format: 'short' | 'long' = 'short'): string => {
  if (!date) return 'Date non définie';
  
  const parsedDate = parseJavaDate(date);
  if (!parsedDate) return 'Date invalide';
  
  if (format === 'long') {
    return parsedDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  return parsedDate.toLocaleDateString('fr-FR');
};

export const formatDateForBackend = (date: Date): string => {
  return date.toISOString().split('T')[0]; // "2024-01-15"
};

// ✅ INTERFACES DE COMPATIBILITÉ (À SUPPRIMER PROGRESSIVEMENT)

// Interface temporaire pour la compatibilité (à supprimer après migration complète)
export interface SiteAffecte {
  site: Site;
  dateDerniereIntervention: string;
}

// ✅ UTILITAIRES POUR LES TYPES D'INSTALLATION

// Configuration des équipements par type d'installation
export interface InstallationConfig {
  equipements: string[] | 'ALL';
  obligatoires: string[];
  optionnels: string[] | 'ALL';
}

export const INSTALLATION_EQUIPEMENTS: Record<TypeInstallation, InstallationConfig> = {
  [TypeInstallation.CARBURATION]: {
    equipements: ['CITERNE', 'MOTOPOMPE', 'BORNE_DE_DISTRIBUTION', 'ARMOIRE_ELECTRIQUE'],
    obligatoires: ['CITERNE', 'MOTOPOMPE', 'BORNE_DE_DISTRIBUTION'],
    optionnels: ['ARMOIRE_ELECTRIQUE']
  },
  [TypeInstallation.VAPORISATION_SIMPLE]: {
    equipements: ['CITERNE', 'VAPORISATEUR', 'ARMOIRE_ELECTRIQUE'],
    obligatoires: ['CITERNE', 'VAPORISATEUR'],
    optionnels: ['ARMOIRE_ELECTRIQUE']
  },
  [TypeInstallation.VAPORISATION_ELECTRIQUE]: {
    equipements: ['CITERNE', 'VAPORISATEUR', 'REGULATEUR', 'ARMOIRE_ELECTRIQUE'],
    obligatoires: ['CITERNE', 'VAPORISATEUR', 'REGULATEUR'],
    optionnels: ['ARMOIRE_ELECTRIQUE']
  },
  [TypeInstallation.AUTRE]: {
    equipements: 'ALL',
    obligatoires: [],
    optionnels: 'ALL'
  }
};