// Types basés sur les modèles Java du backend

export interface User {
  username: string;
  token?: string;
}

// Gestion Équipements
export enum TypeEquipement {
  MOTOPOMPE = 'MOTOPOMPE',
  BORNE_DE_DISTRIBUTION = 'BORNE_DE_DISTRIBUTION',
  ARMOIRE_ELECTRIQUE = 'ARMOIRE_ELECTRIQUE',
  CITERNE = 'CITERNE'
}

export enum TypeTache {
  VISITE = 'VISITE',
  ENTRETIEN = 'ENTRETIEN',
  PREVENTIF = 'PREVENTIF'
}

export enum FrequenceStandard {
  MENSUELLE = 'MENSUELLE',
  BIMENSUELLE = 'BIMENSUELLE',
  TRIMESTRIELLE = 'TRIMESTRIELLE',
  SEMESTRIELLE = 'SEMESTRIELLE',
  ANNUELLE = 'ANNUELLE',
  CINQ_ANS = 'CINQ_ANS',
  DIX_ANS = 'DIX_ANS'
}

export enum UniteFrequence {
  JOURS = 'JOURS',
  SEMAINES = 'SEMAINES',
  MOIS = 'MOIS',
  ANNEES = 'ANNEES',
  HEURES_UTILISATION = 'HEURES_UTILISATION'
}

export interface Frequence {
  id_frequence?: number;
  frequenceStandard?: FrequenceStandard;
  valeurPersonnalisee?: number;
  unitePersonnalisee?: UniteFrequence;
  heuresTotales?: number;
  heuresMoyennesParJour?: number;
}

export interface Tache {
  id_tache?: number;
  nom: string;
  type: TypeTache;
  frequence: Frequence;
  equipement?: Equipement;
}

export interface Piece {
  id_piece?: number;
  nom: string;
  reference: string;
  equipement?: Equipement;
}

export interface Equipement {
  id_equipement?: number;
  type: TypeEquipement;
  reference: string;
  nom: string;
  fournisseur?: string;
  taches?: Tache[];
  pieces?: Piece[];
}

// Gestion Sites
export interface EquipementInstalle {
  id_equipementInstalle?: number;
  site?: Site;
  equipement: Equipement;
  date_installation: string;
  derniere_maintenance?: { [key: number]: string };
}

export interface Site {
  id_site?: number;
  nom: string;
  ville: string;
  nom_contact?: string;
  tel_contact?: string;
  equipementInstalles?: EquipementInstalle[];
}

// Gestion Planning
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

export enum TypeIntervention {
  MAINTENANCE_PLANIFIEE = 'MAINTENANCE_PLANIFIEE',
  DEFAILLANCE = 'DEFAILLANCE'
}

export enum Resultat {
  OK = 'OK',
  REPARÉ = 'REPARÉ',
  SUIVI_NÉCESSAIRE = 'SUIVI_NÉCESSAIRE'
}

export interface OccurenceMainteance {
  id_occurenceMainteance?: number;
  equipement: Equipement;
  taches?: Tache[];
  datePrevue: string;
  statut: StatutMaintenance;
}

export interface TachePlanifie {
  id_tachePlanifie?: number;
  site?: Site;
  nom: string;
  responsable?: string;
  statut: StatutTache;
  type: TypeTachePlanifie;
  dernierIntervention?: string;
  datePrevu: string;
}

export interface PieceRemplacee {
  id_pieceRemplacee?: number;
  piece?: Piece;
  reference: string;
  nom: string;
  quantiteUtilisee: number;
  prixUnitaire?: number;
}

export interface FicheIntervention {
  id_ficheIntervention?: number;
  type: TypeIntervention;
  dateHeureIntervention: string;
  equipement?: Equipement;
  descriptionIntervention: string;
  problemeRencontre?: string;
  cause?: string;
  travauxEffectues?: string;
  piecesRemplacees?: PieceRemplacee[];
  coutTotal: number;
  resultat?: Resultat;
  nomsIntervenants?: string[];
  commentairesAdditionnels?: string;
  piecesJointes?: string[];
}

// Gestion Stock
export interface Stock {
  id_stock?: number;
  quantite: number;
  seuil_critique: number;
  piece: Piece;
}

// DTOs
export interface RequetUpdateEquipement {
  equipementId: number;
  tacheList: Tache[];
  pieceList: Piece[];
}

export interface RequetCreateSite {
  site: Site;
  equipementIdList: number[];
  dateInstall: string;
  dateMap?: { [key: number]: string };
}

export interface RequetUpdateSite {
  site: Site;
  nouveauEquipementInstalles: EquipementInstalle[];
}

export interface RequetCreateStock {
  stock: Stock;
  pieceID: number;
}

export interface RequetCreateTachePlanifie {
  tachePlanifie: TachePlanifie;
  siteId: number;
}

export interface RequetCreateFiche {
  ficheIntervention: FicheIntervention;
  equipementId: number;
  pieceList: number[];
}

export interface RequetGetPlanning {
  occurenceMainteance: OccurenceMainteance;
  equipement: Equipement;
  tacheList: Tache[];
}

export interface SortieStock {
  stock: Stock;
  alerte: boolean;
}