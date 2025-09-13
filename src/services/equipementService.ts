import { apiService } from './api';
import type { Equipement, RequetUpdateEquipement } from '../types';

export class EquipementService {
  private readonly endpoint = '/equipement';

  async createEquipement(equipement: Equipement): Promise<Equipement> {
    try {
      return await apiService.post<Equipement>(`${this.endpoint}/create`, equipement);
    } catch (error) {
      console.error('Erreur lors de la création de l\'équipement:', error);
      /* if ((error as Error).message === 'MOCK_FALLBACK') {
        // En mode mock, simule la création
        const newEquipement = {
          ...equipement,
          id_equipement: Date.now() // ID temporaire
        };
        return newEquipement;
      } */
      throw error;
    }
  }

  async getAllEquipements(): Promise<Equipement[]> {
    try {
      return await apiService.get<Equipement[]>(`${this.endpoint}/get`);
    } catch (error) {
      console.error('Erreur lors de la récupération des équipements:', error);
      /* if ((error as Error).message === 'MOCK_FALLBACK') {
        return this.getMockEquipements();
      } */
      throw error;
    }
  }

  async getEquipementById(id: number): Promise<Equipement> {
    return apiService.get<Equipement>(`${this.endpoint}/get/${id}`);
  }

  async updateEquipement(equipementId: number, updateData: RequetUpdateEquipement): Promise<Equipement> {
    try {
      return await apiService.put<Equipement>(`${this.endpoint}/update/${equipementId}`, updateData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'équipement:', error);
      /* if ((error as Error).message === 'MOCK_FALLBACK') {
        // En mode mock, simule la mise à jour
        const mockEquipements = this.getMockEquipements();
        const equipement = mockEquipements.find(eq => eq.id_equipement === equipementId);
        if (equipement) {
          return { ...equipement, ...updateData };
        }
        throw new Error('Équipement non trouvé');
      } */
      throw error;
    }
  }

  async deleteEquipement(equipementId: number): Promise<boolean> {
    try {
      return await apiService.delete<boolean>(`${this.endpoint}/delete/${equipementId}`);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'équipement:', error);
     /*  if ((error as Error).message === 'MOCK_FALLBACK') {
        // En mode mock, simule la suppression
        return true;
      } */
      throw error;
    }
  }

  // Legacy methods for backward compatibility
  async create(equipement: Equipement): Promise<Equipement> {
    return this.createEquipement(equipement);
  }

  async getAll(): Promise<Equipement[]> {
    return this.getAllEquipements();
  }

  async update(equipementId: number, updateData: RequetUpdateEquipement): Promise<Equipement> {
    return this.updateEquipement(equipementId, updateData);
  }

  async delete(equipementId: number): Promise<boolean> {
    return this.deleteEquipement(equipementId);
  }

  /* private getMockEquipements(): Equipement[] {
    return [
      {
        id_equipement: 1,
        type: 'MOTOPOMPE',
        reference: 'MP-001',
        nom: 'Motopompe principale',
        fournisseur: 'TechFlow Industries',
        taches: [
          {
            id_tache: 1,
            nom: 'Vérification des filtres',
            type: 'VISITE',
            frequence: { frequenceStandard: 'MENSUELLE' }
          },
          {
            id_tache: 2,
            nom: 'Vidange d\'huile',
            type: 'ENTRETIEN',
            frequence: { frequenceStandard: 'SEMESTRIELLE' }
          }
        ],
        pieces: [
          { id_piece: 1, nom: 'Filtre à huile', reference: 'FLT-001' },
          { id_piece: 2, nom: 'Joint d\'étanchéité', reference: 'JNT-002' }
        ]
      },
      {
        id_equipement: 2,
        type: 'BORNE_DE_DISTRIBUTION',
        reference: 'BD-002',
        nom: 'Borne distribution Zone A',
        fournisseur: 'GasEquip Solutions',
        taches: [
          {
            id_tache: 3,
            nom: 'Contrôle sécurité',
            type: 'VISITE',
            frequence: { frequenceStandard: 'MENSUELLE' }
          }
        ],
        pieces: [
          { id_piece: 3, nom: 'Valve de sécurité', reference: 'VLV-003' }
        ]
      },
      {
        id_equipement: 3,
        type: 'ARMOIRE_ELECTRIQUE',
        reference: 'AE-003',
        nom: 'Armoire électrique principale',
        fournisseur: 'ElectroSafe',
        taches: [
          {
            id_tache: 4,
            nom: 'Vérification connexions',
            type: 'PREVENTIF',
            frequence: { frequenceStandard: 'TRIMESTRIELLE' }
          }
        ],
        pieces: [
          { id_piece: 4, nom: 'Fusible 32A', reference: 'FUS-004' },
          { id_piece: 5, nom: 'Disjoncteur', reference: 'DIS-005' }
        ]
      }
    ];
  } */
}

export const equipementService = new EquipementService();