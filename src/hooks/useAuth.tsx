import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { settingsService } from '../services/settingsService';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté (localStorage)
    try {
      const savedUser = localStorage.getItem('camgaz_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData && userData.username) {
          setUser(userData);
        } else {
          localStorage.removeItem('camgaz_user');
        }
      }
    } catch (error) {
      console.error('Erreur lors du parsing des données utilisateur:', error);
      localStorage.removeItem('camgaz_user');
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Tentative d'authentification réelle avec l'API
      const baseUrl = settingsService.getApiBaseUrl();
      
      try {
        const response = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
          const data = await response.json();
          const userData: User = {
            username: data.username || username.trim(),
            token: data.token || `token_${Date.now()}`
          };
          
          setUser(userData);
          localStorage.setItem('camgaz_user', JSON.stringify(userData));
          return true;
        } else {
          console.error('Échec de l\'authentification:', response.status, response.statusText);
          return false;
        }
      } catch (apiError) {
        console.warn('API non disponible, utilisation du mode démo:', apiError);
        
        // Mode démo si l'API n'est pas disponible
        if (username.trim() && password.trim()) {
          const userData: User = {
            username: username.trim(),
            token: `demo_token_${Date.now()}`
          };
          
          setUser(userData);
          localStorage.setItem('camgaz_user', JSON.stringify(userData));
          return true;
        }
        
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('camgaz_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};