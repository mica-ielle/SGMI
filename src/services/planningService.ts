import { apiService } from './api';
import type { 
  RequetGetPlanning, 
  TachePlanifie, 
  RequetCreateTachePlanifie, 
  FicheIntervention, 
  RequetCreateFiche, 
  Planifier
} from '../types';

export class PlanningService {
   private readonly endpoint = '/planning';

  async getPlanning(): Promise<RequetGetPlanning[]> {
    try {
      return await apiService.get<RequetGetPlanning[]>(`${this.endpoint}/planning`);
    } catch (error) {
      console.error('Erreur lors de la récupération du planning:', error);
      throw error;
    }
  }

  async getAllTachesPlanifiees(): Promise<TachePlanifie[]> {
    try {
      return await apiService.get<TachePlanifie[]>(`${this.endpoint}/taches`);
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
      throw error;
    }
  }

  async getTachePlanifieById(id: number): Promise<TachePlanifie> {
    return apiService.get<TachePlanifie>(`${this.endpoint}/taches/${id}`);
  }

  async updateTachePlanifie(id: number, request: RequetCreateTachePlanifie): Promise<TachePlanifie> {
    // Note: L'endpoint backend attend juste TachePlanifie pour la mise à jour
    return apiService.put<TachePlanifie>(`${this.endpoint}/taches/${id}`, request.tachePlanifie);
  }

  async createTachePlanifie(createData: RequetCreateTachePlanifie): Promise<TachePlanifie[]> {
    console.log('Données envoyées au backend:', createData);
    return apiService.post<TachePlanifie[]>(`${this.endpoint}/tachePlanifie`, createData);
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


  
    async marquerMaintenanceAffectee(arg0: number):Promise<boolean>{
    return apiService.delete<boolean>(`${this.endpoint}/deleteOccurence/${arg0}`);
    }


  async getAllFichesIntervention(): Promise<FicheIntervention[]> {
    try {
      return await apiService.get<FicheIntervention[]>(`${this.endpoint}/fiches`);
    } catch (error) {
      console.error('Erreur lors de la récupération des fiches:', error);
      throw error;
    }
  }

  async getPlanifiersByTacheId(tacheId: number): Promise<Planifier[]> {
    try {
      return await apiService.get<Planifier[]>(`${this.endpoint}/taches/${tacheId}/planifiers`);
    } catch (error) {
      console.error('Erreur lors de la récupération des planifiers:', error);
      return [];
    }
  }


  async telechargement(ficheId : number): Promise<void> {
    try {
      const pdfUrl = `http://localhost:8491/download-pdf/${ficheId}`;
      
      // Ouvrir dans un nouvel onglet
      window.open(pdfUrl, '_blank');
      
    } catch (error) {
      console.error(`[CAMGAZ-TECH] Erreur lors de l'ouverture du PDF:`, error);
      throw new Error('Impossible d\'ouvrir le PDF. Vérifiez que l\'API est accessible.');
    }
  }

  async downloadFicheInterventionPDF(ficheId: number): Promise<void> {
    try {
      // Effectuer l'appel API pour télécharger le PDF
      const response = await fetch(`http://localhost:8421/api${this.endpoint}/fiches/${ficheId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      // Créer un blob à partir de la réponse
      const blob = await response.blob();
      
      // Créer un URL temporaire pour le blob
      const url = window.URL.createObjectURL(blob);
      
      // Créer un élément <a> temporaire pour déclencher le téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.download = `fiche_intervention_${ficheId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      window.print();

      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      throw error;
    }
  }

  async downloadDefaillancePDF(ficheId: number): Promise<void> {
    try {
      // Effectuer l'appel API pour télécharger le PDF de défaillance
      const response = await fetch(`http://localhost:8421/api${this.endpoint}/fiches/${ficheId}/defaillance/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      // Créer un blob à partir de la réponse
      const blob = await response.blob();
      
      // Créer un URL temporaire pour le blob
      const url = window.URL.createObjectURL(blob);
      
      // Créer un élément <a> temporaire pour déclencher le téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.download = `defaillance_${ficheId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      window.print();

      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF de défaillance:', error);
      throw error;
    }
  }
}





export const planningService = new PlanningService();