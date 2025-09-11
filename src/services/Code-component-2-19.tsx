import { apiService } from './api';
import type { Equipement, RequetUpdateEquipement } from '../types';

export class EquipementService {
  private readonly endpoint = '/equipement';

  async create(equipement: Equipement): Promise<Equipement> {
    return apiService.post<Equipement>(`${this.endpoint}/create`, equipement);
  }

  async getAll(): Promise<Equipement[]> {
    return apiService.get<Equipement[]>(`${this.endpoint}/get`);
  }

  async update(equipementId: number, updateData: RequetUpdateEquipement): Promise<Equipement> {
    return apiService.put<Equipement>(`${this.endpoint}/update/${equipementId}`, updateData);
  }

  async delete(equipementId: number): Promise<boolean> {
    return apiService.delete<boolean>(`${this.endpoint}/delete/${equipementId}`);
  }
}

export const equipementService = new EquipementService();