import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Clock, CheckCircle, AlertTriangle, Filter, Calendar, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { DetailCard } from '../components/ui/detail-card';
import { InfoGrid, InfoItem } from '../components/ui/info-grid';
import { TachePlanifieeForm } from '../components/planning/TachePlanifieeForm';
import { TachePlanifieeDetailView } from '../components/planning/TachePlanifieeDetailView';
import { FicheInterventionForm } from '../components/interventions/FicheInterventionForm';
import { DefaillanceForm } from '../components/interventions/DefaillanceForm';
import { planningService } from '../services/planningService';
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
  const [resolvedSites, setResolvedSites] = useState(null);

  
  // États des dialogs
  const [isTacheDialogOpen, setIsTacheDialogOpen] = useState(false);
  const [isFicheDialogOpen, setIsFicheDialogOpen] = useState(false);
  const [isDefaillanceDialogOpen, setIsDefaillanceDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTache, setSelectedTache] = useState<TachePlanifie | null>(null);
  const [editingTache, setEditingTache] = useState<TachePlanifie | null>(null);
  
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
      const [planningData, tachesData, fichesData, sitesData] = await Promise.all([
        planningService.getPlanning(),
        planningService.getAllTachesPlanifiees(),
        planningService.getAllFichesIntervention(),
        siteService.getAll()
      ]);
      setPlanningMaintenances(planningData);
      setTachesPlannifiees(tachesData);
      setFichesIntervention(fichesData);

    // Construire un mapping des sites par ID de tâche
    const sitesRésolus: Record<string, Site> = {};

    tachesData.forEach((tache) => {
      const site = sitesData.find((s) => s.id_site === tache.id_site);
      if (site) {
        sitesRésolus[tache.id_tachePlanifie] = site;
      }
    });

    // Mettre à jour l’état des sites résolus
    setResolvedSites(sitesRésolus);


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
      await loadData();
      toast.success('Tâche marquée comme terminée');
      setIsDetailOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleCancelTache = async (tache: TachePlanifie) => {
    try {
      const updatedTache = { ...tache, statut: 'ANNULEE' as StatutTache };
      await planningService.updateTachePlanifie(tache.id_tachePlanifie!, {
        tachePlanifie: updatedTache,
        siteId: tache.site?.id_site || 0
      });
      await loadData();
      toast.success('Tâche annulée');
      setIsDetailOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleRescheduleTache = (tache: TachePlanifie) => {
    setSelectedTache(tache);
    setEditingTache(tache);
    setIsDetailOpen(false);
    setIsTacheDialogOpen(true);
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

  const filteredTaches = tachesPlannifiees.filter(tache => {
    const matchesSearch = tache.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tache.site?.nom.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatut = filterStatut === 'all' || tache.statut === filterStatut;
    const matchesType = filterType === 'all' || tache.type === filterType;
    return matchesSearch && matchesStatut && matchesType;
  });

  const stats = {
    total: tachesPlannifiees.length,
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


  const sitesByTacheId = Object.fromEntries(
    filteredTaches.map((tache) => [
      tache.id_tachePlanifie,
      siteService.getByTp(tache.id_tachePlanifie)
    ])
  )


  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planning des maintenances</h1>
          <p className="text-muted-foreground">Gérez vos tâches planifiées et interventions</p>
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
          
         {/*  <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => setIsDefaillanceDialogOpen(true)}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Signaler défaillance
          </Button> */}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DetailCard
          title={stats.total.toString()}
          subtitle="Total tâches"
          badge={{ label: "Toutes", variant: "outline" }}
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
            {stats.total > 0 ? ((stats.planifiees / stats.total) * 100).toFixed(0) : 0}% du total
          </div>
        </DetailCard>
        
        <DetailCard
          title={stats.realisees.toString()}
          subtitle="Tâches réalisées"
          badge={{ label: "Terminées", variant: "outline", color: "green" }}
        >
          <div className="text-sm text-muted-foreground">
            {stats.total > 0 ? ((stats.realisees / stats.total) * 100).toFixed(0) : 0}% du total
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
            <SelectItem value="all">Tous les statuts</SelectItem>
            {Object.entries(statutTacheLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
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

      {/* Liste des tâches */}
      <div className="grid gap-4">
        {filteredTaches.map((tache) => {
          const urgency = getUrgency(tache);
          const urgencyBadge = getUrgencyBadge(urgency);
          
          const site = sitesByTacheId[tache.id_tachePlanifie];
        
console.log('Site brut:', site);
console.log('Type:', typeof site);
console.log('Nom du site:', site?.nom);

                          
          return (
            <DetailCard
              key={tache.id_tachePlanifie}
              title={tache.nom}
              subtitle={`${typeTacheLabels[tache.type]} • ${site ? `${site.nom} - ${site.ville}` : 'Site non défini'}`}
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
                <InfoItem
                  label="Responsable"
                  value={tache.responsable || 'Non assigné'}
                  icon={<Clock className="w-4 h-4" />}
                />
                <InfoItem
                  label="Dernière intervention"
                  value={tache.dernierIntervention ? 
                    format(new Date(tache.dernierIntervention), 'dd/MM/yyyy', { locale: fr }) : 
                    'Aucune'
                  }
                  icon={<CheckCircle className="w-4 h-4" />}
                />
              </InfoGrid>

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
            title="Aucune tâche trouvée"
            subtitle={searchTerm ? 'Aucun résultat pour votre recherche.' : 'Commencez par créer votre première tâche planifiée.'}
          >
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <Button 
                onClick={handleCreateTache}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer la première tâche
              </Button>
            </div>
          </DetailCard>
        )}
      </div>

      {/* Maintenances automatiques générées */}
      {planningMaintenances.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Maintenances automatiques générées</h2>
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
              >
                <InfoGrid columns={2}>
                  <InfoItem
                    label="Date prévue"
                    value={format(new Date(maintenance.occurenceMainteance.datePrevue), 'dd MMMM yyyy', { locale: fr })}
                    icon={<Calendar className="w-4 h-4" />}
                  />
                  <InfoItem
                    label="Tâches associées"
                    value={`${maintenance.tacheList?.length || 0} tâche(s)`}
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
              </DetailCard>
            ))}
          </div>
        </div>
      )}

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
                        
                        {/* {format(new Date(fiche.dateHeureIntervention), 'dd/MM/yyyy HH:mm', { locale: fr })} */}
                        
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
                          {/* {format(new Date(defaillance.dateHeureIntervention), 'dd/MM/yyyy HH:mm', { locale: fr })}
                           */}
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
    </div>
  );
};