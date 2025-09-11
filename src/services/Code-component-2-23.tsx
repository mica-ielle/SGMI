import { apiService } from './api';
import type { Site, RequetCreateSite, RequetUpdateSite } from '../types';

export class SiteService {
  private readonly endpoint = '/site';

  async create(createData: RequetCreateSite): Promise<Site> {
    return apiService.post<Site>(`${this.endpoint}/create`, createData);
  }

  async getAll(): Promise<Site[]> {
    return apiService.get<Site[]>(`${this.endpoint}/get`);
  }

  async update(siteId: number, updateData: RequetUpdateSite): Promise<Site> {
    return apiService.put<Site>(`${this.endpoint}/update/${siteId}`, updateData);
  }

  async delete(siteId: number): Promise<boolean> {
    return apiService.delete<boolean>(`${this.endpoint}/delete/${siteId}`);
  }
}

export const siteService = new SiteService();