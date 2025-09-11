import { apiService } from './api';
import type { 
  RequetGetPlanning, 
  TachePlanifie, 
  RequetCreateTachePlanifie, 
  FicheIntervention, 
  RequetCreateFiche 
} from '../types';

export class PlanningService {
  private readonly endpoint = '/planning';

  async getPlanning(): Promise<RequetGetPlanning[]> {
    try {
      return await apiService.get<RequetGetPlanning[]>(`${this.endpoint}/planning`);
    } catch (error) {
      console.error('Erreur lors de la récupération du planning:', error);
      return [];
    }
  }

  async createTachePlanifie(createData: RequetCreateTachePlanifie): Promise<TachePlanifie> {
    return apiService.post<TachePlanifie>(`${this.endpoint}/tachePlanifie`, createData);
  }

  async affecterTache(tachePlanifieId: number, nom: string): Promise<TachePlanifie> {
    return apiService.put<TachePlanifie>(`${this.endpoint}/affecte/${tachePlanifieId}`, nom);
  }

  async reporterTache(tachePlanifieId: number, dateReporte: string): Promise<TachePlanifie> {
    return apiService.put<TachePlanifie>(`${this.endpoint}/reporte/${tachePlanifieId}`, dateReporte);
  }

  async annulerTache(tachePlanifieId: number): Promise<TachePlanifie> {
    return apiService.put<TachePlanifie>(`${this.endpoint}/annule/${tachePlanifieId}`);
  }

  async validerTache(tachePlanifieId: number): Promise<TachePlanifie> {
    return apiService.put<TachePlanifie>(`${this.endpoint}/valide/${tachePlanifieId}`);
  }

  async createFicheIntervention(createData: RequetCreateFiche): Promise<FicheIntervention> {
    return apiService.post<FicheIntervention>(`${this.endpoint}/ficheIntervention`, createData);
  }

  async deleteTachePlanifie(tachePlanifieId: number): Promise<boolean> {
    return apiService.delete<boolean>(`${this.endpoint}/delete/${tachePlanifieId}`);
  }
}

export const planningService = new PlanningService();