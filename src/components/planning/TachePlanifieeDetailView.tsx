import { DetailView } from '../DetailView';
import { InfoGrid, InfoItem } from '../ui/info-grid';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { 
  Clock, 
  MapPin, 
  User, 
  Calendar, 
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Settings,
  CalendarIcon
} from 'lucide-react';
import { format, addDays, addWeeks, addMonths, addYears, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { planningService } from '../../services/planningService';
import type { TachePlanifie, StatutTache, TypeTachePlanifie, Frequence, Planifier } from '../../types';

interface TachePlanifieeDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tache: TachePlanifie | null;
  onEdit?: () => void;
  onMarkCompleted?: () => void;
  onCancel?: () => void;
  onReschedule?: () => void;
}

export const TachePlanifieeDetailView = ({ 
  open, 
  onOpenChange, 
  tache, 
  onEdit,
  onMarkCompleted,
  onCancel,
  onReschedule
}: TachePlanifieeDetailViewProps) => {
  // ✅ DÉPLACER LA VÉRIFICATION AVANT TOUS LES HOOKS
  if (!tache) return null;

  const [planifiers, setPlanifiers] = useState<Planifier[]>([]);
  const [loadingPlanifiers, setLoadingPlanifiers] = useState(false);

  // Charger les planifiers quand la tâche change
  useEffect(() => {
    const loadPlanifiers = async () => {
      if (tache.id_tachePlanifie && open) {
        setLoadingPlanifiers(true);
        try {
          console.log('🔍 Chargement des planifiers pour tâche:', tache.id_tachePlanifie);
          const planifiersData = await planningService.getPlanifiersByTacheId(tache.id_tachePlanifie);
          console.log('📅 Données planifiers reçues:', planifiersData);
          
          // Log détaillé des dates reçues
          planifiersData.forEach((planifier, index) => {
            console.log(`📊 Planifier ${index}:`, {
              id: planifier.id_Planifier,
              site: planifier.site?.nom,
              datePlanifie: planifier.datePlanifie,
              typeDatePlanifie: typeof planifier.datePlanifie,
              datePlanifieString: String(planifier.datePlanifie)
            });
          });
          
          setPlanifiers(planifiersData);
        } catch (error) {
          console.error('❌ Erreur lors du chargement des planifiers:', error);
          // Fallback sur les données existantes si disponibles
          setPlanifiers(tache.planifiers || []);
        } finally {
          setLoadingPlanifiers(false);
        }
      }
    };

    loadPlanifiers();
  }, [tache.id_tachePlanifie, open, tache.planifiers]);

  // ✅ FONCTION UTILITAIRE POUR SÉCURISER parseISO - VERSION AMÉLIORÉE
  const safeParseDate = (dateInput: any): Date | null => {
    try {
      console.log('🔍 Parsing date:', { input: dateInput, type: typeof dateInput });
      
      // Vérifier si la date existe
      if (!dateInput) {
        console.warn('⚠️ Date vide ou undefined:', dateInput);
        return null;
      }
      
      // Si c'est déjà un objet Date valide, le retourner
      if (dateInput instanceof Date) {
        const isValidDate = isValid(dateInput);
        console.log('📅 Date object:', { date: dateInput, isValid: isValidDate });
        return isValidDate ? dateInput : null;
      }
      
      // Si c'est un objet avec des propriétés de date (depuis Java LocalDate)
      if (typeof dateInput === 'object' && dateInput !== null) {
        // Cas où Java sérialise LocalDate comme {year: 2024, month: 1, day: 15}
        if (dateInput.year && dateInput.month && dateInput.day) {
          console.log('📅 Objet LocalDate Java:', dateInput);
          // Java month est 1-based, JavaScript month est 0-based
          const jsDate = new Date(dateInput.year, dateInput.month - 1, dateInput.day);
          return isValid(jsDate) ? jsDate : null;
        }
        
        // Cas où c'est un objet sérialisé différemment
        console.warn('⚠️ Objet date non reconnu:', dateInput);
        return null;
      }
      
      // Si ce n'est pas une string, essayer de la convertir
      if (typeof dateInput !== 'string') {
        console.warn('⚠️ Date n\'est pas une string:', typeof dateInput, dateInput);
        const stringified = String(dateInput);
        if (!stringified || stringified === 'null' || stringified === 'undefined') {
          return null;
        }
        dateInput = stringified;
      }

      // Nettoyer la string si nécessaire
      let cleanDateString = dateInput.trim();
      
      // Cas où la date vient avec l'heure (LocalDateTime)
      if (cleanDateString.includes('T')) {
        cleanDateString = cleanDateString.split('T')[0];
        console.log('🔧 Date nettoyée (suppression heure):', cleanDateString);
      }
      
      // Vérifier le format ISO de base (YYYY-MM-DD)
      const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!isoPattern.test(cleanDateString)) {
        console.warn('⚠️ Format de date non-ISO:', cleanDateString);
        
        // Essayer de parser des formats alternatifs
        // Format DD/MM/YYYY
        const frenchPattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const frenchMatch = cleanDateString.match(frenchPattern);
        if (frenchMatch) {
          const [, day, month, year] = frenchMatch;
          cleanDateString = `${year}-${month}-${day}`;
          console.log('🔧 Conversion format français:', cleanDateString);
        } else {
          return null;
        }
      }

      // Parser avec parseISO
      const parsedDate = parseISO(cleanDateString);
      const isValidParsed = isValid(parsedDate);
      
      console.log('✅ Résultat parsing:', {
        original: dateInput,
        cleaned: cleanDateString,
        parsed: parsedDate,
        isValid: isValidParsed
      });
      
      return isValidParsed ? parsedDate : null;
    } catch (error) {
      console.error('❌ Erreur lors du parsing de la date:', error, 'Date reçue:', dateInput);
      return null;
    }
  };

  // ✅ FONCTION UTILITAIRE POUR FORMATER LES DATES EN SÉCURITÉ
  const safeFormatDate = (dateInput: any, formatStr: string = 'dd MMMM yyyy'): string => {
    const parsedDate = safeParseDate(dateInput);
    if (!parsedDate) {
      console.warn('⚠️ Impossible de formater la date:', dateInput);
      return 'Date non définie';
    }
    
    try {
      const formatted = format(parsedDate, formatStr, { locale: fr });
      console.log('✅ Date formatée:', { input: dateInput, output: formatted });
      return formatted;
    } catch (error) {
      console.error('❌ Erreur lors du formatage de la date:', error);
      return 'Format de date invalide';
    }
  };

  // Fonction pour calculer la prochaine date de maintenance
  const calculerProchaineMaintenance = (dateDerniereIntervention: any, frequence: Frequence): string => {
    console.log('🔄 Calcul prochaine maintenance:', { dateDerniereIntervention, frequence });
    
    if (!dateDerniereIntervention || !frequence) {
      console.warn('⚠️ Données manquantes pour calculer prochaine maintenance:', { dateDerniereIntervention, frequence });
      return '';
    }
    
    try {
      const dateBase = safeParseDate(dateDerniereIntervention);
      if (!dateBase) {
        console.warn('⚠️ Impossible de parser la date de dernière intervention:', dateDerniereIntervention);
        return '';
      }
      
      let nextDate: Date | null = null;
      
      if (frequence.frequenceStandard) {
        switch (frequence.frequenceStandard) {
          case 'QUOTIDIENNE':
            nextDate = addDays(dateBase, 1);
            break;
          case 'HEBDOMADAIRE':
            nextDate = addWeeks(dateBase, 1);
            break;
          case 'MENSUELLE':
            nextDate = addMonths(dateBase, 1);
            break;
          case 'BIMENSUELLE':
            nextDate = addMonths(dateBase, 2);
            break;
          case 'TRIMESTRIELLE':
            nextDate = addMonths(dateBase, 3);
            break;
          case 'SEMESTRIELLE':
            nextDate = addMonths(dateBase, 6);
            break;
          case 'ANNUELLE':
            nextDate = addYears(dateBase, 1);
            break;
          case 'CINQ_ANS':
            nextDate = addYears(dateBase, 5);
            break;
          case 'DIX_ANS':
            nextDate = addYears(dateBase, 10);
            break;
          default:
            console.warn('⚠️ Fréquence standard non reconnue:', frequence.frequenceStandard);
            return '';
        }
      } else if (frequence.valeurPersonnalisee && frequence.unitePersonnalisee) {
        const valeur = frequence.valeurPersonnalisee;
        switch (frequence.unitePersonnalisee) {
          case 'JOURS':
            nextDate = addDays(dateBase, valeur);
            break;
          case 'SEMAINES':
            nextDate = addWeeks(dateBase, valeur);
            break;
          case 'MOIS':
            nextDate = addMonths(dateBase, valeur);
            break;
          case 'ANNEES':
            nextDate = addYears(dateBase, valeur);
            break;
          default:
            console.warn('⚠️ Unité personnalisée non reconnue:', frequence.unitePersonnalisee);
            return '';
        }
      } else if (frequence.heuresTotales) {
        // Pour les heures, on estime une moyenne de 8h par jour
        const jours = Math.ceil(frequence.heuresTotales / 8);
        nextDate = addDays(dateBase, jours);
      }
      
      if (!nextDate) {
        return '';
      }

      const result = format(nextDate, 'yyyy-MM-dd');
      console.log('✅ Prochaine maintenance calculée:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur lors du calcul de la prochaine maintenance:', error);
      return '';
    }
  };

  const getStatutIcon = (statut: StatutTache) => {
    switch (statut) {
      case 'PLANIFIEE': return <Clock className="w-4 h-4" />;
      case 'REALISEE': return <CheckCircle className="w-4 h-4" />;
      case 'ANNULEE': return <XCircle className="w-4 h-4" />;
      case 'REPORTEE': return <RotateCcw className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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

  const getTypeColor = (type: TypeTachePlanifie) => {
    switch (type) {
      case 'VISITE': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ENTRETIEN': return 'bg-green-100 text-green-700 border-green-200';
      case 'PREVENTIF': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatutLabel = (statut: StatutTache) => {
    switch (statut) {
      case 'PLANIFIEE': return 'Planifiée';
      case 'REALISEE': return 'Réalisée';
      case 'ANNULEE': return 'Annulée';
      case 'REPORTEE': return 'Reportée';
      default: return statut;
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

  const isOverdue = () => {
    if (tache.statut !== 'PLANIFIEE') return false;
    if (!tache.datePrevu) return false;
    
    const parsedDate = safeParseDate(tache.datePrevu);
    if (!parsedDate) return false;
    
    const today = new Date();
    return parsedDate < today;
  };

  const getDaysUntilDue = () => {
    if (!tache.datePrevu) return 0;
    
    const parsedDate = safeParseDate(tache.datePrevu);
    if (!parsedDate) return 0;
    
    const today = new Date();
    const diffTime = parsedDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Déterminer le sous-titre en fonction des sites affectés
  const getSubtitle = () => {
    if (planifiers.length > 0) {
      if (planifiers.length === 1) {
        const site = planifiers[0].site;
        return `${getTypeLabel(tache.type)} • ${site?.nom || 'Site inconnu'} - ${site?.ville || 'Ville inconnue'}`;
      } else {
        return `${getTypeLabel(tache.type)} • ${planifiers.length} sites concernés`;
      }
    }
    // Compatibilité avec l'ancienne structure
    return `${getTypeLabel(tache.type)} • ${tache.site ? `${tache.site.nom} - ${tache.site.ville}` : 'Site non défini'}`;
  };

  return (
    <DetailView
      open={open}
      onOpenChange={onOpenChange}
      title={tache.nom}
      subtitle={getSubtitle()}
      status={{
        label: getStatutLabel(tache.statut),
        variant: 'outline',
        color: getStatutColor(tache.statut)
      }}
      actions={{
        edit: onEdit,
        print: () => window.print()
      }}
    >
      <div className="space-y-6">
        {/* Debug des données (à retirer en production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-3 bg-gray-100 rounded-lg text-xs">
            <details>
              <summary className="cursor-pointer font-medium">🔍 Debug des données</summary>
              <pre className="mt-2 overflow-auto">
                {JSON.stringify({
                  tache: {
                    id: tache.id_tachePlanifie,
                    datePrevu: tache.datePrevu,
                    dernierIntervention: tache.dernierIntervention
                  },
                  planifiers: planifiers.map(p => ({
                    id: p.id_Planifier,
                    datePlanifie: p.datePlanifie,
                    site: p.site?.nom
                  }))
                }, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Alertes */}
        {isOverdue() && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-800">Tâche en retard</h4>
                <p className="text-sm text-red-600">
                  Cette tâche devait être réalisée il y a {Math.abs(getDaysUntilDue())} jour(s).
                </p>
              </div>
            </div>
          </div>
        )}

        {tache.statut === 'PLANIFIEE' && getDaysUntilDue() <= 3 && getDaysUntilDue() > 0 && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <h4 className="font-medium text-orange-800">Tâche à venir</h4>
                <p className="text-sm text-orange-600">
                  Cette tâche doit être réalisée dans {getDaysUntilDue()} jour(s).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Informations générales */}
        <div>
          <h3 className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5" />
            Informations générales
          </h3>
          <InfoGrid columns={3}>
            <InfoItem
              label="Type de tâche"
              value={
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTypeIcon(tache.type)}</span>
                  <Badge className={getTypeColor(tache.type)}>
                    {getTypeLabel(tache.type)}
                  </Badge>
                </div>
              }
              icon={<FileText className="w-4 h-4" />}
              highlight
            />
            <InfoItem
              label="Statut"
              value={
                <div className="flex items-center gap-2">
                  {getStatutIcon(tache.statut)}
                  {getStatutLabel(tache.statut)}
                </div>
              }
              icon={getStatutIcon(tache.statut)}
            />
            <InfoItem
              label="Date prévue"
              value={safeFormatDate(tache.datePrevu)}
              icon={<Calendar className="w-4 h-4" />}
            />
          </InfoGrid>
        </div>

        <Separator />

        {/* Sites concernés et planning */}
        <div>
          <h3 className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5" />
            Sites concernés et planning
          </h3>
          
          {planifiers.length > 0 ? (
            <div className="space-y-4">
              {loadingPlanifiers ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Chargement des sites...</p>
                </div>
              ) : (
                planifiers.map((planifier, siteIndex) => {
                  // ✅ VÉRIFICATION SÉCURISÉE AVANT LE CALCUL
                  const prochaineDate = planifier.datePlanifie 
                    ? calculerProchaineMaintenance(planifier.datePlanifie, tache.frequence || {})
                    : '';
                  
                  return (
                    <div key={planifier.id_Planifier || siteIndex} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            {planifier.site?.nom || 'Site non défini'}
                          </h4>
                          <p className="text-sm text-gray-600">{planifier.site?.ville || 'Ville non définie'}</p>
                          {planifier.site?.nom_contact && (
                            <p className="text-xs text-gray-500">
                              Contact: {planifier.site.nom_contact}
                              {planifier.site.tel_contact && ` - ${planifier.site.tel_contact}`}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-white rounded-md border">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Date de planification</span>
                          </div>
                          <p className="text-sm">
                            {safeFormatDate(planifier.datePlanifie)}
                          </p>
                          {/* Debug info */}
                          {process.env.NODE_ENV === 'development' && (
                            <p className="text-xs text-gray-400 mt-1">
                              Raw: {String(planifier.datePlanifie)}
                            </p>
                          )}
                        </div>
                        
                        {prochaineDate && (
                          <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                            <div className="flex items-center gap-2 mb-1">
                              <CalendarIcon className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">Prochaine maintenance</span>
                            </div>
                            <p className="text-sm font-medium text-blue-700">
                              {safeFormatDate(prochaineDate)}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {!prochaineDate && tache.frequence && Object.keys(tache.frequence).length > 0 && (
                        <div className="mt-3 p-3 bg-orange-50 rounded-md border border-orange-200">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                            <span className="text-sm text-orange-700">
                              Impossible de calculer la prochaine maintenance
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : loadingPlanifiers ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Chargement des sites...</p>
            </div>
          ) : tache.site ? (
            /* Compatibilité avec l'ancienne structure */
            <InfoGrid columns={2}>
              <InfoItem
                label="Site"
                value={tache.site.nom}
                icon={<MapPin className="w-4 h-4" />}
                highlight
              />
              <InfoItem
                label="Ville"
                value={tache.site.ville}
                icon={<MapPin className="w-4 h-4" />}
              />
              {tache.site.nom_contact && (
                <InfoItem
                  label="Contact sur site"
                  value={tache.site.nom_contact}
                  icon={<User className="w-4 h-4" />}
                />
              )}
              {tache.site.tel_contact && (
                <InfoItem
                  label="Téléphone"
                  value={tache.site.tel_contact}
                  icon={<User className="w-4 h-4" />}
                />
              )}
            </InfoGrid>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Aucun site associé à cette tâche</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Informations responsable et fréquence */}
        <div>
          <h3 className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5" />
            Responsabilité et fréquence
          </h3>
          <InfoGrid columns={2}>
            <InfoItem
              label="Responsable assigné"
              value={tache.responsable || 'Non assigné'}
              icon={<User className="w-4 h-4" />}
            />
            {tache.frequence && (
              <InfoItem
                label="Fréquence définie"
                value={
                  tache.frequence.frequenceStandard || 
                  (tache.frequence.valeurPersonnalisee && tache.frequence.unitePersonnalisee 
                    ? `${tache.frequence.valeurPersonnalisee} ${tache.frequence.unitePersonnalisee.toLowerCase()}`
                    : tache.frequence.heuresTotales 
                      ? `${tache.frequence.heuresTotales} heures`
                      : 'Fréquence personnalisée'
                  )
                }
                icon={<Clock className="w-4 h-4" />}
              />
            )}
          </InfoGrid>
        </div>

        <Separator />

        {/* Actions rapides */}
        <div>
          <h3 className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5" />
            Actions rapides
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tache.statut === 'PLANIFIEE' && onMarkCompleted && (
              <Button 
                variant="outline" 
                className="h-auto py-3 border-green-200 hover:bg-green-50"
                onClick={onMarkCompleted}
              >
                <div className="text-center">
                  <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-600" />
                  <div className="text-sm">Marquer terminée</div>
                </div>
              </Button>
            )}
            
            {tache.statut === 'PLANIFIEE' && onReschedule && (
              <Button 
                variant="outline" 
                className="h-auto py-3 border-orange-200 hover:bg-orange-50"
                onClick={onReschedule}
              >
                <div className="text-center">
                  <RotateCcw className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                  <div className="text-sm">Reporter</div>
                </div>
              </Button>
            )}
            
            {tache.statut === 'PLANIFIEE' && onCancel && (
              <Button 
                variant="outline" 
                className="h-auto py-3 border-red-200 hover:bg-red-50"
                onClick={onCancel}
              >
                <div className="text-center">
                  <XCircle className="w-5 h-5 mx-auto mb-1 text-red-600" />
                  <div className="text-sm">Annuler</div>
                </div>
              </Button>
            )}
            
            {/* <Button variant="outline" className="h-auto py-3">
              <div className="text-center">
                <FileText className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm">Créer rapport</div>
              </div>
            </Button> */}
          </div>
        </div>

        {/* Équipements concernés */}
        {((planifiers && planifiers.some(sa => sa.site?.equipementInstalles && sa.site.equipementInstalles.length > 0)) ||
          (tache.site?.equipementInstalles && tache.site.equipementInstalles.length > 0)) && (
          <>
            <Separator />
            <div>
              <h3 className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5" />
                Équipements concernés
              </h3>
              
              {planifiers.length > 0 ? (
                <div className="space-y-4">
                  {planifiers.map((planifier, siteIndex) => {
                    if (!planifier.site?.equipementInstalles || planifier.site.equipementInstalles.length === 0) {
                      return null;
                    }
                    
                    return (
                      <div key={planifier.id_Planifier || siteIndex}>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          {planifier.site.nom} ({planifier.site.equipementInstalles.length} équipement(s))
                        </h4>
                        <div className="grid gap-3 p-4 border rounded-lg bg-gray-50">
                          {planifier.site.equipementInstalles.map((equipementInstalle, equipIndex) => (
                            <div key={equipIndex} className="p-3 rounded-lg border border-gray-200 bg-white">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{equipementInstalle.equipement?.nom || 'Équipement non défini'}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {equipementInstalle.equipement?.type?.replace('_', ' ') || 'Type non défini'} • Réf: {equipementInstalle.equipement?.reference || 'N/A'}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Installé le {safeFormatDate(equipementInstalle.date_installation, 'dd/MM/yyyy')}
                                  </div>
                                </div>
                                <Badge variant="outline">
                                  {equipementInstalle.equipement?.type?.replace('_', ' ') || 'Type non défini'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Compatibilité avec l'ancienne structure */
                <div className="max-h-60 overflow-y-auto border rounded-lg bg-gray-50">
                  <div className="grid gap-3 p-4">
                    {tache.site?.equipementInstalles?.map((equipementInstalle, index) => (
                      <div key={index} className="p-3 rounded-lg border border-gray-200 bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{equipementInstalle.equipement?.nom || 'Équipement non défini'}</div>
                            <div className="text-sm text-muted-foreground">
                              {equipementInstalle.equipement?.type?.replace('_', ' ') || 'Type non défini'} • Réf: {equipementInstalle.equipement?.reference || 'N/A'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Installé le {safeFormatDate(equipementInstalle.date_installation, 'dd/MM/yyyy')}
                            </div>
                          </div>
                          <Badge variant="outline">
                            {equipementInstalle.equipement?.type?.replace('_', ' ') || 'Type non défini'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DetailView>
  );
};