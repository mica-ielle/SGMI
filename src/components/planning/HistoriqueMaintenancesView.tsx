import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { InfoGrid, InfoItem } from '../ui/info-grid';
import { DetailCard } from '../ui/detail-card';
import { 
  History, 
  Search, 
  Calendar, 
  MapPin, 
  Settings, 
  User, 
  FileText,
  Download,
  Filter,
  Clock,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner@2.0.3';
import { planningService } from '../../services/planningService';
import type { TachePlanifie, FicheIntervention, TypeTachePlanifie } from '../../types';

interface HistoriqueMaintenancesViewProps {
  onViewIntervention?: (fiche: FicheIntervention) => void;
}

export const HistoriqueMaintenancesView = ({ onViewIntervention }: HistoriqueMaintenancesViewProps) => {
  const [maintenancesTerminees, setMaintenancesTerminees] = useState<TachePlanifie[]>([]);
  const [fichesIntervention, setFichesIntervention] = useState<FicheIntervention[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TypeTachePlanifie | 'all'>('all');
  const [filterPeriod, setFilterPeriod] = useState<'7days' | '30days' | '90days' | 'year' | 'all'>('all');
  const [filterSite, setFilterSite] = useState<string>('all');

  useEffect(() => {
    loadHistorique();
  }, []);

  const loadHistorique = async () => {
    try {
      setLoading(true);
      const [taches, fiches] = await Promise.all([
        planningService.getAllTachesPlanifiees(),
        planningService.getAllFichesIntervention()
      ]);

      // Filtrer les tâches terminées
      const tachesTerminees = taches.filter(tache => 
        tache.statut === 'REALISEE' && tache.datePrevu
      );

      setMaintenancesTerminees(tachesTerminees);
      setFichesIntervention(fiches);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMaintenances = () => {
    let filtered = maintenancesTerminees;

    // Filtre par texte
    if (searchTerm) {
      filtered = filtered.filter(tache =>
        tache.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tache.responsable?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tache.planifiers?.some(p => 
          p.site.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.site.ville.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filtre par type
    if (filterType !== 'all') {
      filtered = filtered.filter(tache => tache.type === filterType);
    }

    // Filtre par période
    if (filterPeriod !== 'all') {
      const now = new Date();
      const daysMap = {
        '7days': 7,
        '30days': 30,
        '90days': 90,
        'year': 365
      };
      
      const days = daysMap[filterPeriod];
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      
      filtered = filtered.filter(tache => 
        tache.dateRealisation && new Date(tache.dateRealisation) >= cutoffDate
      );
    }

    // Filtre par site
    if (filterSite !== 'all') {
      filtered = filtered.filter(tache =>
        tache.planifiers?.some(p => p.site.nom === filterSite) ||
        tache.site?.nom === filterSite
      );
    }

    // Trier par date de réalisation (plus récent en premier)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.dateRealisation || 0);
      const dateB = new Date(b.dateRealisation || 0);
      return dateB.getTime() - dateA.getTime();
    });
  };

  const getSitesUniques = () => {
    const sites = new Set<string>();
    maintenancesTerminees.forEach(tache => {
      if (tache.planifiers) {
        tache.planifiers.forEach(p => sites.add(p.site.nom));
      } else if (tache.site) {
        sites.add(tache.site.nom);
      }
    });
    return Array.from(sites).sort();
  };

  const getTypeIcon = (type: TypeTachePlanifie) => {
    switch (type) {
      case 'VISITE': return '👁️';
      case 'ENTRETIEN': return '🔧';
      case 'PREVENTIF': return '🛡️';
      default: return '📋';
    }
  };

  const getTypeLabel = (type: TypeTachePlanifie) => {
    switch (type) {
      case 'VISITE': return 'Visite';
      case 'ENTRETIEN': return 'Entretien';
      case 'PREVENTIF': return 'Préventif';
      default: return type;
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '7days': return '7 derniers jours';
      case '30days': return '30 derniers jours';
      case '90days': return '90 derniers jours';
      case 'year': return 'Cette année';
      case 'all': return 'Toute la période';
      default: return period;
    }
  };

  const getSiteDisplay = (tache: TachePlanifie) => {
    if (tache.planifiers && tache.planifiers.length > 0) {
      const site = tache.planifiers[0].site;
      const count = tache.planifiers.length;
      return count > 1 
        ? `${site.nom} (+${count - 1} autres sites)`
        : `${site.nom} - ${site.ville}`;
    }
    return tache.site ? `${tache.site.nom} - ${tache.site.ville}` : 'Site non défini';
  };

  const handleDownloadReport = async (tache: TachePlanifie) => {
    try {
      // Chercher une fiche d'intervention associée
      const ficheAssociee = fichesIntervention.find(fiche => 
        fiche.tachePlanifie?.id_tachePlanifie === tache.id_tachePlanifie
      );

      if (ficheAssociee) {
        await planningService.telechargement(ficheAssociee.id_ficheIntervention!);
        toast.success('Téléchargement du rapport commencé');
      } else {
        toast.info('Aucun rapport d\'intervention disponible pour cette tâche');
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement du rapport');
    }
  };

  const filteredMaintenances = getFilteredMaintenances();
  const sitesUniques = getSitesUniques();

  const stats = {
    total: maintenancesTerminees.length,
    thisMonth: maintenancesTerminees.filter(t => {
      if (!t.dateRealisation) return false;
      const date = new Date(t.dateRealisation);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    sitesCount: sitesUniques.length,
    avgPerMonth: maintenancesTerminees.length > 0 ? Math.round(maintenancesTerminees.length / 12) : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <History className="w-6 h-6" />
          Historique des maintenances
        </h2>
        <p className="text-muted-foreground">
          Consultez toutes les maintenances réalisées et leurs rapports
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DetailCard
          title={stats.total.toString()}
          subtitle="Maintenances réalisées"
          badge={{ label: "Total", variant: "outline" }}
        >
          <CheckCircle className="w-8 h-8 text-green-600" />
        </DetailCard>
        
        {/* <DetailCard
          title={stats.thisMonth.toString()}
          subtitle="Ce mois-ci"
          badge={{ label: "Récent", variant: "outline", color: "blue" }}
        >
          <Calendar className="w-8 h-8 text-blue-600" />
        </DetailCard>
        
        <DetailCard
          title={stats.sitesCount.toString()}
          subtitle="Sites concernés"
          badge={{ label: "Géographie", variant: "outline", color: "purple" }}
        >
          <MapPin className="w-8 h-8 text-purple-600" />
        </DetailCard>
        
        <DetailCard
          title={stats.avgPerMonth.toString()}
          subtitle="Moyenne par mois"
          badge={{ label: "Tendance", variant: "outline", color: "orange" }}
        >
          <Clock className="w-8 h-8 text-orange-600" />
        </DetailCard> */}
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={filterType} onValueChange={(value: TypeTachePlanifie | 'all') => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Type de maintenance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="VISITE">👁️ Visite</SelectItem>
                <SelectItem value="ENTRETIEN">🔧 Entretien</SelectItem>
                <SelectItem value="PREVENTIF">🛡️ Préventif</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterPeriod} onValueChange={(value: any) => setFilterPeriod(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 derniers jours</SelectItem>
                <SelectItem value="30days">30 derniers jours</SelectItem>
                <SelectItem value="90days">90 derniers jours</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
                <SelectItem value="all">Toute la période</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterSite} onValueChange={setFilterSite}>
              <SelectTrigger>
                <SelectValue placeholder="Site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les sites</SelectItem>
                {sitesUniques.map(site => (
                  <SelectItem key={site} value={site}>{site}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des maintenances */}
      <div className="space-y-4">
        {filteredMaintenances.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune maintenance trouvée</h3>
              <p className="text-gray-600">
                {searchTerm || filterType !== 'all' || filterPeriod !== 'all' || filterSite !== 'all'
                  ? 'Aucun résultat ne correspond à vos critères de recherche.'
                  : 'Aucune maintenance n\'a encore été réalisée.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMaintenances.map((tache) => (
            <DetailCard
              key={tache.id_tachePlanifie}
              title={tache.nom}
              subtitle={`${getTypeLabel(tache.type)} • ${getSiteDisplay(tache)}`}
              status={{
                label: 'Réalisée',
                variant: 'outline',
                color: 'green'
              }}
              badge={{
                label: getTypeIcon(tache.type) + ' ' + getTypeLabel(tache.type),
                variant: 'outline'
              }}
              /* actions={{
                download: () => handleDownloadReport(tache)
              }} */
              className="hover:shadow-lg transition-all duration-300"
            >
              <InfoGrid columns={3}>
                <InfoItem
                  label="Date de réalisation"
                  value={
                    tache.dateRealisation
                      ? format(new Date(tache.dateRealisation), 'dd MMMM yyyy', { locale: fr })
                      : 'Date non renseignée'
                  }
                  icon={<CheckCircle className="w-4 h-4" />}
                  highlight
                />
                <InfoItem
                  label="Responsable"
                  value={tache.responsable || 'Non assigné'}
                  icon={<User className="w-4 h-4" />}
                />
                <InfoItem
                  label="Date prévue initiale"
                  value={
                    tache.datePrevu
                      ? format(new Date(tache.datePrevu), 'dd MMMM yyyy', { locale: fr })
                      : 'Date non définie'
                  }
                  icon={<Calendar className="w-4 h-4" />}
                />
              </InfoGrid>

              {/* Informations supplémentaires */}
              {tache.notes && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Notes :</span>
                    <p className="mt-1 text-gray-600">{tache.notes}</p>
                  </div>
                </div>
              )}

              {/* Actions rapides */}
              {/* <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadReport(tache)}
                  className="border-blue-200 hover:bg-blue-50"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Télécharger le rapport
                </Button>
                
                {fichesIntervention.find(f => f.tachePlanifie?.id_tachePlanifie === tache.id_tachePlanifie) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const fiche = fichesIntervention.find(f => f.tachePlanifie?.id_tachePlanifie === tache.id_tachePlanifie);
                      if (fiche && onViewIntervention) {
                        onViewIntervention(fiche);
                      }
                    }}
                    className="border-green-200 hover:bg-green-50"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Voir l'intervention
                  </Button>
                )}
              </div> */}
            </DetailCard>
          ))
        )}
      </div>

      {/* Pagination ou indicateur de résultats */}
      {filteredMaintenances.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          {filteredMaintenances.length} maintenance(s) trouvée(s) sur {maintenancesTerminees.length} au total
        </div>
      )}
    </div>
  );
};