import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Clock, CheckCircle, AlertTriangle, Filter, Calendar, Download, History, User, RefreshCw, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { DetailCard } from '../components/ui/detail-card';
import { InfoGrid, InfoItem } from '../components/ui/info-grid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { TachePlanifieeForm } from '../components/planning/TachePlanifieeForm';
import { TachePlanifieeDetailView } from '../components/planning/TachePlanifieeDetailView';
import { RescheduleDialog } from '../components/planning/RescheduleDialog';
import { PlanningAnnuelView } from '../components/planning/PlanningAnnuelView';
import { AffectationTacheAutoForm } from '../components/planning/AffectationTacheAutoForm';
import { HistoriqueMaintenancesView } from '../components/planning/HistoriqueMaintenancesView';
import { FicheInterventionForm } from '../components/interventions/FicheInterventionForm';
import { DefaillanceForm } from '../components/interventions/DefaillanceForm';
import { planningService } from '../services/planningService';
import { stockService } from '../services/stockService';
import { toast } from 'sonner@2.0.3';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { 
  RequetGetPlanning, 
  TachePlanifie, 
  StatutMaintenance, 
  StatutTache,
  TypeTachePlanifie,
  FicheIntervention,
  Site
} from '../types';
import { siteService } from '../services/siteService';

const statutTacheLabels: Record<StatutTache, string> = {
  PLANIFIEE: 'Planifiée',
  REALISEE: 'Réalisée',
  ANNULEE: 'Annulée',
  REPORTEE: 'Reportée'
};

const typeTacheLabels: Record<TypeTachePlanifie, string> = {
  VISITE: 'Visite',
  ENTRETIEN: 'Entretien',
  PREVENTIF: 'Préventif'
};

export const PlanningPage = () => {
  const [planningMaintenances, setPlanningMaintenances] = useState<RequetGetPlanning[]>([]);
  const [tachesPlannifiees, setTachesPlannifiees] = useState<TachePlanifie[]>([]);
  const [fichesIntervention, setFichesIntervention] = useState<FicheIntervention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('planning');
  
  // États des dialogs
  const [isTacheDialogOpen, setIsTacheDialogOpen] = useState(false);
  const [isFicheDialogOpen, setIsFicheDialogOpen] = useState(false);
  const [isDefaillanceDialogOpen, setIsDefaillanceDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isAffectationDialogOpen, setIsAffectationDialogOpen] = useState(false);
  const [selectedTache, setSelectedTache] = useState<TachePlanifie | null>(null);
  const [editingTache, setEditingTache] = useState<TachePlanifie | null>(null);
  const [reschedulingTache, setReschedulingTache] = useState<TachePlanifie | null>(null);
  const [selectedMaintenanceAuto, setSelectedMaintenanceAuto] = useState<RequetGetPlanning | null>(null);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<StatutTache | 'all'>('all');
  const [filterType, setFilterType] = useState<TypeTachePlanifie | 'all'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [planningData, tachesData, fichesData] = await Promise.all([
        planningService.getPlanning(),
        planningService.getAllTachesPlanifiees(),
        planningService.getAllFichesIntervention()
      ]);
      
      console.log('📊 Données tâches chargées:', tachesData);
      
      setPlanningMaintenances(planningData);
      setTachesPlannifiees(tachesData);
      setFichesIntervention(fichesData);

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement du planning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTache = () => {
    setEditingTache(null);
    setIsTacheDialogOpen(true);
  };

  const handleEditTache = (tache: TachePlanifie) => {
    setEditingTache(tache);
    setIsTacheDialogOpen(true);
  };

  const handleViewTache = (tache: TachePlanifie) => {
    setSelectedTache(tache);
    setIsDetailOpen(true);
  };

  const handleDeleteTache = async (tache: TachePlanifie) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await planningService.deleteTachePlanifie(tache.id_tachePlanifie!);
        await loadData();
        toast.success('Tâche supprimée avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleMarkCompleted = async (tache: TachePlanifie) => {
    try {
      const updatedTache = { ...tache, statut: 'REALISEE' as StatutTache };
      await planningService.validerTache(tache.id_tachePlanifie!);
      
      // Mettre à jour automatiquement les stocks après intervention
      if (tache.planifiers && tache.planifiers.length > 0) {
        try {
          // Simuler la consommation de pièces lors de la maintenance
          const equipementsMaintenus = tache.planifiers.flatMap(p => 
            p.site.equipementInstalles?.map(ei => ei.equipement.id_equipement!) || []
          );
          
          for (const equipementId of equipementsMaintenus) {
            await stockService.updateStockAfterIntervention({
              equipementId,
              operation: 'MAINTENANCE',
              quantite: 1,
              motif: `Maintenance réalisée - Tâche: ${tache.nom}`
            });
          }
        } catch (stockError) {
          console.warn('Erreur lors de la mise à jour automatique des stocks:', stockError);
          // Ne pas bloquer si la mise à jour des stocks échoue
        }
      }
      
      await loadData();
      toast.success('Tâche marquée comme terminée et déplacée vers l\'historique');
      setIsDetailOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleCancelTache = async (tache: TachePlanifie) => {
    try {
      await planningService.annulerTache(tache.id_tachePlanifie!);
      await loadData();
      toast.success('Tâche annulée');
      setIsDetailOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleRescheduleTache = (tache: TachePlanifie) => {
    setReschedulingTache(tache);
    setIsRescheduleDialogOpen(true);
  };

  const handleAffecterMaintenanceAuto = (maintenance: RequetGetPlanning) => {
    setSelectedMaintenanceAuto(maintenance);
    setIsAffectationDialogOpen(true);
  };

  const handleDownloadFichePDF = async (ficheId: number) => {
    try {
      await planningService.telechargement(ficheId);
      toast.success('Téléchargement du PDF commencé');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement du PDF');
    }
  };

  const handleDownloadDefaillancePDF = async (ficheId: number) => {
    try {
      await planningService.telechargement(ficheId);
      toast.success('Téléchargement du PDF commencé');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement du PDF');
    }
  };

  const getStatutColor = (statut: StatutTache) => {
    switch (statut) {
      case 'PLANIFIEE': return 'blue';
      case 'REALISEE': return 'green';
      case 'ANNULEE': return 'red';
      case 'REPORTEE': return 'orange';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: TypeTachePlanifie) => {
    switch (type) {
      case 'VISITE': return '👁️';
      case 'ENTRETIEN': return '🔧';
      case 'PREVENTIF': return '🛡️';
      default: return '📋';
    }
  };

  const getUrgency = (tache: TachePlanifie) => {
    if (tache.statut !== 'PLANIFIEE') return null;
    
    const today = new Date();
    const plannedDate = new Date(tache.datePrevu);
    const diffTime = plannedDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 1) return 'urgent';
    if (diffDays <= 7) return 'soon';
    return 'normal';
  };

  const getUrgencyBadge = (urgency: string | null) => {
    switch (urgency) {
      case 'overdue': return { label: 'En retard', color: 'red' };
      case 'urgent': return { label: 'Urgent', color: 'red' };
      case 'soon': return { label: 'À venir', color: 'orange' };
      default: return null;
    }
  };

  // ✅ FONCTION POUR OBTENIR L'AFFICHAGE DES SITES CONCERNÉS
  const getSitesConcernes = (tache: TachePlanifie) => {
    // Utiliser les planifiers de la tâche
    if (tache.planifiers && tache.planifiers.length > 0) {
      if (tache.planifiers.length === 1) {
        const site = tache.planifiers[0].site;
        return {
          text: `${site.nom} - ${site.ville}`,
          count: 1,
          sites: [site]
        };
      } else {
        return {
          text: `${tache.planifiers.length} sites concernés`,
          count: tache.planifiers.length,
          sites: tache.planifiers.map(p => p.site)
        };
      }
    }
    
    // Fallback sur l'ancienne structure (sites array)
    if (tache.sites && tache.sites.length > 0) {
      if (tache.sites.length === 1) {
        return {
          text: `${tache.sites[0].nom} - ${tache.sites[0].ville}`,
          count: 1,
          sites: tache.sites
        };
      } else {
        return {
          text: `${tache.sites.length} sites concernés`,
          count: tache.sites.length,
          sites: tache.sites
        };
      }
    }
    
    // Fallback sur le site unique
    if (tache.site) {
      return {
        text: `${tache.site.nom} - ${tache.site.ville}`,
        count: 1,
        sites: [tache.site]
      };
    }
    
    return {
      text: 'Aucun site défini',
      count: 0,
      sites: []
    };
  };

  // Fonction pour calculer la prochaine date d'intervention
  const calculateProchaineDateIntervention = (tache: TachePlanifie): string => {
    if (!tache.frequence) {
      return 'Non calculable';
    }

    // Utiliser les planifiers de la tâche
    const derniereIntervention = tache.planifiers && tache.planifiers.length > 0
      ? tache.planifiers[0]?.datePlanifie 
      : (tache.dernierIntervention && tache.dernierIntervention[0]) || format(new Date(), 'yyyy-MM-dd');
    
    const lastDate = new Date(derniereIntervention);
    let nextDate = new Date(lastDate);

    // Calculer selon le type de fréquence
    if (tache.frequence.frequenceStandard) {
      switch (tache.frequence.frequenceStandard) {
        case 'QUOTIDIENNE':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'HEBDOMADAIRE':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'MENSUELLE':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'BIMENSUELLE':
          nextDate.setMonth(nextDate.getMonth() + 2);
          break;
        case 'TRIMESTRIELLE':
          nextDate.setMonth(nextDate.getMonth() + 3);
          break;
        case 'SEMESTRIELLE':
          nextDate.setMonth(nextDate.getMonth() + 6);
          break;
        case 'ANNUELLE':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
        case 'CINQ_ANS':
          nextDate.setFullYear(nextDate.getFullYear() + 5);
          break;
        case 'DIX_ANS':
          nextDate.setFullYear(nextDate.getFullYear() + 10);
          break;
      }
    } else if (tache.frequence.valeurPersonnalisee && tache.frequence.unitePersonnalisee) {
      const valeur = tache.frequence.valeurPersonnalisee;
      switch (tache.frequence.unitePersonnalisee) {
        case 'JOURS':
          nextDate.setDate(nextDate.getDate() + valeur);
          break;
        case 'SEMAINES':
          nextDate.setDate(nextDate.getDate() + (valeur * 7));
          break;
        case 'MOIS':
          nextDate.setMonth(nextDate.getMonth() + valeur);
          break;
        case 'ANNEES':
          nextDate.setFullYear(nextDate.getFullYear() + valeur);
          break;
        case 'HEURES_UTILISATION':
          // Pour les heures d'utilisation, calculer en fonction des heures moyennes par jour
          if (tache.frequence.heuresMoyennesParJour) {
            const jours = Math.ceil(valeur / tache.frequence.heuresMoyennesParJour);
            nextDate.setDate(nextDate.getDate() + jours);
          }
          break;
      }
    } else if (tache.frequence.heuresTotales && tache.frequence.heuresMoyennesParJour) {
      const jours = Math.ceil(tache.frequence.heuresTotales / tache.frequence.heuresMoyennesParJour);
      nextDate.setDate(nextDate.getDate() + jours);
    }

    try {
      return format(nextDate, 'dd/MM/yyyy', { locale: fr });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'Date invalide';
    }
  };

  // Fonction pour obtenir la dernière date d'intervention affichable
  const getDerniereInterventionDisplay = (tache: TachePlanifie): string => {
    // Utiliser les planifiers de la tâche
    const planifiers = tache.planifiers || [];
    
    if (planifiers.length > 0) {
      const dates = planifiers
        .map(p => p.datePlanifie)
        .filter(date => date)
        .sort()
        .reverse(); // Plus récente en premier
      
      if (dates.length > 0) {
        try {
          return format(new Date(dates[0]), 'dd/MM/yyyy', { locale: fr });
        } catch (error) {
          console.error('Erreur format date planifier:', error);
        }
      }
    }
    
    // Fallback sur l'ancienne structure
    if (tache.dernierIntervention && tache.dernierIntervention.length > 0 && tache.dernierIntervention[0]) {
      try {
        return format(new Date(tache.dernierIntervention[0]), 'dd/MM/yyyy', { locale: fr });
      } catch (error) {
        console.error('Erreur format date intervention:', error);
      }
    }
    
    return 'Aucune';
  };

  // ✅ FILTRAGE MODIFIÉ POUR EXCLURE LES TÂCHES RÉALISÉES
  const filteredTaches = tachesPlannifiees.filter(tache => {
    // ✅ Exclure les tâches avec le statut 'REALISEE'
    if (tache.statut === 'REALISEE') return false;
    
    const planifiers = tache.planifiers || [];
    
    const matchesSearch = tache.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tache.site?.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (planifiers.some(p => 
                           p.site.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.site.ville.toLowerCase().includes(searchTerm.toLowerCase())
                         ));
    const matchesStatut = filterStatut === 'all' || tache.statut === filterStatut;
    const matchesType = filterType === 'all' || tache.type === filterType;
    return matchesSearch && matchesStatut && matchesType;
  });

  // ✅ STATS MODIFIÉES POUR EXCLURE LES TÂCHES RÉALISÉES DU COMPTAGE GLOBAL
  const stats = {
    total: tachesPlannifiees.filter(t => t.statut !== 'REALISEE').length,
    planifiees: tachesPlannifiees.filter(t => t.statut === 'PLANIFIEE').length,
    realisees: tachesPlannifiees.filter(t => t.statut === 'REALISEE').length,
    retard: tachesPlannifiees.filter(t => getUrgency(t) === 'overdue').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du planning...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* <div>
          <h1 className="text-2xl font-bold">Planning des maintenances</h1>
          <p className="text-muted-foreground">Gérez vos tâches planifiées et interventions</p>
        </div> */}
        <div>
          <h1 className="text-2xl font-bold"> </h1>
          <p className="text-muted-foreground"> </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleCreateTache}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle tâche
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setIsFicheDialogOpen(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Fiche d'intervention
          </Button>
        </div>
      </div>

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full justify-start overflow-x-auto">
          <TabsTrigger value="planning" className="flex items-center gap-2 whitespace-nowrap">
            <Clock className="w-4 h-4" />
            Planning actuel
          </TabsTrigger>
          <TabsTrigger value="annuel" className="flex items-center gap-2 whitespace-nowrap">
            <Calendar className="w-4 h-4" />
            Vue annuelle
          </TabsTrigger>
          <TabsTrigger value="automatiques" className="flex items-center gap-2 whitespace-nowrap">
            <RefreshCw className="w-4 h-4" />
            Maintenances auto
          </TabsTrigger>
          <TabsTrigger value="historique" className="flex items-center gap-2 whitespace-nowrap">
            <History className="w-4 h-4" />
            Historique
          </TabsTrigger>
        </TabsList>

        {/* Planning actuel */}
        <TabsContent value="planning" className="space-y-6">
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DetailCard
              title={stats.total.toString()}
              subtitle="Total tâches actives"
              badge={{ label: "Actives", variant: "outline" }}
              gradient
            >
              <div className="flex items-center justify-center pt-2">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </DetailCard>
            
            <DetailCard
              title={stats.planifiees.toString()}
              subtitle="Tâches planifiées"
              badge={{ label: "En cours", variant: "outline", color: "blue" }}
            >
              <div className="text-sm text-muted-foreground">
                {stats.total > 0 ? ((stats.planifiees / stats.total) * 100).toFixed(0) : 0}% du total actif
              </div>
            </DetailCard>
            
            <DetailCard
              title={stats.realisees.toString()}
              subtitle="Tâches réalisées"
              badge={{ label: "Historique", variant: "outline", color: "green" }}
            >
              <div className="text-sm text-muted-foreground">
                Consultables dans l'historique
              </div>
            </DetailCard>
            
            <DetailCard
              title={stats.retard.toString()}
              subtitle="Tâches en retard"
              badge={{ label: "Urgent", variant: "outline", color: "red" }}
            >
              <div className="text-sm text-muted-foreground">
                Nécessitent une attention immédiate
              </div>
            </DetailCard>
          </div>

          {/* Filtres */}
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              placeholder="Rechercher une tâche ou un site..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white max-w-md"
            />
            
            <Select
              value={filterStatut}
              onValueChange={(value) => setFilterStatut(value as StatutTache | 'all')}
            >
              <SelectTrigger className="w-auto min-w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts actifs</SelectItem>
                <SelectItem value="PLANIFIEE">Planifiée</SelectItem>
                <SelectItem value="ANNULEE">Annulée</SelectItem>
                <SelectItem value="REPORTEE">Reportée</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filterType}
              onValueChange={(value) => setFilterType(value as TypeTachePlanifie | 'all')}
            >
              <SelectTrigger className="w-auto min-w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {Object.entries(typeTacheLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span>{getTypeIcon(key as TypeTachePlanifie)}</span>
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Liste des tâches existante */}
          {filteredTaches.map((tache) => {
            const urgency = getUrgency(tache);
            const urgencyBadge = getUrgencyBadge(urgency);
            const sitesConcernes = getSitesConcernes(tache);
            const planifiers = tache.planifiers || [];
            
            // Affichage adaptatif du site
            const siteDisplay = sitesConcernes.count > 0 ? sitesConcernes.text : 'Site non défini';
          
            return (
              <DetailCard
                key={tache.id_tachePlanifie}
                title={tache.nom}
                subtitle={`${typeTacheLabels[tache.type]} `}
                /* subtitle={`${typeTacheLabels[tache.type]} • ${siteDisplay}`} */
                status={{
                  label: statutTacheLabels[tache.statut],
                  variant: 'outline'
                }}
                badge={urgencyBadge ? {
                  label: urgencyBadge.label,
                  variant: 'outline',
                  color: urgencyBadge.color
                } : {
                  label: getTypeIcon(tache.type) + ' ' + typeTacheLabels[tache.type],
                  variant: 'outline'
                }}
                actions={{
                  view: () => handleViewTache(tache),
                  edit: () => handleEditTache(tache),
                  delete: () => handleDeleteTache(tache)
                }}
                className={`hover:shadow-lg transition-all duration-300 ${
                  urgency === 'overdue' ? 'border-red-200 bg-red-50' :
                  urgency === 'urgent' ? 'border-orange-200 bg-orange-50' : ''
                }`}
              >
                <InfoGrid columns={3}>
                  <InfoItem
                    label="Date prévue"
                    value={
                      tache.datePrevu
                        ? format(new Date(tache.datePrevu), 'dd MMMM yyyy', { locale: fr })
                        : 'Date non définie'
                    }
                    icon={<Calendar className="w-4 h-4" />}
                    highlight={urgency === 'overdue' || urgency === 'urgent'}
                  />
                  
                  {/* ✅ AFFICHAGE AMÉLIORÉ DU NOMBRE DE SITES */}
                  {/* <InfoItem
                    label="Sites concernés"
                    value={
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-700">
                          {sitesConcernes.count} site{sitesConcernes.count > 1 ? 's' : ''}
                        </span>
                      </div>
                    }
                    icon={<MapPin className="w-4 h-4" />}
                    highlight={sitesConcernes.count > 1}
                  /> */}
                  
                  <InfoItem
                    label="Responsable"
                    value={tache.responsable || 'Non assigné'}
                    icon={<Clock className="w-4 h-4" />}
                  />
                </InfoGrid>

                {/* ✅ SECTION SUPPLÉMENTAIRE POUR DÉTAILLER LES SITES (SI PLUSIEURS) */}
                {sitesConcernes.count > 1 && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Sites concernés par cette tâche :
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sitesConcernes.sites.slice(0, 3).map((site, index) => (
                        <Badge key={site.id_site || index} variant="outline" className="text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          {site.nom} - {site.ville}
                        </Badge>
                      ))}
                      {sitesConcernes.count > 3 && (
                        <Badge variant="outline" className="text-xs bg-gray-100">
                          +{sitesConcernes.count - 3} autres sites
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions rapides */}
                {tache.statut === 'PLANIFIEE' && (
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkCompleted(tache)}
                      className="border-green-200 hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Terminer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRescheduleTache(tache)}
                      className="border-orange-200 hover:bg-orange-50"
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Reporter
                    </Button>
                  </div>
                )}
              </DetailCard>
            );
          })}
          
          {filteredTaches.length === 0 && (
            <DetailCard
              title="Aucune tâche active trouvée"
              subtitle={searchTerm ? 'Aucun résultat pour votre recherche.' : 'Toutes les tâches sont terminées ou commencez par créer votre première tâche planifiée.'}
            >
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Les tâches réalisées sont automatiquement déplacées vers l'historique.
                  </p>
                  <Button 
                    onClick={handleCreateTache}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer une nouvelle tâche
                  </Button>
                </div>
              </div>
            </DetailCard>
          )}
        </TabsContent>

        {/* Vue annuelle */}
        <TabsContent value="annuel">
          <PlanningAnnuelView onViewTask={handleViewTache} />
        </TabsContent>

        {/* Maintenances automatiques */}
        <TabsContent value="automatiques" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Maintenances automatiques</h3>
              <p className="text-muted-foreground">
                Maintenances générées automatiquement en attente d'affectation
              </p>
            </div>
            <Badge variant="outline">
              {planningMaintenances.length} maintenance(s)
            </Badge>
          </div>

          {planningMaintenances.length === 0 ? (
            <DetailCard
              title="Aucune maintenance automatique"
              subtitle="Aucune maintenance générée automatiquement en attente"
            >
              <div className="text-center py-8">
                <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Les maintenances sont générées automatiquement selon la fréquence définie pour chaque équipement.
                </p>
              </div>
            </DetailCard>
          ) : (
            <div className="grid gap-4">
              {planningMaintenances.map((maintenance, index) => (
                <DetailCard
                  key={index}
                  title={`Maintenance - ${maintenance.equipement.nom}`}
                  subtitle={`${maintenance.equipement.type.replace('_', ' ')} • Réf: ${maintenance.equipement.reference}`}
                  status={{
                    label: maintenance.occurenceMainteance.statut,
                    variant: 'outline'
                  }}
                  badge={{
                    label: "Auto-générée",
                    variant: "outline",
                    color: "purple"
                  }}
                  actions={{
                    assign: () => handleAffecterMaintenanceAuto(maintenance)
                  }}
                >
                  <InfoGrid columns={2}>
                    <InfoItem
                      label="Date installation"
                      value={format(new Date(maintenance.occurenceMainteance.datePrevue), 'dd MMMM yyyy', { locale: fr })}
                      icon={<Calendar className="w-4 h-4" />}
                    />
                    <InfoItem
                      label="Tâche associée"
                      value={`${maintenance.occurenceMainteance.tache?.nom || 0} `}
                      icon={<Clock className="w-4 h-4" />}
                    />
                  </InfoGrid>

                  {maintenance.tacheList && maintenance.tacheList.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Tâches à effectuer:</h4>
                      <div className="flex flex-wrap gap-2">
                        {maintenance.tacheList.map((tache, tacheIndex) => (
                          <Badge key={tacheIndex} variant="outline">
                            {tache.nom} ({tache.type})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action d'affectation */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAffecterMaintenanceAuto(maintenance)}
                      className="border-purple-200 hover:bg-purple-50"
                    >
                      <User className="w-4 h-4 mr-1" />
                      Affecter la maintenance
                    </Button>
                  </div>
                </DetailCard>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Historique */}
        <TabsContent value="historique">
          <HistoriqueMaintenancesView />
        </TabsContent>
      </Tabs>

      {/* Formulaires et vues détaillées */}
      <TachePlanifieeForm
        open={isTacheDialogOpen}
        onOpenChange={setIsTacheDialogOpen}
        onSuccess={loadData}
        initialData={editingTache || undefined}
      />

      <TachePlanifieeDetailView
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        tache={selectedTache}
        onEdit={() => {
          if (selectedTache) {
            setIsDetailOpen(false);
            handleEditTache(selectedTache);
          }
        }}
        onMarkCompleted={() => selectedTache && handleMarkCompleted(selectedTache)}
        onCancel={() => selectedTache && handleCancelTache(selectedTache)}
        onReschedule={() => selectedTache && handleRescheduleTache(selectedTache)}
      />

      {/* Zone Fiches d'intervention et Défaillances */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl">Fiches d'intervention et Défaillances</h2>
            <p className="text-sm text-muted-foreground">Consultez et téléchargez vos rapports d'intervention</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fiches d'intervention */}
          <DetailCard
            title="Fiches d'intervention"
            subtitle={`${fichesIntervention.filter(f => f.type !== 'DEFAILLANCE').length} fiche(s) enregistrée(s)`}
            badge={{ label: "Documents", variant: "outline", color: "blue" }}
          >
            <div className="space-y-3 mt-4 max-h-60 overflow-y-auto">
              {fichesIntervention.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Aucune fiche d'intervention disponible
                </p>
              ) : (
                fichesIntervention.filter(f => f.type !== 'DEFAILLANCE').map((fiche, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <div className="font-medium text-sm">{fiche.type === 'PREVENTIVE' ? 'Maintenance préventive' : 'Intervention corrective'}</div>
                      <div className="text-xs text-muted-foreground">
                        {/* Date formatée si disponible */}
                      </div>
                      {fiche.equipement && (
                        <div className="text-xs text-blue-600 mt-1">
                          {fiche.equipement.nom} - {fiche.equipement.reference}
                        </div>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-blue-300 hover:bg-blue-100"
                      onClick={() => handleDownloadFichePDF(fiche.id_ficheIntervention!)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                ))
              )}
            </div>
          </DetailCard>

          {/* Défaillances */}
          <DetailCard
            title="Déclarations de défaillance"
            subtitle={`${fichesIntervention.filter(f => f.type === 'DEFAILLANCE').length} défaillance(s) signalée(s)`}
            badge={{ label: "Alertes", variant: "outline", color: "red" }}
          >
            <div className="space-y-3 mt-4 max-h-60 overflow-y-auto">
              {fichesIntervention.filter(f => f.type === 'DEFAILLANCE').length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Aucune défaillance signalée
                </p>
              ) : (
                fichesIntervention
                  .filter(f => f.type === 'DEFAILLANCE')
                  .map((defaillance, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">Défaillance signalée</div>
                        <div className="text-xs text-muted-foreground">
                          {/* Date formatée si disponible */}
                        </div>
                        {defaillance.equipement && (
                          <div className="text-xs text-red-600 mt-1">
                            {defaillance.equipement.nom} - {defaillance.equipement.reference}
                          </div>
                        )}
                        {defaillance.problemeRencontre && (
                          <div className="text-xs text-red-600 mt-1 truncate">
                            {defaillance.problemeRencontre}
                          </div>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-300 hover:bg-red-100 ml-3 flex-shrink-0"
                        onClick={() => handleDownloadDefaillancePDF(defaillance.id_ficheIntervention!)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  ))
              )}
            </div>
          </DetailCard>
        </div>
      </div>

      <FicheInterventionForm
        open={isFicheDialogOpen}
        onOpenChange={setIsFicheDialogOpen}
        onSuccess={() => {
          toast.success('Fiche d\'intervention créée avec succès');
          loadData();
        }}
      />

      <DefaillanceForm
        open={isDefaillanceDialogOpen}
        onOpenChange={setIsDefaillanceDialogOpen}
        onSuccess={() => {
          toast.success('Défaillance signalée avec succès');
          loadData();
        }}
      />

      <RescheduleDialog
        open={isRescheduleDialogOpen}
        onOpenChange={setIsRescheduleDialogOpen}
        tache={reschedulingTache}
        onSuccess={loadData}
      />

      <AffectationTacheAutoForm
        open={isAffectationDialogOpen}
        onOpenChange={setIsAffectationDialogOpen}
        maintenanceAuto={selectedMaintenanceAuto}
        onSuccess={loadData}
      />
    </div>
  );
};