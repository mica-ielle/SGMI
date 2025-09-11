import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Edit } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { planningService } from '../services/planningService';
import { siteService } from '../services/siteService';
import type { 
  RequetGetPlanning, 
  TachePlanifie, 
  StatutMaintenance, 
  StatutTache,
  TypeTachePlanifie,
  Site,
  FicheIntervention,
  TypeIntervention,
  Resultat
} from '../types';

const statutMaintenanceLabels: Record<StatutMaintenance, string> = {
  PLANIFIEE: 'Planifiée',
  REALISEE: 'Réalisée',
  ANNULEE: 'Annulée',
  REPORTEE: 'Reportée'
};

const statutTacheLabels: Record<StatutTache, string> = {
  PLANIFIEE: 'Planifiée',
  REALISEE: 'Réalisée',
  ANNULEE: 'Annulée',
  REPORTEE: 'Reportée'
};

const typeTachePlanifieLabels: Record<TypeTachePlanifie, string> = {
  VISITE: 'Visite',
  ENTRETIEN: 'Entretien',
  PREVENTIF: 'Préventif'
};

const getStatutColor = (statut: StatutMaintenance | StatutTache) => {
  switch (statut) {
    case 'PLANIFIEE': return 'bg-blue-100 text-blue-800';
    case 'REALISEE': return 'bg-green-100 text-green-800';
    case 'ANNULEE': return 'bg-red-100 text-red-800';
    case 'REPORTEE': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatutIcon = (statut: StatutMaintenance | StatutTache) => {
  switch (statut) {
    case 'PLANIFIEE': return Clock;
    case 'REALISEE': return CheckCircle;
    case 'ANNULEE': return XCircle;
    case 'REPORTEE': return AlertTriangle;
    default: return Clock;
  }
};

export const PlanningPage = () => {
  const [planning, setPlanning] = useState<RequetGetPlanning[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('planning');
  
  // États pour les dialogs
  const [isTacheDialogOpen, setIsTacheDialogOpen] = useState(false);
  const [isFicheDialogOpen, setIsFicheDialogOpen] = useState(false);
  const [isDefaillanceDialogOpen, setIsDefaillanceDialogOpen] = useState(false);
  
  // États des formulaires
  const [formTache, setFormTache] = useState<TachePlanifie>({
    nom: '',
    statut: 'PLANIFIEE' as StatutTache,
    type: 'VISITE' as TypeTachePlanifie,
    datePrevu: ''
  });
  
  const [formFiche, setFormFiche] = useState<FicheIntervention>({
    type: 'MAINTENANCE_PLANIFIEE' as TypeIntervention,
    dateHeureIntervention: '',
    descriptionIntervention: '',
    coutTotal: 0
  });

  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [planningData, sitesData] = await Promise.all([
        planningService.getPlanning(),
        siteService.getAll()
      ]);
      setPlanning(planningData);
      setSites(sitesData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTache = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiteId) return;
    
    try {
      await planningService.createTachePlanifie({
        tachePlanifie: formTache,
        siteId: selectedSiteId
      });
      await loadData();
      setIsTacheDialogOpen(false);
      resetFormTache();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleCreateFiche = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implémenter la création de fiche d'intervention
      console.log('Création fiche:', formFiche);
      setIsFicheDialogOpen(false);
      resetFormFiche();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleCreateDefaillance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formFiche.problemeRencontre || !formFiche.cause) {
        alert('Le problème et la cause sont obligatoires pour une défaillance');
        return;
      }
      
      const ficheDefaillance: FicheIntervention = {
        ...formFiche,
        type: 'DEFAILLANCE' as TypeIntervention
      };
      
      // TODO: Implémenter la création de défaillance
      console.log('Création défaillance:', ficheDefaillance);
      setIsDefaillanceDialogOpen(false);
      resetFormFiche();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const resetFormTache = () => {
    setFormTache({
      nom: '',
      statut: 'PLANIFIEE' as StatutTache,
      type: 'VISITE' as TypeTachePlanifie,
      datePrevu: ''
    });
    setSelectedSiteId(null);
  };

  const resetFormFiche = () => {
    setFormFiche({
      type: 'MAINTENANCE_PLANIFIEE' as TypeIntervention,
      dateHeureIntervention: '',
      descriptionIntervention: '',
      coutTotal: 0
    });
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Planning des maintenances</h1>
        
        <div className="flex space-x-3">
          <Dialog open={isTacheDialogOpen} onOpenChange={setIsTacheDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Tâche planifiée
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nouvelle tâche planifiée</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleCreateTache} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site">Site *</Label>
                  <Select value={selectedSiteId?.toString() || ''} onValueChange={(value) => setSelectedSiteId(Number(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un site" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.id_site} value={site.id_site!.toString()}>
                          {site.nom} - {site.ville}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom de la tâche *</Label>
                  <Input
                    id="nom"
                    value={formTache.nom}
                    onChange={(e) => setFormTache(prev => ({ ...prev, nom: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type de tâche</Label>
                    <Select 
                      value={formTache.type} 
                      onValueChange={(value) => setFormTache(prev => ({ ...prev, type: value as TypeTachePlanifie }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(typeTachePlanifieLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="datePrevu">Date prévue</Label>
                    <Input
                      id="datePrevu"
                      type="date"
                      value={formTache.datePrevu}
                      onChange={(e) => setFormTache(prev => ({ ...prev, datePrevu: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={() => setIsTacheDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    Créer
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isFicheDialogOpen} onOpenChange={setIsFicheDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Fiche d'intervention
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nouvelle fiche d'intervention</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleCreateFiche} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateHeureIntervention">Date et heure *</Label>
                    <Input
                      id="dateHeureIntervention"
                      type="datetime-local"
                      value={formFiche.dateHeureIntervention}
                      onChange={(e) => setFormFiche(prev => ({ ...prev, dateHeureIntervention: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="coutTotal">Coût total (€)</Label>
                    <Input
                      id="coutTotal"
                      type="number"
                      step="0.01"
                      value={formFiche.coutTotal}
                      onChange={(e) => setFormFiche(prev => ({ ...prev, coutTotal: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="descriptionIntervention">Description de l'intervention *</Label>
                  <Textarea
                    id="descriptionIntervention"
                    value={formFiche.descriptionIntervention}
                    onChange={(e) => setFormFiche(prev => ({ ...prev, descriptionIntervention: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={() => setIsFicheDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    Créer
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDefaillanceDialogOpen} onOpenChange={setIsDefaillanceDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Défaillance
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Enregistrer une défaillance</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleCreateDefaillance} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateHeureIntervention">Date et heure *</Label>
                    <Input
                      id="dateHeureIntervention"
                      type="datetime-local"
                      value={formFiche.dateHeureIntervention}
                      onChange={(e) => setFormFiche(prev => ({ ...prev, dateHeureIntervention: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="coutTotal">Coût total (€)</Label>
                    <Input
                      id="coutTotal"
                      type="number"
                      step="0.01"
                      value={formFiche.coutTotal}
                      onChange={(e) => setFormFiche(prev => ({ ...prev, coutTotal: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="problemeRencontre">Problème rencontré *</Label>
                  <Textarea
                    id="problemeRencontre"
                    value={formFiche.problemeRencontre || ''}
                    onChange={(e) => setFormFiche(prev => ({ ...prev, problemeRencontre: e.target.value }))}
                    required
                    placeholder="Décrivez le problème rencontré..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cause">Cause *</Label>
                  <Textarea
                    id="cause"
                    value={formFiche.cause || ''}
                    onChange={(e) => setFormFiche(prev => ({ ...prev, cause: e.target.value }))}
                    required
                    placeholder="Décrivez la cause du problème..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="descriptionIntervention">Description de l'intervention</Label>
                  <Textarea
                    id="descriptionIntervention"
                    value={formFiche.descriptionIntervention}
                    onChange={(e) => setFormFiche(prev => ({ ...prev, descriptionIntervention: e.target.value }))}
                    placeholder="Décrivez les actions menées..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={() => setIsDefaillanceDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-red-600 hover:bg-red-700">
                    Enregistrer la défaillance
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Contenu principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="planning">Vue Planning</TabsTrigger>
          <TabsTrigger value="calendar">Vue Calendrier</TabsTrigger>
        </TabsList>
        
        <TabsContent value="planning" className="space-y-4">
          <div className="grid gap-4">
            {planning.map((item, index) => {
              const StatutIcon = getStatutIcon(item.occurenceMainteance.statut);
              
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center space-x-3">
                          <StatutIcon className="w-5 h-5 text-purple-600" />
                          <span>Maintenance - {item.equipement.nom}</span>
                          <Badge className={getStatutColor(item.occurenceMainteance.statut)}>
                            {statutMaintenanceLabels[item.occurenceMainteance.statut]}
                          </Badge>
                        </CardTitle>
                        <p className="text-gray-600">
                          Équipement: {item.equipement.reference} - {item.equipement.nom}
                        </p>
                        <p className="text-sm text-gray-500">
                          Date prévue: {new Date(item.occurenceMainteance.datePrevue).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {item.tacheList && item.tacheList.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">
                          Tâches à effectuer ({item.tacheList.length})
                        </h4>
                        <div className="space-y-2">
                          {item.tacheList.map((tache, tacheIndex) => (
                            <div key={tacheIndex} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                              <div>
                                <span className="font-medium">{tache.nom}</span>
                                <Badge variant="outline" className="ml-2">
                                  {tache.type}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            
            {planning.length === 0 && (
              <Card className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Aucune maintenance planifiée
                </h3>
                <p className="text-gray-500">
                  Les maintenances apparaîtront ici une fois des équipements installés sur des sites.
                </p>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="calendar" className="space-y-4">
          <Card className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Vue calendrier en développement
            </h3>
            <p className="text-gray-500">
              La vue calendrier sera disponible prochainement.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};