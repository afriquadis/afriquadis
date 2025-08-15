# Guide de Tests AFRIQUADIS

Ce document décrit la stratégie de tests automatisés pour l'application AFRIQUADIS, incluant les tests unitaires, d'intégration et E2E.

## 🏗️ Architecture des Tests

### Structure des Dossiers
```
src/
├── components/
│   ├── __tests__/           # Tests des composants
│   │   ├── Button.test.tsx
│   │   ├── Card.test.tsx
│   │   ├── ThemeToggle.test.tsx
│   │   ├── DiagnosticWizard.integration.test.tsx
│   │   ├── UserFlow.e2e.test.tsx
│   │   └── test-utils.tsx
│   └── ...
├── lib/
│   ├── __tests__/           # Tests des utilitaires
│   │   ├── diagnosticEngine.test.ts
│   │   └── auth.test.ts
│   └── ...
└── ...
```

## 🧪 Types de Tests

### 1. Tests Unitaires
- **Objectif** : Tester les composants UI individuels
- **Couverture** : Props, états, événements, rendu
- **Composants** : Button, Card, ThemeToggle, etc.

### 2. Tests d'Intégration
- **Objectif** : Tester les interactions entre composants
- **Couverture** : Flux de données, navigation, état global
- **Composants** : DiagnosticWizard, formulaires multi-étapes

### 3. Tests E2E (End-to-End)
- **Objectif** : Tester le parcours utilisateur complet
- **Couverture** : Login → Diagnostic → Résultats
- **Outils** : React Testing Library + Jest

## 🚀 Exécution des Tests

### Commandes Disponibles
```bash
# Tests unitaires
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage

# Tests en mode CI
npm run test:ci
```

### Configuration Jest
- **Framework** : Jest + React Testing Library
- **Environnement** : jsdom (simulation navigateur)
- **Couverture** : 70% minimum requis
- **Timeout** : 10 secondes par test

## 📋 Composants Testés

### Button Component
```typescript
// Tests des variantes
it('renders with primary variant', () => {
  render(<Button variant="primary">Click me</Button>);
  expect(screen.getByRole('button')).toHaveClass('bg-green-600');
});

// Tests des états
it('can be disabled', () => {
  render(<Button disabled>Click me</Button>);
  expect(screen.getByRole('button')).toBeDisabled();
});

// Tests des événements
it('handles click events', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Card Component
```typescript
// Tests des variantes
it('renders with outline variant', () => {
  render(<Card variant="outline">Content</Card>);
  expect(screen.getByText('Content').closest('div')).toHaveClass('border');
});

// Tests des tailles
it('renders with different sizes', () => {
  const { rerender } = render(<Card size="sm">Content</Card>);
  expect(screen.getByText('Content').closest('div')).toHaveClass('p-3');
  
  rerender(<Card size="lg">Content</Card>);
  expect(screen.getByText('Content').closest('div')).toHaveClass('p-6');
});
```

### ThemeToggle Component
```typescript
// Tests du changement de thème
it('toggles theme from light to dark', async () => {
  render(<ThemeToggle />);
  const button = screen.getByRole('button');
  
  fireEvent.click(button);
  
  await waitFor(() => {
    expect(document.documentElement).toHaveClass('dark');
  });
});

// Tests de la persistance
it('initializes with theme from localStorage', () => {
  localStorageMock.getItem.mockReturnValue('dark');
  render(<ThemeToggle />);
  expect(document.documentElement).toHaveClass('dark');
});
```

## 🔄 Tests d'Intégration

### DiagnosticWizard
```typescript
// Test du flux complet
it('allows user to complete diagnostic wizard', async () => {
  render(<DiagnosticWizard />);
  
  // Sélection des symptômes
  const category = screen.getByText('Cardiovasculaire');
  fireEvent.click(category);
  
  await waitFor(() => {
    const symptom = screen.getByText('Douleur thoracique');
    fireEvent.click(symptom);
  });
  
  // Navigation entre étapes
  const nextButton = screen.getByText('Suivant');
  fireEvent.click(nextButton);
  
  await waitFor(() => {
    expect(screen.getByText('Étape 2 sur 3')).toBeInTheDocument();
  });
});
```

## 🌐 Tests E2E

### Parcours Utilisateur Complet
```typescript
describe('Complete User Journey', () => {
  it('completes full user journey from login to results', async () => {
    // 1. Login
    render(<LoginPage />);
    // ... remplir formulaire et se connecter
    
    // 2. Diagnostic
    render(<DiagnosticWizard />);
    // ... sélectionner symptômes et compléter
    
    // 3. Résultats
    render(<DiagnosticResults />);
    // ... vérifier l'affichage des résultats
    
    // Vérification du flux complet
    expect(localStorageMock.setItem).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/diagnostic/results');
  });
});
```

## 🛠️ Utilitaires de Test

### test-utils.tsx
```typescript
// Données de test réutilisables
export const mockSymptoms = [
  { id: 'douleur_poitrine', name: 'Douleur thoracique', category: 'cardiovasculaire' },
  // ...
];

// Helpers pour mocker l'environnement
export const setupTestEnvironment = () => {
  const localStorageMock = createLocalStorageMock();
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  return { localStorageMock };
};
```

## 📊 Couverture des Tests

### Métriques Requises
- **Branches** : 70% minimum
- **Fonctions** : 70% minimum
- **Lignes** : 70% minimum
- **Statements** : 70% minimum

### Génération du Rapport
```bash
npm run test:coverage
```

Le rapport sera généré dans le dossier `coverage/` avec :
- Vue d'ensemble HTML
- Détails par fichier
- Métriques de couverture

## 🔧 Configuration des Mocks

### Next.js Router
```typescript
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));
```

### NextAuth
```typescript
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));
```

### localStorage
```typescript
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

## 🚨 Gestion des Erreurs

### Tests de Robustesse
```typescript
it('handles localStorage errors gracefully', () => {
  localStorageMock.setItem.mockImplementation(() => {
    throw new Error('Storage quota exceeded');
  });
  
  render(<Component />);
  // Le composant ne doit pas planter
  expect(() => fireEvent.click(button)).not.toThrow();
});
```

### Tests des États d'Erreur
```typescript
it('shows error message for invalid credentials', async () => {
  (signIn as jest.Mock).mockResolvedValue({ error: 'Invalid credentials' });
  
  render(<LoginPage />);
  // ... remplir et soumettre le formulaire
  
  await waitFor(() => {
    expect(screen.getByText(/email ou mot de passe incorrect/i)).toBeInTheDocument();
  });
});
```

## 📱 Tests Responsifs

### Tests Multi-Écrans
```typescript
it('handles responsive design', () => {
  // Mock tablet width
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 768,
  });
  
  render(<Component />);
  // Le composant doit s'afficher correctement
  expect(screen.getByText('Content')).toBeInTheDocument();
});
```

## 🔄 Tests Asynchrones

### Gestion des Promises
```typescript
it('handles async operations correctly', async () => {
  render(<AsyncComponent />);
  
  // Attendre que l'opération asynchrone se termine
  await waitFor(() => {
    expect(screen.getByText('Loaded Content')).toBeInTheDocument();
  });
});
```

### Tests des Timeouts
```typescript
it('handles long-running operations', async () => {
  jest.setTimeout(10000); // 10 secondes
  
  render(<SlowComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Result')).toBeInTheDocument();
  }, { timeout: 5000 });
});
```

## 🧹 Nettoyage des Tests

### beforeEach/afterEach
```typescript
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
  document.documentElement.classList.remove('dark');
});

afterEach(() => {
  document.documentElement.classList.remove('dark');
});
```

### Nettoyage Global
```typescript
afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
```

## 📈 Bonnes Pratiques

### 1. Nommage des Tests
- Utiliser des descriptions claires et descriptives
- Suivre le pattern "it should..."
- Grouper les tests logiquement

### 2. Isolation des Tests
- Chaque test doit être indépendant
- Nettoyer l'état entre les tests
- Utiliser des mocks appropriés

### 3. Assertions
- Une assertion par test quand possible
- Utiliser des matchers spécifiques
- Tester le comportement, pas l'implémentation

### 4. Performance
- Tests rapides (< 100ms par test)
- Éviter les opérations coûteuses
- Utiliser des mocks pour les API externes

## 🚀 Déploiement CI/CD

### GitHub Actions
```yaml
- name: Run Tests
  run: npm run test:ci
  
- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

### Vérifications Pré-Déploiement
- Tous les tests passent
- Couverture minimale atteinte
- Aucune vulnérabilité de sécurité
- Build de production réussi

## 📚 Ressources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing](https://nextjs.org/docs/testing)

### Outils Recommandés
- **Jest** : Framework de test principal
- **React Testing Library** : Tests des composants React
- **@testing-library/jest-dom** : Matchers DOM personnalisés
- **ts-jest** : Support TypeScript pour Jest

## 🎯 Objectifs de Qualité

### Métriques de Qualité
- **Couverture de code** : 70% minimum
- **Temps d'exécution** : < 30 secondes pour tous les tests
- **Fiabilité** : 99%+ de tests qui passent de manière cohérente
- **Maintenabilité** : Tests lisibles et bien documentés

### Amélioration Continue
- Réviser et améliorer les tests régulièrement
- Ajouter des tests pour les nouvelles fonctionnalités
- Optimiser les tests lents ou fragiles
- Maintenir la documentation à jour

---

**Note** : Ce guide doit être maintenu à jour avec l'évolution de l'application et des bonnes pratiques de test.
