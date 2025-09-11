import { apiService } from './api';
import type { Stock, RequetCreateStock, SortieStock } from '../types';

export class StockService {
  private readonly endpoint = '/stock';

  async create(createData: RequetCreateStock): Promise<Stock> {
    return apiService.post<Stock>(`${this.endpoint}/create`, createData);
  }

  async getAll(): Promise<Stock[]> {
    return apiService.get<Stock[]>(`${this.endpoint}/get`);
  }

  async entreeStock(stockId: number, quantiteP: number): Promise<Stock> {
    return apiService.put<Stock>(`${this.endpoint}/entree/${stockId}`, quantiteP);
  }

  async sortieStock(stockId: number, quantiteM: number): Promise<SortieStock> {
    return apiService.put<SortieStock>(`${this.endpoint}/sortie/${stockId}`, quantiteM);
  }

  async update(stockId: number, stock: Stock): Promise<Stock> {
    return apiService.put<Stock>(`${this.endpoint}/update/${stockId}`, stock);
  }

  async delete(stockId: number): Promise<boolean> {
    return apiService.delete<boolean>(`${this.endpoint}/delete/${stockId}`);
  }
}

export const stockService = new StockService();