import { apiService } from './api';
import type { Stock, RequetCreateStock, SortieStock, RequetCreatePiece } from '../types';

export class StockService {
  private readonly endpoint = '/stock';

  async create(createData: RequetCreateStock): Promise<Stock> {
    try {
      return await apiService.post<Stock>(`${this.endpoint}/create`, createData);
    } catch (error) {
      console.error('Erreur lors de la création du stock:', error);
      throw error;
    }
  }

  async createPiece(createData: RequetCreatePiece): Promise<Stock> {
    try {
      return await apiService.post<Stock>(`${this.endpoint}/create/piece`, createData);
    } catch (error) {
      console.error('Erreur lors de la création de la piece :', error);
      throw error;
    }
  }


  async getAll(): Promise<Stock[]> {
    try {
      return await apiService.get<Stock[]>(`${this.endpoint}/get`);
    } catch (error) {
      console.error('Erreur lors de la récupération des stocks:', error);
      throw error;      
    }
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
    try {
      return await apiService.delete<boolean>(`${this.endpoint}/delete/${stockId}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du stock:', error);
      /* if ((error as Error).message === 'MOCK_FALLBACK') {
        return true;
      } */
      throw error;
    }
  }

  /* private getMockStocks(): Stock[] {
    return [
      {
        id_stock: 1,
        piece: {
          id_piece: 1,
          nom: 'Filtre à huile',
          reference: 'FLT-001'
        },
        quantite: 25,
        seuilAlerte: 10,
        seuilCritique: 5,
        prixUnitaire: 35.50,
        fournisseur: 'TechFlow Industries',
        emplacement: 'Entrepôt A - Rangée 1',
        derniereMiseAJour: '2024-12-01T10:30:00'
      },
      {
        id_stock: 2,
        piece: {
          id_piece: 2,
          nom: 'Joint d\'étanchéité',
          reference: 'JNT-002'
        },
        quantite: 8, // En dessous du seuil d'alerte
        seuilAlerte: 15,
        seuilCritique: 5,
        prixUnitaire: 12.75,
        fournisseur: 'SealsMax Corp',
        emplacement: 'Entrepôt A - Rangée 2',
        derniereMiseAJour: '2024-11-28T14:15:00'
      },
      {
        id_stock: 3,
        piece: {
          id_piece: 3,
          nom: 'Valve de sécurité',
          reference: 'VLV-003'
        },
        quantite: 3, // En dessous du seuil critique
        seuilAlerte: 8,
        seuilCritique: 5,
        prixUnitaire: 125.00,
        fournisseur: 'SafeValve Systems',
        emplacement: 'Entrepôt B - Zone sécurisée',
        derniereMiseAJour: '2024-11-30T09:45:00'
      },
      {
        id_stock: 4,
        piece: {
          id_piece: 4,
          nom: 'Fusible 32A',
          reference: 'FUS-004'
        },
        quantite: 50,
        seuilAlerte: 20,
        seuilCritique: 10,
        prixUnitaire: 8.25,
        fournisseur: 'ElectroSafe',
        emplacement: 'Entrepôt C - Électrique',
        derniereMiseAJour: '2024-12-02T16:20:00'
      }
    ];
  } */
}

export const stockService = new StockService();