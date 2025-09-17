import { apiService } from './api';
import type { Site, RequetCreateSite, RequetUpdateSite } from '../types';

export class SiteService {
  private readonly endpoint = '/site';

  async create(createData: RequetCreateSite): Promise<Site> {
    try {
      return await apiService.post<Site>(`${this.endpoint}/create`, createData);
    } catch (error) {
      console.error('Erreur lors de la création du site:', error);
      throw error;
    }
  }

  async getAll(): Promise<Site[]> {
    try {
      return await apiService.get<Site[]>(`${this.endpoint}/get`);
    } catch (error) {
      console.error('Erreur lors de la récupération des sites:', error);
      return [];
    }
  }


  async update(siteId: number, updateData: RequetUpdateSite): Promise<Site> {
    try {
      return await apiService.put<Site>(`${this.endpoint}/update/${siteId}`, updateData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du site:', error);
      throw error;
    }
  }

  async delete(siteId: number): Promise<boolean> {
    try {
      return await apiService.delete<boolean>(`${this.endpoint}/delete/${siteId}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du site:', error);
      throw error;
    }
  }

  async installEquipements(siteId: number, installations: { equipementId: number; dateInstallation: string }[]): Promise<boolean> {
    // Préparer les données selon le format attendu par le backend
    const equipementsId = installations.map(inst => inst.equipementId);
    const datesInstall = installations.map(inst => inst.dateInstallation);
    
    const request = {
      siteId,
      equipementsId,
      datesInstall
    };
    
    try {
      return await apiService.post<boolean>(`${this.endpoint}/install-equipements`, request);
    } catch (error) {
      console.error('Erreur lors de l\'installation des équipements:', error);
      throw error;
    }
  }

  async getAllSites(): Promise<Site[]> {
    return this.getAll();
  }

  
}

export const siteService = new SiteService();