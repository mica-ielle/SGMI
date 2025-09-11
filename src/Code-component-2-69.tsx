# Documentation du projet Frontend CAMGAZ-TECH

## 🏗️ Architecture générale

L'application est une Single Page Application (SPA) React avec TypeScript qui implémente une interface de GMAO (Gestion de Maintenance Assistée par Ordinateur). Elle suit une architecture modulaire avec séparation claire des responsabilités.

## 📁 Structure des fichiers

### `/App.tsx` - Point d'entrée principal
- **Rôle** : Composant racine de l'application
- **Responsabilités** :
  - Gestion du provider d'authentification
  - Routage conditionnel (connexion vs application principale)
  - Gestion de l'état global de navigation entre les modules
  - Affichage des notifications (Toaster)

### `/types/index.ts` - Définitions TypeScript
- **Rôle** : Centralisation de tous les types TypeScript
- **Contenu** :
  - Types miroirs des entités Java du backend (Equipement, Site, Stock, etc.)
  - Énumérations (TypeEquipement, StatutMaintenance, etc.)
  - DTOs pour les requêtes API (RequetCreateSite, RequetUpdateEquipement, etc.)
  - Types utilitaires pour l'authentification

### `/services/` - Couche de services API

#### `/services/api.ts`
- **Rôle** : Service de base pour les appels HTTP
- **Fonctionnalités** :
  - Configuration centralisée de l'URL de base de l'API
  - Méthodes génériques (GET, POST, PUT, DELETE)
  - Gestion centralisée des erreurs HTTP
  - Parsing automatique JSON/texte selon le content-type

#### `/services/equipementService.ts`
- **Rôle** : Service spécialisé pour la gestion des équipements
- **Méthodes** :
  - `create()` : Création d'un nouvel équipement
  - `getAll()` : Récupération de tous les équipements
  - `update()` : Mise à jour d'un équipement existant
  - `delete()` : Suppression d'un équipement

#### `/services/siteService.ts`
- **Rôle** : Service pour la gestion des sites
- **Spécificités** : Gestion des installations d'équipements sur sites

#### `/services/planningService.ts`
- **Rôle** : Service pour la gestion du planning de maintenance
- **Fonctionnalités** :
  - Gestion des tâches planifiées
  - Création de fiches d'intervention
  - Actions sur les tâches (affecter, reporter, annuler, valider)

#### `/services/stockService.ts`
- **Rôle** : Service pour la gestion des stocks
- **Spécificités** : Gestion des mouvements de stock (entrée/sortie) avec alertes

### `/hooks/useAuth.ts` - Hook d'authentification
- **Rôle** : Gestion centralisée de l'état d'authentification
- **Fonctionnalités** :
  - Context React pour l'état utilisateur
  - Persistance de session (localStorage)
  - Méthodes login/logout
  - État de chargement pour les transitions

### `/components/` - Composants réutilisables

#### `/components/LoginForm.tsx`
- **Rôle** : Interface de connexion
- **Design** : 
  - Interface split-screen (illustration + formulaire)
  - Design moderne avec gradients purple/blue
  - Validation de formulaire en temps réel
  - Gestion d'erreurs utilisateur

#### `/components/Layout.tsx`
- **Rôle** : Layout principal de l'application après connexion
- **Structure** :
  - Sidebar de navigation avec 4 modules principaux
  - Header dynamique selon la section active
  - Zone de contenu principale
  - Profil utilisateur avec déconnexion

### `/pages/` - Pages principales de l'application

#### `/pages/EquipementsPage.tsx`
- **Rôle** : Module de gestion des équipements
- **Fonctionnalités** :
  - CRUD complet des équipements
  - Gestion des tâches de maintenance par équipement
  - Gestion des pièces recommandées
  - Interface de recherche et filtrage
  - Formulaire multi-étapes avec validation

#### `/pages/SitesPage.tsx`
- **Rôle** : Module de gestion des sites
- **Fonctionnalités** :
  - CRUD des sites avec informations de contact
  - Installation d'équipements sur sites
  - Gestion des dates d'installation
  - Vue d'ensemble des équipements par site

#### `/pages/PlanningPage.tsx`
- **Rôle** : Module de planning des maintenances
- **Fonctionnalités** :
  - Vue planning et vue calendaire (en développement)
  - Création de tâches planifiées manuelles
  - Génération de fiches d'intervention
  - Enregistrement de défaillances avec validation métier
  - Gestion des statuts de maintenance

#### `/pages/StocksPage.tsx`
- **Rôle** : Module de gestion des stocks
- **Fonctionnalités** :
  - CRUD des stocks avec pièces associées
  - Mouvements de stock (entrée/sortie)
  - Système d'alertes pour stocks critiques
  - Barres de progression visuelles
  - Interface de gestion des seuils

## 🎨 Design System

### Couleurs principales
- **Primary** : Purple (#7C3AED) - Navigation, boutons principaux
- **Secondary** : Blue (#3B82F6) - Actions secondaires
- **Success** : Green (#10B981) - Confirmations, états positifs
- **Warning** : Orange (#F59E0B) - Alertes, états d'attention
- **Danger** : Red (#EF4444) - Erreurs, suppressions

### Composants UI
- Utilisation de **shadcn/ui** pour les composants de base
- Personnalisation avec Tailwind CSS
- Design responsive mobile-first
- Animations et transitions fluides

## 🔄 Flux de données

### Authentification
1. Utilisateur saisit ses identifiants
2. Hook `useAuth` valide et stocke la session
3. Context React propage l'état dans toute l'app
4. Redirection automatique vers l'interface principale

### Gestion des données
1. Components appellent les services appropriés
2. Services formatent les requêtes selon les DTOs
3. API service gère la communication HTTP
4. Réponses traitées et état local mis à jour
5. Interface utilisateur re-rendue automatiquement

## 🔧 Configuration

### Variables d'environnement recommandées
- `REACT_APP_API_URL` : URL de l'API backend (défaut: http://localhost:8421)
- `REACT_APP_ENVIRONMENT` : Environment (dev, staging, prod)

### Dépendances principales
- **React 18** : Framework UI
- **TypeScript** : Typage statique
- **Tailwind CSS** : Framework CSS
- **Lucide React** : Icônes
- **shadcn/ui** : Composants UI

## 📊 Gestion d'erreurs

### Niveaux d'erreur
1. **Erreurs réseau** : Gérées dans `api.ts` avec messages utilisateur
2. **Erreurs de validation** : Validation côté formulaire avant envoi
3. **Erreurs métier** : Messages d'erreur du backend affichés à l'utilisateur
4. **Erreurs critiques** : Fallbacks et états de chargement

### Patterns utilisés
- Try/catch systématique dans les appels API
- États de chargement pour toutes les opérations asynchrones
- Messages d'erreur contextuels
- Validation de formulaires en temps réel

## 🚀 Performance

### Optimisations
- Lazy loading des composants (prêt pour implémentation)
- Debouncing des recherches
- Mise en cache des données fréquemment utilisées
- Bundle splitting par route

### Best practices
- Composants fonctionnels avec hooks
- Éviter les re-renders inutiles
- Gestion optimisée des états
- Code splitting par module

## 🧪 Tests (recommandés)

### Structure de tests
- Tests unitaires pour les services API
- Tests d'intégration pour les composants
- Tests E2E pour les parcours utilisateur critiques
- Tests de performance pour les opérations lourdes

Cette architecture permet une maintenance facile, une extensibilité maximale, et une expérience utilisateur fluide tout en respectant les bonnes pratiques React et TypeScript.