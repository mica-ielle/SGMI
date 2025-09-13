import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoginForm } from './components/LoginForm';
import { Layout } from './components/Layout';
import { DemoModeIndicator } from './components/DemoModeIndicator';
import { DashboardPage } from './pages/DashboardPage';
import { EquipementsPage } from './pages/EquipementsPage';
import { SitesPage } from './pages/SitesPage';
import { PlanningPage } from './pages/PlanningPage';
import { StocksPage } from './pages/StocksPage';
import { SettingsPage } from './pages/SettingsPage';
import { Toaster } from './components/ui/sonner';

import ErrorBoundary from './components/ErrorBoundary';



function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'equipements':
        return <EquipementsPage />;
      case 'sites':
        return <SitesPage />;
      case 'planning':
        return <PlanningPage />;
      case 'stocks':
        return <StocksPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <ErrorBoundary>
          <>
            <Layout activeTab={activeTab} onTabChange={setActiveTab}>
              {renderActiveComponent()}
            </Layout>
            <DemoModeIndicator />
          </>
    </ErrorBoundary>


  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AppContent />
        <Toaster />
      </div>
    </AuthProvider>
  );
}