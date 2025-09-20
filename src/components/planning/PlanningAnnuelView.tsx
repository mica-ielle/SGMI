import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Settings, Eye, Filter, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { DetailCard } from '../ui/detail-card';
import { InfoGrid, InfoItem } from '../ui/info-grid';
import { Separator } from '../ui/separator';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addYears, subYears, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import { planningService } from '../../services/planningService';
import { toast } from '../../utils/toast';
import type { TachePlanifie, TypeTachePlanifie, OccurrenceFuture } from '../../types';

interface MaintenanceEvent {
  tache: TachePlanifie;
  date: Date;
  type: 'scheduled' | 'overdue' | 'upcoming';
  isOverdue?: boolean;
  daysFromNow?: number;
  site?: {
    id_site: number;
    nom: string;
    ville: string;
  };
}

interface PlanningAnnuelViewProps {
  onViewTask?: (tache: TachePlanifie) => void;
}

type ViewMode = 'calendar' | 'list';
type CalendarView = 'month' | 'year';
type PeriodeFilter = 'semaine' | 'mois' | 'trimestre' | 'annee' | 'tout';
type GroupBy = 'date' | 'site' | 'type' | 'mois';

export const PlanningAnnuelView = ({ onViewTask }: PlanningAnnuelViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [calendarView, setCalendarView] = useState<CalendarView>('year');
  const [maintenances, setMaintenances] = useState<MaintenanceEvent[]>([]);
  const [allOccurrences, setAllOccurrences] = useState<OccurrenceFuture[]>([]);
  const [filteredOccurrences, setFilteredOccurrences] = useState<OccurrenceFuture[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtres pour la vue liste
  const [periodeFilter, setPeriodeFilter] = useState<PeriodeFilter>('annee');
  const [typeFilter, setTypeFilter] = useState<TypeTachePlanifie | 'all'>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState<GroupBy>('mois');
  const [showOnlyOverdue, setShowOnlyOverdue] = useState(false);

  useEffect(() => {
    loadMaintenances();
  }, [currentDate, calendarView]);

  useEffect(() => {
    if (viewMode === 'list') {
      loadOccurrences();
    }
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === 'list') {
      applyFilters();
    }
  }, [allOccurrences, periodeFilter, typeFilter, siteFilter, searchTerm, showOnlyOverdue]);

  const loadMaintenances = async () => {
    try {
      setLoading(true);
      const taches = await planningService.getAllTachesPlanifiees();
      
      // Générer les événements de maintenance pour l'année en cours
      const events: MaintenanceEvent[] = [];
      const today = new Date();
      const startDate = calendarView === 'year' ? new Date(currentDate.getFullYear(), 0, 1) : startOfMonth(currentDate);
      const endDate = calendarView === 'year' ? new Date(currentDate.getFullYear(), 11, 31) : endOfMonth(currentDate);

      taches.forEach(tache => {
        if (tache.statut === 'PLANIFIEE' && tache.datePrevu) {
          const tacheDate = new Date(tache.datePrevu);
          
          if (tacheDate >= startDate && tacheDate <= endDate) {
            let type: 'scheduled' | 'overdue' | 'upcoming' = 'scheduled';
            let isOverdue = false;
            let daysFromNow: number | undefined;
            
            const diffTime = tacheDate.getTime() - today.getTime();
            daysFromNow = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (tacheDate < today) {
              type = 'overdue';
              isOverdue = true;
            } else if (daysFromNow <= 7) {
              type = 'upcoming';
            }

            // Extraire les informations de site depuis les planifiers
            let site;
            if (tache.planifiers && tache.planifiers.length > 0) {
              const firstPlanifier = tache.planifiers[0];
              site = {
                id_site: firstPlanifier.site.id_site,
                nom: firstPlanifier.site.nom,
                ville: firstPlanifier.site.ville
              };
            }

            events.push({
              tache,
              date: tacheDate,
              type,
              isOverdue,
              daysFromNow,
              site
            });
          }
        }
      });

      setMaintenances(events);
    } catch (error) {
      console.error('Erreur lors du chargement des maintenances:', error);
      toast.error('Erreur lors du chargement du planning');
    } finally {
      setLoading(false);
    }
  };

  const loadOccurrences = async () => {
    try {
      setLoading(true);
      const data = await planningService.getOccurrencesSur3Ans();
      setAllOccurrences(data);
    } catch (error) {
      console.error('Erreur lors du chargement des occurrences:', error);
      toast.error('Erreur lors du chargement des occurrences');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allOccurrences];

    // Filtre par période
    if (periodeFilter !== 'tout') {
      const today = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (periodeFilter) {
        case 'semaine':
          startDate = startOfWeek(today, { weekStartsOn: 1 });
          endDate = endOfWeek(today, { weekStartsOn: 1 });
          break;
        case 'mois':
          startDate = startOfMonth(today);
          endDate = endOfMonth(today);
          break;
        case 'trimestre':
          startDate = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
          endDate = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3 + 3, 0);
          break;
        case 'annee':
          startDate = startOfYear(today);
          endDate = endOfYear(today);
          break;
        default:
          startDate = today;
          endDate = new Date(today.getTime() + (3 * 365 * 24 * 60 * 60 * 1000));
      }

      filtered = filtered.filter(occ => {
        const date = new Date(occ.date);
        return date >= startDate && date <= endDate;
      });
    }

    // Filtre par type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(occ => occ.tache.type === typeFilter);
    }

    // Filtre par site
    if (siteFilter !== 'all') {
      filtered = filtered.filter(occ => occ.site.nom === siteFilter);
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(occ =>
        occ.tache.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occ.site.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occ.site.ville.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre en retard uniquement
    if (showOnlyOverdue) {
      filtered = filtered.filter(occ => occ.isOverdue);
    }

    setFilteredOccurrences(filtered);
  };

  const groupOccurrences = () => {
    const grouped: { [key: string]: OccurrenceFuture[] } = {};

    filteredOccurrences.forEach(occ => {
      let key: string;

      switch (groupBy) {
        case 'date':
          key = format(new Date(occ.date), 'dd/MM/yyyy');
          break;
        case 'site':
          key = `${occ.site.nom} - ${occ.site.ville}`;
          break;
        case 'type':
          key = getTypeLabel(occ.tache.type);
          break;
        case 'mois':
          key = format(new Date(occ.date), 'MMMM yyyy', { locale: fr });
          break;
        default:
          key = 'Toutes';
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(occ);
    });

    // Trier les groupes par clé
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      if (groupBy === 'date' || groupBy === 'mois') {
        // Pour les dates, trier chronologiquement
        const dateA = grouped[a][0].date;
        const dateB = grouped[b][0].date;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      }
      return a.localeCompare(b);
    });

    return sortedKeys.map(key => ({
      group: key,
      occurrences: grouped[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }));
  };

  const getSitesUniques = () => {
    const sites = new Set<string>();
    if (viewMode === 'list') {
      allOccurrences.forEach(occ => sites.add(occ.site.nom));
    } else {
      maintenances.forEach(maintenance => {
        if (maintenance.site) {
          sites.add(maintenance.site.nom);
        }
      });
    }
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

  const getTypeLabel = (type: TypeTachePlanifie): string => {
    switch (type) {
      case 'VISITE': return 'Visite';
      case 'ENTRETIEN': return 'Entretien';
      case 'PREVENTIF': return 'Préventif';
      default: return type;
    }
  };

  const getEventColor = (type: 'scheduled' | 'overdue' | 'upcoming') => {
    switch (type) {
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'upcoming': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getUrgencyBadge = (occ: OccurrenceFuture) => {
    if (occ.isOverdue) {
      return { label: 'En retard', color: 'red' };
    }
    if (occ.daysFromNow !== undefined && occ.daysFromNow <= 7) {
      return { label: 'Urgent', color: 'orange' };
    }
    if (occ.daysFromNow !== undefined && occ.daysFromNow <= 30) {
      return { label: 'À venir', color: 'yellow' };
    }
    return { label: 'Planifié', color: 'blue' };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'next' ? addYears(prev, 1) : subYears(prev, 1));
  };

  const getMaintenancesForDate = (date: Date) => {
    return maintenances.filter(maintenance => isSameDay(maintenance.date, date));
  };

  const exportData = () => {
    const dataToExport = viewMode === 'list' ? filteredOccurrences : maintenances;
    
    const csvData = dataToExport.map(item => {
      if ('site' in item && item.site) {
        return [
          format(new Date(item.date), 'dd/MM/yyyy'),
          item.tache.nom,
          getTypeLabel(item.tache.type),
          item.site.nom,
          item.site.ville,
          item.tache.responsable || 'Non assigné',
          'isOverdue' in item ? (item.isOverdue ? 'Oui' : 'Non') : 'Non calculé'
        ];
      } else {
        return [
          format(new Date(item.date), 'dd/MM/yyyy'),
          item.tache.nom,
          getTypeLabel(item.tache.type),
          'N/A',
          'N/A',
          item.tache.responsable || 'Non assigné',
          item.type === 'overdue' ? 'Oui' : 'Non'
        ];
      }
    });

    const headers = ['Date', 'Tâche', 'Type', 'Site', 'Ville', 'Responsable', 'En retard'];
    const csvContent = [headers, ...csvData].map(row => row.join(';')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `planning_maintenance_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    
    toast.success('Export CSV généré avec succès');
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* En-têtes des jours */}
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="p-3 text-center font-medium text-gray-600 bg-gray-50">
            {day}
          </div>
        ))}
        
        {/* Jours du mois */}
        {days.map(day => {
          const dayMaintenances = getMaintenancesForDate(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={day.toISOString()}
              className={`min-h-24 p-2 border border-gray-200 ${
                !isSameMonth(day, currentDate) ? 'bg-gray-50 text-gray-400' : 'bg-white'
              } ${isToday ? 'bg-blue-50 border-blue-300' : ''}`}
            >
              <div className={`text-sm mb-1 ${isToday ? 'font-bold text-blue-600' : ''}`}>
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {dayMaintenances.slice(0, 2).map((maintenance, index) => (
                  <div
                    key={index}
                    className={`text-xs p-1 rounded border cursor-pointer hover:shadow-sm ${getEventColor(maintenance.type)}`}
                    onClick={() => onViewTask?.(maintenance.tache)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{getTypeIcon(maintenance.tache.type)}</span>
                      <span className="truncate">{maintenance.tache.nom}</span>
                    </div>
                  </div>
                ))}
                
                {dayMaintenances.length > 2 && (
                  <div className="text-xs text-gray-500 pl-1">
                    +{dayMaintenances.length - 2} autre(s)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderYearView = () => {
    const months = Array.from({ length: 12 }, (_, i) => new Date(currentDate.getFullYear(), i, 1));
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {months.map(month => {
          const monthMaintenances = maintenances.filter(m => 
            m.date.getMonth() === month.getMonth() && m.date.getFullYear() === month.getFullYear()
          );
          
          return (
            <Card key={month.toISOString()} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{format(month, 'MMMM yyyy', { locale: fr })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Total: {monthMaintenances.length}</span>
                    <span>En retard: {monthMaintenances.filter(m => m.type === 'overdue').length}</span>
                  </div>
                  
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {monthMaintenances.slice(0, 3).map((maintenance, index) => (
                      <div
                        key={index}
                        className={`text-xs p-2 rounded border cursor-pointer ${getEventColor(maintenance.type)}`}
                        onClick={() => onViewTask?.(maintenance.tache)}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <span>{getTypeIcon(maintenance.tache.type)}</span>
                          <span className="truncate font-medium">{maintenance.tache.nom}</span>
                        </div>
                        <div className="text-xs opacity-75">
                          {format(maintenance.date, 'dd/MM')}
                        </div>
                      </div>
                    ))}
                    
                    {monthMaintenances.length > 3 && (
                      <div className="text-xs text-gray-500 text-center py-1">
                        +{monthMaintenances.length - 3} autre(s)
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderListView = () => {
    const groupedData = groupOccurrences();
    const stats = {
      total: filteredOccurrences.length,
      enRetard: filteredOccurrences.filter(occ => occ.isOverdue).length,
      urgentes: filteredOccurrences.filter(occ => occ.daysFromNow !== undefined && occ.daysFromNow <= 7 && !occ.isOverdue).length,
      sitesUniques: new Set(filteredOccurrences.map(occ => occ.site.id_site)).size
    };

    return (
      <div className="space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DetailCard
            title={stats.total.toString()}
            subtitle="Total occurrences"
            badge={{ label: "Toutes instances", variant: "outline" }}
            gradient
          >
            <Calendar className="w-8 h-8 text-purple-600" />
          </DetailCard>
          
          <DetailCard
            title={stats.enRetard.toString()}
            subtitle="En retard"
            badge={{ label: "Urgent", variant: "outline", color: "red" }}
          >
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </DetailCard>
          
          <DetailCard
            title={stats.urgentes.toString()}
            subtitle="À venir (7 jours)"
            badge={{ label: "Imminent", variant: "outline", color: "orange" }}
          >
            <Clock className="w-8 h-8 text-orange-600" />
          </DetailCard>
          
          <DetailCard
            title={stats.sitesUniques.toString()}
            subtitle="Sites concernés"
            badge={{ label: "Géographie", variant: "outline", color: "blue" }}
          >
            <MapPin className="w-8 h-8 text-blue-600" />
          </DetailCard>
        </div>

        {/* Filtres */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres et affichage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Période</label>
                <Select value={periodeFilter} onValueChange={(value: PeriodeFilter) => setPeriodeFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semaine">Cette semaine</SelectItem>
                    <SelectItem value="mois">Ce mois</SelectItem>
                    <SelectItem value="trimestre">Ce trimestre</SelectItem>
                    <SelectItem value="annee">Cette année</SelectItem>
                    <SelectItem value="tout">Toutes les occurrences</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <Select value={typeFilter} onValueChange={(value: TypeTachePlanifie | 'all') => setTypeFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="VISITE">👁️ Visite</SelectItem>
                    <SelectItem value="ENTRETIEN">🔧 Entretien</SelectItem>
                    <SelectItem value="PREVENTIF">🛡️ Préventif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Site</label>
                <Select value={siteFilter} onValueChange={setSiteFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les sites</SelectItem>
                    {getSitesUniques().map(site => (
                      <SelectItem key={site} value={site}>{site}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Grouper par</label>
                <Select value={groupBy} onValueChange={(value: GroupBy) => setGroupBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mois">Mois</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="site">Site</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Recherche</label>
                <Input
                  placeholder="Tâche, site..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant={showOnlyOverdue ? "default" : "outline"}
                  onClick={() => setShowOnlyOverdue(!showOnlyOverdue)}
                  className={showOnlyOverdue ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  {showOnlyOverdue ? "Toutes" : "En retard seulement"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste groupée des occurrences */}
        <div className="space-y-6">
          {groupedData.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune occurrence trouvée</h3>
                <p className="text-gray-600">
                  Aucune occurrence ne correspond à vos critères de filtrage.
                </p>
              </CardContent>
            </Card>
          ) : (
            groupedData.map(group => (
              <Card key={group.group}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{group.group}</span>
                    <Badge variant="outline">
                      {group.occurrences.length} occurrence(s)
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {group.occurrences.map((occ, index) => {
                      const urgencyBadge = getUrgencyBadge(occ);
                      
                      return (
                        <DetailCard
                          key={`${occ.tache.id_tachePlanifie}-${occ.date}-${index}`}
                          title={occ.tache.nom}
                          subtitle={`${getTypeLabel(occ.tache.type)} • ${occ.site.nom} - ${occ.site.ville}`}
                          badge={{
                            label: urgencyBadge.label,
                            variant: "outline",
                            color: urgencyBadge.color
                          }}
                          actions={{
                            view: () => onViewTask?.(occ.tache)
                          }}
                          className={occ.isOverdue ? "border-red-200 bg-red-50" : ""}
                        >
                          <InfoGrid columns={3}>
                            <InfoItem
                              label="Date prévue"
                              value={format(new Date(occ.date), 'dd MMMM yyyy', { locale: fr })}
                              icon={<Calendar className="w-4 h-4" />}
                              highlight={occ.isOverdue}
                            />
                            <InfoItem
                              label="Responsable"
                              value={occ.tache.responsable || 'Non assigné'}
                              icon={<Clock className="w-4 h-4" />}
                            />
                            <InfoItem
                              label="Échéance"
                              value={
                                occ.daysFromNow !== undefined
                                  ? occ.isOverdue
                                    ? `${Math.abs(occ.daysFromNow)} jours de retard`
                                    : `Dans ${occ.daysFromNow} jours`
                                  : 'Calculé'
                              }
                              icon={occ.isOverdue ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              highlight={occ.daysFromNow !== undefined && occ.daysFromNow <= 7}
                            />
                          </InfoGrid>
                        </DetailCard>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Résumé */}
        <div className="text-center text-sm text-muted-foreground">
          Affichage de {filteredOccurrences.length} occurrence(s) sur {allOccurrences.length} au total
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {viewMode === 'list' ? 'Chargement des instances de tâches...' : 'Chargement du planning annuel...'}
          </p>
        </div>
      </div>
    );
  }

  const calendarStats = {
    total: maintenances.length,
    enRetard: maintenances.filter(m => m.type === 'overdue').length,
    urgentes: maintenances.filter(m => m.type === 'upcoming').length,
    sitesUniques: new Set(maintenances.flatMap(m => m.site ? [m.site.id_site] : [])).size
  };

  return (
    <div className="space-y-6">
      {/* Contrôles de navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {viewMode === 'calendar' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => calendarView === 'month' ? navigateMonth('prev') : navigateYear('prev')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <h2 className="text-xl font-semibold">
                  {calendarView === 'month' 
                    ? format(currentDate, 'MMMM yyyy', { locale: fr })
                    : currentDate.getFullYear()
                  }
                </h2>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => calendarView === 'month' ? navigateMonth('next') : navigateYear('next')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
            
            {viewMode === 'list' && (
              <h2 className="text-xl font-semibold">Toutes les instances de tâches planifiées</h2>
            )}
          </div>
          
          {viewMode === 'calendar' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Aujourd'hui
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar">Vue Calendrier</SelectItem>
              <SelectItem value="list">Vue Liste Détaillée</SelectItem>
            </SelectContent>
          </Select>

          {viewMode === 'calendar' && (
            <Select value={calendarView} onValueChange={(value: CalendarView) => setCalendarView(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mensuel</SelectItem>
                <SelectItem value="year">Annuel</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {viewMode === 'calendar' && (
        <>
          {/* Légende */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border bg-red-100 border-red-200"></div>
              <span className="text-sm">En retard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border bg-orange-100 border-orange-200"></div>
              <span className="text-sm">À venir (7 jours)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border bg-blue-100 border-blue-200"></div>
              <span className="text-sm">Planifié</span>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{calendarStats.total}</div>
                    <div className="text-sm text-gray-600">Total maintenances</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {calendarStats.enRetard}
                    </div>
                    <div className="text-sm text-gray-600">En retard</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Settings className="w-8 h-8 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {calendarStats.urgentes}
                    </div>
                    <div className="text-sm text-gray-600">À venir (7j)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {calendarStats.sitesUniques}
                    </div>
                    <div className="text-sm text-gray-600">Sites concernés</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vue calendrier */}
          <Card>
            <CardContent className="p-6">
              {calendarView === 'month' ? renderMonthView() : renderYearView()}
            </CardContent>
          </Card>
        </>
      )}

      {viewMode === 'list' && renderListView()}
    </div>
  );
};