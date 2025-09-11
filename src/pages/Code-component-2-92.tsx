import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  MapPin, 
  Calendar, 
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { dashboardService } from '../services/dashboardService';
import type { DashboardStats, KPI, TypeEquipement } from '../types';
import dashboardBg from 'figma:asset/6bbc5f93c2316a8c1d87dbb7265c4c1ed5ad5bd0.png';

const typeEquipementLabels: Record<TypeEquipement, string> = {
  MOTOPOMPE: 'Motopompe',
  BORNE_DE_DISTRIBUTION: 'Borne de distribution',
  ARMOIRE_ELECTRIQUE: 'Armoire électrique',
  CITERNE: 'Citerne'
};

const typeEquipementColors: Record<TypeEquipement, string> = {
  MOTOPOMPE: '#8B5CF6',
  BORNE_DE_DISTRIBUTION: '#3B82F6',
  ARMOIRE_ELECTRIQUE: '#10B981',
  CITERNE: '#F59E0B'
};

const prioriteColors = {
  HAUTE: '#EF4444',
  MOYENNE: '#F59E0B',
  BASSE: '#10B981'
};

const prioriteLabels = {
  HAUTE: 'Haute',
  MOYENNE: 'Moyenne',
  BASSE: 'Basse'
};

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [dashboardStats, dashboardKpis] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getKPIs()
      ]);
      setStats(dashboardStats);
      setKpis(dashboardKpis);
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getKPIIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'équipements totaux': return Settings;
      case 'sites actifs': return MapPin;
      case 'maintenances planifiées': return Calendar;
      case 'alertes stock': return Package;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'danger': return 'text-red-600 bg-red-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-gray-600">
          Impossible de charger les données du dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec image de fond */}
      <div 
        className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white overflow-hidden"
        style={{
          backgroundImage: `url(${dashboardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Tableau de Bord GMAO</h1>
          <p className="text-blue-100 text-lg">
            Vue d'ensemble de votre système de maintenance
          </p>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = getKPIIcon(kpi.label);
          const statusColor = getStatusColor(kpi.status);
          
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {kpi.label}
                </CardTitle>
                <Icon className={`h-4 w-4 ${statusColor.split(' ')[0]}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpi.value.toLocaleString()}
                  {kpi.unit && <span className="text-sm ml-1">{kpi.unit}</span>}
                </div>
                {kpi.variation !== undefined && (
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {kpi.variation > 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                    )}
                    <span className={kpi.variation > 0 ? 'text-green-500' : 'text-red-500'}>
                      {Math.abs(kpi.variation)}%
                    </span>
                    <span className="ml-1">vs mois dernier</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des équipements */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des équipements</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.equipementsParType}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ type, pourcentage }) => `${typeEquipementLabels[type]}: ${pourcentage}%`}
                >
                  {stats.equipementsParType.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={typeEquipementColors[entry.type]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Évolution des maintenances */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des maintenances</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.maintenancesParMois}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="planifiees" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Planifiées"
                />
                <Line 
                  type="monotone" 
                  dataKey="realisees" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Réalisées"
                />
                <Line 
                  type="monotone" 
                  dataKey="annulees" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Annulées"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertes et prochaines maintenances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stocks critiques */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              Stocks critiques ({stats.stocksCritiques.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.stocksCritiques.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>Aucun stock critique</p>
              </div>
            ) : (
              stats.stocksCritiques.map((stock) => (
                <div key={stock.id_stock} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{stock.piece.nom}</p>
                      <p className="text-sm text-gray-600">Réf: {stock.piece.reference}</p>
                    </div>
                    <Badge variant="destructive">
                      {stock.quantite}/{stock.seuil_critique}
                    </Badge>
                  </div>
                  <Progress 
                    value={stock.pourcentageRestant} 
                    className="h-2"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Prochaines maintenances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-500" />
              Prochaines maintenances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.prochainesmaintenances.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-8 h-8 mx-auto mb-2" />
                <p>Aucune maintenance planifiée</p>
              </div>
            ) : (
              stats.prochainesmaintenances.slice(0, 5).map((maintenance) => (
                <div key={maintenance.id_occurenceMainteance} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{maintenance.equipement.nom}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(maintenance.datePrevue).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      style={{ backgroundColor: prioriteColors[maintenance.priorite] }}
                      className="text-white mb-1"
                    >
                      {prioriteLabels[maintenance.priorite]}
                    </Badge>
                    <p className="text-xs text-gray-600">
                      {maintenance.joursRestants < 0 
                        ? `${Math.abs(maintenance.joursRestants)} jours de retard`
                        : `Dans ${maintenance.joursRestants} jours`
                      }
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistiques détaillées */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé mensuel des maintenances</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stats.maintenancesParMois}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="planifiees" fill="#8B5CF6" name="Planifiées" />
              <Bar dataKey="realisees" fill="#10B981" name="Réalisées" />
              <Bar dataKey="annulees" fill="#EF4444" name="Annulées" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};