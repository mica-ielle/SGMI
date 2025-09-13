import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader } from './ui/card';
import { Eye, EyeOff, Lock, User, Settings } from 'lucide-react';
import { SettingsDialog } from './SettingsDialog';
import loginBg from 'figma:asset/40c1df3e91efebfdb79b621176248c84eaba2add.png';
import logoImage from 'figma:asset/4a476eee4ba994a3a597e7e6c95b1bd16d0765c3.png';

export const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (!success) {
        setError('Identifiants incorrects ou problème de connexion API. Vérifiez les paramètres API si nécessaire.');
      }
    } catch (err) {
      setError('Erreur de connexion. Vérifiez les paramètres API ou réessayez.');
      console.error('Erreur login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Section gauche avec illustration */}
      <div 
        className="hidden lg:flex flex-1 relative overflow-hidden"
        style={{
          backgroundImage: `url(${loginBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 via-blue-600/80 to-cyan-500/80"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 mx-auto mb-8 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
              <img src={logoImage} alt="CAMGAZ-TECH" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-4xl font-bold mb-6">
              Bienvenue sur CAMGAZ-TECH
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Plateforme de Gestion de Maintenance Assistée par Ordinateur
            </p>
            <p className="text-lg opacity-80">
              Gérez efficacement vos équipements, sites, planning et stocks
            </p>
          </div>
        </div>
      </div>

      {/* Section droite avec formulaire */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 relative">
        {/* Fond décoratif */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl"></div>
        </div>
        
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm relative z-10">
          <CardHeader className="space-y-6 pb-8">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mx-auto flex items-center justify-center relative overflow-hidden">
                <img src={logoImage} alt="CAMGAZ-TECH" className="w-10 h-10 object-contain" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
              <p className="text-gray-600">Accédez à votre espace GMAO</p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Identifiant</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Votre identifiant"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-white/70 backdrop-blur-sm border-gray-200/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/70 backdrop-blur-sm border-gray-200/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3"
                disabled={isLoading}
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>

              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Problème de connexion ?{' '}
                  <button 
                    type="button" 
                    onClick={() => setShowSettings(true)}
                    className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Paramètres API
                  </button>
                </p>
                <p className="text-sm text-gray-600">
                  Ou{' '}
                  <button type="button" className="text-purple-600 hover:text-purple-700 font-medium">
                    contactez l'administrateur
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
};