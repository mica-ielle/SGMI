import { apiService } from './api';
import { equipementService } from './equipementService';
import { siteService } from './siteService';
import { planningService } from './planningService';
import { stockService } from './stockService';
import type { 
  DashboardStats, 
  EquipementTypeStats, 
  MaintenanceStats, 
  StockCritique,
  ProchaineMaintenanceInfo,
  KPI,
  TypeEquipement
} from '../types';

export class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Récupération des données depuis les services existants
      const [equipements, sites, planning, stocks] = await Promise.all([
        equipementService.getAll(),
        siteService.getAll(),
        planningService.getPlanning(),
        stockService.getAll()
      ]);

      // Calcul des statistiques d'équipements par type
      const equipementsParType: EquipementTypeStats[] = this.calculateEquipementStats(equipements);

      // Calcul des maintenances par statut
      const maintenancesPlanifiees = planning.filter(p => p.occurenceMainteance.statut === 'PLANIFIEE').length;
      const maintenancesEnRetard = this.calculateRetardMaintenances(planning);

      // Calcul des alertes stock
      const alertesStock = stocks.filter(s => s.quantite <= s.seuil_critique).length;
      const stocksCritiques = this.getStocksCritiques(stocks);

      // Calcul des prochaines maintenances
      const prochainesmaintenances = this.getProchainesmaintenances(planning);

      // Génération de données fictives pour les maintenances par mois (à remplacer par de vraies données)
      const maintenancesParMois = this.generateMaintenanceStats();

      return {
        totalEquipements: equipements.length,
        totalSites: sites.length,
        maintenancesPlanifiees,
        maintenancesEnRetard,
        alertesStock,
        equipementsParType,
        maintenancesParMois,
        stocksCritiques,
        prochainesmaintenances
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  async getKPIs(): Promise<KPI[]> {
    try {
      const stats = await this.getDashboardStats();
      
      return [
        {
          label: 'Équipements totaux',
          value: stats.totalEquipements,
          status: 'info',
          variation: 5 // Exemple de variation
        },
        {
          label: 'Sites actifs',
          value: stats.totalSites,
          status: 'info',
          variation: 2
        },
        {
          label: 'Maintenances planifiées',
          value: stats.maintenancesPlanifiees,
          status: stats.maintenancesEnRetard > 0 ? 'warning' : 'success',
          variation: -3
        },
        {
          label: 'Alertes stock',
          value: stats.alertesStock,
          status: stats.alertesStock > 0 ? 'danger' : 'success',
          variation: stats.alertesStock > 0 ? 15 : 0
        }
      ];
    } catch (error) {
      console.error('Erreur lors de la récupération des KPIs:', error);
      throw error;
    }
  }

  private calculateEquipementStats(equipements: any[]): EquipementTypeStats[] {
    const typeCount: Record<TypeEquipement, number> = {
      MOTOPOMPE: 0,
      BORNE_DE_DISTRIBUTION: 0,
      ARMOIRE_ELECTRIQUE: 0,
      CITERNE: 0
    };

    equipements.forEach(eq => {
      if (eq.type && typeCount.hasOwnProperty(eq.type)) {
        typeCount[eq.type]++;
      }
    });

    const total = equipements.length;
    
    return Object.entries(typeCount).map(([type, count]) => ({
      type: type as TypeEquipement,
      count,
      pourcentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  }

  private calculateRetardMaintenances(planning: any[]): number {
    const today = new Date();
    return planning.filter(p => {
      const datePrevue = new Date(p.occurenceMainteance.datePrevue);
      return datePrevue < today && p.occurenceMainteance.statut === 'PLANIFIEE';
    }).length;
  }

  private getStocksCritiques(stocks: any[]): StockCritique[] {
    return stocks
      .filter(s => s.quantite <= s.seuil_critique)
      .map(s => ({
        id_stock: s.id_stock,
        piece: s.piece,
        quantite: s.quantite,
        seuil_critique: s.seuil_critique,
        pourcentageRestant: s.seuil_critique > 0 ? Math.round((s.quantite / s.seuil_critique) * 100) : 0
      }))
      .sort((a, b) => a.pourcentageRestant - b.pourcentageRestant)
      .slice(0, 5); // Top 5 des stocks les plus critiques
  }

  private getProchainesmaintenances(planning: any[]): ProchaineMaintenanceInfo[] {
    const today = new Date();
    
    return planning
      .filter(p => p.occurenceMainteance.statut === 'PLANIFIEE')
      .map(p => {
        const datePrevue = new Date(p.occurenceMainteance.datePrevue);
        const joursRestants = Math.ceil((datePrevue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        let priorite: 'HAUTE' | 'MOYENNE' | 'BASSE' = 'BASSE';
        if (joursRestants < 0) priorite = 'HAUTE';
        else if (joursRestants <= 7) priorite = 'HAUTE';
        else if (joursRestants <= 30) priorite = 'MOYENNE';

        return {
          id_occurenceMainteance: p.occurenceMainteance.id_occurenceMainteance,
          equipement: p.equipement,
          datePrevue: p.occurenceMainteance.datePrevue,
          joursRestants,
          priorite
        };
      })
      .sort((a, b) => a.joursRestants - b.joursRestants)
      .slice(0, 10); // Top 10 des prochaines maintenances
  }

  private generateMaintenanceStats(): MaintenanceStats[] {
    // Génération de données fictives pour les 6 derniers mois
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
    return mois.map(m => ({
      mois: m,
      planifiees: Math.floor(Math.random() * 20) + 5,
      realisees: Math.floor(Math.random() * 18) + 3,
      annulees: Math.floor(Math.random() * 3)
    }));
  }
}

export const dashboardService = new DashboardService();