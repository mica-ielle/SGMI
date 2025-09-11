import { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  Settings, 
  Package, 
  MapPin, 
  Calendar, 
  Archive,
  LogOut,
  User
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'equipements', label: 'Gestion des équipements', icon: Settings },
  { id: 'sites', label: 'Gestion des sites', icon: MapPin },
  { id: 'planning', label: 'Planning des maintenances', icon: Calendar },
  { id: 'stocks', label: 'Gestion des stocks', icon: Archive },
];

export const Layout = ({ children, activeTab, onTabChange }: LayoutProps) => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-purple-700 to-purple-900 text-white flex flex-col">
        {/* Logo et titre */}
        <div className="p-6 border-b border-purple-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg">CAMGAZ-TECH</h1>
              <p className="text-purple-200 text-sm">GMAO</p>
            </div>
          </div>
        </div>

        {/* Menu de navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 shadow-lg'
                    : 'hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Profil utilisateur */}
        <div className="p-4 border-t border-purple-600">
          <Card className="bg-white/10 border-white/20 text-white p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">{user?.username}</p>
                <p className="text-purple-200 text-sm">Utilisateur</p>
              </div>
            </div>
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="w-full text-white hover:bg-white/20 justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </Card>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h2>
              <p className="text-gray-600 mt-1">
                Gérez vos {activeTab} en toute simplicité
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};