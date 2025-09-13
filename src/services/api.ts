// Configuration et services API pour communiquer avec le backend Spring Boot

import { settingsService } from './settingsService';

const getApiBaseUrl = () => settingsService.getApiBaseUrl();

// Intercepteur pour les erreurs HTTP
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

// Mode de fallback avec données mockées
/* const isMockMode = () => {
  // En mode développement, utilisez les données mockées si le backend n'est pas disponible
  return process.env.NODE_ENV === 'development' || localStorage.getItem('camgaz_mock_mode') === 'true';
}; */

const handleApiError = (error: Error, endpoint: string) => {
  console.warn(`API Error for ${endpoint}:`, error.message);
  
/*   if (isMockMode() && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
    console.info(`Fallback to mock data for ${endpoint}`);
    return null; // Indique qu'on doit utiliser les données mockées
  } */
  
  throw error;
};

// Classe de base pour les appels API
class ApiService {
  private get baseUrl(): string {
    return getApiBaseUrl();
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return handleResponse(response);
    } catch (error) {
      const result = handleApiError(error as Error, endpoint);
/*       if (result === null) {
        throw new Error('MOCK_FALLBACK'); // Signal pour utiliser les données mockées
      } */
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      return handleResponse(response);
    } catch (error) {
      const result = handleApiError(error as Error, endpoint);
/*       if (result === null) {
        throw new Error('MOCK_FALLBACK');
      } */
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      return handleResponse(response);
    } catch (error) {
      const result = handleApiError(error as Error, endpoint);
/*       if (result === null) {
        throw new Error('MOCK_FALLBACK');
      } */
      throw error;
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return handleResponse(response);
    } catch (error) {
      const result = handleApiError(error as Error, endpoint);
/*       if (result === null) {
        throw new Error('MOCK_FALLBACK');
      } */
      throw error;
    }
  }
}

export const apiService = new ApiService();