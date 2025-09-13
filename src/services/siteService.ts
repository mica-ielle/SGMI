import { apiService } from './api';
import type { Site, RequetCreateSite, RequetUpdateSite } from '../types';

export class SiteService {
  private readonly endpoint = '/site';

  async create(createData: RequetCreateSite): Promise<Site> {
    try {
      return await apiService.post<Site>(`${this.endpoint}/create`, createData);
    } catch (error) {
      console.error('Erreur lors de la création du site:', error);
     /*  if ((error as Error).message === 'MOCK_FALLBACK') {
        // En mode mock, simule la création
        const newSite = {
          ...createData,
          id_site: Date.now(), // ID temporaire
          equipementsInstalles: []
        };
        return newSite;
      } */
      throw error;
    }
  }

  async getAll(): Promise<Site[]> {
    try {
      return await apiService.get<Site[]>(`${this.endpoint}/get`);
    } catch (error) {
      console.error('Erreur lors de la récupération des sites:', error);
      /* if ((error as Error).message === 'MOCK_FALLBACK') {
        return this.getMockSites();
      } */
      return [];
    }
  }

  async update(siteId: number, updateData: RequetUpdateSite): Promise<Site> {
    try {
      return await apiService.put<Site>(`${this.endpoint}/update/${siteId}`, updateData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du site:', error);
     /*  if ((error as Error).message === 'MOCK_FALLBACK') {
        const mockSites = this.getMockSites();
        const site = mockSites.find(s => s.id_site === siteId);
        if (site) {
          return { ...site, ...updateData };
        }
        throw new Error('Site non trouvé');
      } */
      throw error;
    }
  }

  async delete(siteId: number): Promise<boolean> {
    try {
      return await apiService.delete<boolean>(`${this.endpoint}/delete/${siteId}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du site:', error);
      /* if ((error as Error).message === 'MOCK_FALLBACK') {
        return true;
      } */
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
  /*     if ((error as Error).message === 'MOCK_FALLBACK') {
        return true;
      } */
      throw error;
    }
  }

  async getAllSites(): Promise<Site[]> {
    return this.getAll();
  }

 /*  private getMockSites(): Site[] {
    return [
      {
        id_site: 1,
        nom: 'Station Centrale',
        adresse: '123 Avenue Principale',
        ville: 'Paris',
        codePostal: '75001',
        equipementsInstalles: [
          {
            id_equipementInstalle: 1,
            equipement: {
              id_equipement: 1,
              type: 'MOTOPOMPE',
              reference: 'MP-001',
              nom: 'Motopompe principale',
              fournisseur: 'TechFlow Industries'
            },
            dateInstallation: '2024-01-15',
            statut: 'ACTIF'
          }
        ]
      },
      {
        id_site: 2,
        nom: 'Dépôt Nord',
        adresse: '456 Rue Industrial',
        ville: 'Lille',
        codePostal: '59000',
        equipementsInstalles: [
          {
            id_equipementInstalle: 2,
            equipement: {
              id_equipement: 2,
              type: 'BORNE_DE_DISTRIBUTION',
              reference: 'BD-002',
              nom: 'Borne distribution Zone A',
              fournisseur: 'GasEquip Solutions'
            },
            dateInstallation: '2024-02-01',
            statut: 'ACTIF'
          }
        ]
      },
      {
        id_site: 3,
        nom: 'Terminal Sud',
        adresse: '789 Boulevard Maritime',
        ville: 'Marseille',
        codePostal: '13000',
        equipementsInstalles: []
      }
    ];
  } */
}

export const siteService = new SiteService();