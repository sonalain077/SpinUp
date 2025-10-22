# copilot-instructions.md

Ce fichier contient des instructions pour GitHub Copilot / assistants IA utilisées dans ce dépôt.

## Objectif

Fournir des consignes claires et non sensibles pour les assistants automatisés qui contribuent à ce dépôt. Le fichier doit aider à automatiser les petites tâches sûres tout en évitant les actions sensibles ou non autorisées.

## Règles générales

- Ne pas modifier les fichiers binaires sans consentement explicite.
- Vérifier la compatibilité avec la branche `main` avant d'ouvrir une PR.
- Respecter les conventions de code présentes dans le dépôt.
- Toujours exécuter les tests locaux avant de proposer une PR automatisée.
- **OBLIGATOIRE** : Créer des tests unitaires pour chaque nouvelle fonction ajoutée.
- Respecter les bonnes pratiques de code définies ci-dessous.

## Exemples de tâches permises

- Correction de typos et de la documentation.
- Ajout de petits scripts utilitaires (tests, formatters) avec tests unitaires.
- Refactorings locaux et sûrs qui n'altèrent pas les API publiques sans discussion.

## Exemples de tâches interdites

- Ajout ou exfiltration de secrets.
- Changements de configuration CI/CD sensibles sans relecture humaine.
- Publication de versions sans approbation humaine.

## Tests Unitaires - Règles Obligatoires

### Principe fondamental
**TOUTE nouvelle fonction DOIT être accompagnée de tests unitaires avant d'être considérée comme terminée.**

### Règles de création des tests
1. **Couverture complète** : Tester tous les cas d'usage (nominal, erreur, cas limites)
2. **Nommage explicite** : `methodName_condition_expectedResult`
3. **Isolation** : Chaque test doit être indépendant et réversible
4. **Assertions claires** : Utiliser des assertions explicites avec messages d'erreur

### Structure des tests par couche
```
backend/src/test/java/com/parkandsee/backend/
├── controller/     # Tests des endpoints REST (MockMvc)
├── service/        # Tests de la logique métier (Mockito)
├── repository/     # Tests des accès données (DataJpaTest)
├── dto/           # Tests des objets de transfert
├── entity/        # Tests des entités JPA
└── integration/   # Tests bout-en-bout (SpringBootTest)
```

### Outils et annotations à utiliser
- **JUnit 5** : Framework de test principal
- **Mockito** : Pour les mocks et stubs (`@Mock`, `@MockBean`)
- **AssertJ** : Pour des assertions plus lisibles
- **Spring Boot Test** : `@SpringBootTest`, `@WebMvcTest`, `@DataJpaTest`
- **Base H2** : Pour les tests d'intégration (en mémoire)

### Exemples de tests requis pour chaque type de fonction
- **Controller** : Status HTTP, validation JSON, mapping des erreurs
- **Service** : Logique métier, gestion des exceptions, appels aux repositories
- **Repository** : Requêtes SQL, contraintes de données
- **DTO/Entity** : Getters/Setters, constructeurs, validation des données

### Commandes de test
```bash
# Tests unitaires seulement
mvn test -Dtest="*ServiceTest,*RepositoryTest,*DTOTest"

# Tests d'intégration
mvn test -Dtest="*IntegrationTest"

# Tests spécifiques
mvn test -Dtest="ParkingServiceTest"
```

## Bonnes Pratiques de Code

### Architecture et Organisation

#### Structure du projet Backend (Spring Boot)
```
backend/src/main/java/com/parkandsee/backend/
├── config/         # Configuration Spring (CORS, Jackson, etc.)
├── controller/     # Controllers REST (endpoints API)
├── service/        # Logique métier (business logic)
├── repository/     # Accès aux données (JPA repositories)
├── entity/         # Entités JPA (modèle de données)
├── dto/           # Data Transfer Objects (API contracts)
├── exception/      # Gestion centralisée des exceptions
└── util/          # Classes utilitaires
```

#### Structure du projet Frontend (React)
```
frontend/src/
├── components/     # Composants réutilisables
├── pages/         # Pages principales de l'application
├── services/      # Appels API et logique de communication
├── hooks/         # Custom hooks React
├── types/         # Types TypeScript (si utilisé)
├── utils/         # Fonctions utilitaires
├── styles/        # Styles globaux et thèmes
└── assets/        # Images, icônes, fichiers statiques
```

### Conventions de Nommage

#### Java (Backend)
- **Classes** : PascalCase (`ParkingService`, `ReservationEntity`)
- **Méthodes** : camelCase (`reserveAndPay`, `findByLicencePlate`)
- **Variables** : camelCase (`licencePlate`, `paymentToken`)
- **Constantes** : UPPER_SNAKE_CASE (`MAX_DURATION_MINUTES`)
- **Packages** : lowercase (`com.parkandsee.backend.service`)

#### TypeScript/JavaScript (Frontend)
- **Composants** : PascalCase (`ParkingReservation`, `AgentDashboard`)
- **Fonctions** : camelCase (`handleSubmit`, `formatDuration`)
- **Variables** : camelCase (`reservationData`, `isLoading`)
- **Constantes** : UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Fichiers** : camelCase (`parkingService.ts`, `reservationTypes.ts`)

### Standards de Code

#### Règles Java
- **Validation** : Utiliser les annotations Bean Validation (`@NotNull`, `@Valid`)
- **Documentation** : JavaDoc pour les méthodes publiques
- **Exceptions** : Créer des exceptions métier spécifiques
- **Logging** : Utiliser SLF4J avec des niveaux appropriés
- **Transactions** : Annoter avec `@Transactional` si nécessaire

```java
/**
 * Réserve une place de parking avec paiement
 * @param request Données de la réservation
 * @return Réponse de paiement avec ID de réservation
 * @throws PaymentException Si le paiement échoue
 */
@Transactional
public PaymentResponse reserveAndPay(@Valid PaymentRequest request) {
    // Implémentation...
}
```

#### Règles TypeScript/React
- **Props Interface** : Définir des interfaces pour les props
- **Error Boundaries** : Gérer les erreurs React
- **Custom Hooks** : Extraire la logique réutilisable
- **State Management** : Utiliser useState/useReducer approprié

```typescript
interface ParkingReservationProps {
  onSubmit: (data: ReservationData) => void;
  loading?: boolean;
}

const ParkingReservation: React.FC<ParkingReservationProps> = ({ onSubmit, loading = false }) => {
  // Implémentation...
};
```

### Gestion des Erreurs

#### Backend
- **Exceptions métier** : Créer des classes d'exception spécifiques
- **GlobalExceptionHandler** : Centraliser la gestion des erreurs
- **Codes HTTP** : Utiliser les codes appropriés (400, 401, 404, 500)

#### Frontend
- **Error Boundaries** : Capturer les erreurs React
- **Try-Catch** : Gérer les erreurs d'API
- **Messages utilisateur** : Afficher des messages compréhensibles

### Performance

#### Backend
- **Lazy Loading** : Configurer JPA pour éviter les N+1 queries
- **Caching** : Utiliser `@Cacheable` pour les données fréquemment lues
- **Pagination** : Implémenter la pagination pour les listes importantes

#### Frontend
- **Lazy Loading** : Charger les composants à la demande
- **Memoization** : Utiliser `useMemo` et `useCallback`
- **Optimistic Updates** : Mettre à jour l'UI avant la confirmation serveur

### Sécurité

#### Backend
- **Validation d'entrée** : Valider toutes les données utilisateur
- **CORS** : Configurer correctement les origines autorisées
- **Logs** : Ne pas logger d'informations sensibles

#### Frontend
- **Sanitization** : Nettoyer les données utilisateur
- **HTTPS** : Utiliser HTTPS en production
- **Tokens** : Stocker les tokens de manière sécurisée

## Processus de contribution automatique

1. L'agent propose un patch localement et exécute les tests.
2. **OBLIGATOIRE** : Créer les tests unitaires pour toute nouvelle fonction.
3. Vérifier que tous les tests passent (anciens + nouveaux).
4. Si les tests passent, l'agent peut ouvrir une PR depuis une branche `auto/<description>`.
5. Une revue humaine est requise avant la fusion.

## Contact

Pour questions, contacter le mainteneur : owner@example.com

## Description du projet (fournie par le mainteneur)

DESCRIPTIF DU MARCHE

Contexte
Votre société a remporté un appel d’offre public lancé par une grande agglomération française. Le projet Park & See vise à moderniser la gestion du
stationnement urbain à travers une solution numérique évolutive.

Phasage du projet
Phase 1 – Stationnement en parkings publics : Cette première étape se concentre exclusivement sur les parkings gérés par la collectivité. Elle constitue le périmètre opérationnel du projet à court terme.
Phase 2 – Stationnement sur voirie : Mentionnée uniquement pour contextualiser le projet dans les évolutions réglementaires récentes. Elle n’est pas
requise de manière obligatoire dans le cadre du présent développement.

Objectifs de la Phase 1
- Suivi en temps réel de l’occupation des places de parking.
- Identification des véhicules stationnés (type, immatriculation).
- Contrôle du paiement du stationnement.
- Mise à disposition d’une interface usager pour le paiement et le suivi.
- Interface fixe et mobile de suivi en temps réel de l'occupation et contrôle du paiement pour les contrôleurs (agents de la mairie & police municipale).

Contexte réglementaire (pertinent pour la phase 2)
- Fin des ZFE obligatoires au niveau national, maintien possible à l’échelle locale.
- Stationnement payant pour les deux-roues motorisés dans certaines villes ; interdiction du stationnement sur trottoir.
- Encadrement strict du stationnement des trottinettes électriques en libre-service.

Notes additionnelles / extraits fournis

Projet virtuel – Park & See (1/2)
FB1
Diapositive 14
FB1 Pour les usagers : Interface mobile paiement et suivi
Pour les contrôleurs (Agent de la mairie & police municipale) : Interface fixe et mobile suivi en temps réel de
l'occupation et contrôle du paiement
BEAULANT, Frederic; 2025-09-02T12:42:44.235
FB1 0 J’enlèverais «nombre d’occupants»
BEAULANT, Frederic; 2025-09-03T09:19:30.06

---

Si tu veux, je peux aussi :

- ajouter un fichier `README_PROJECT.md` séparé avec ce descriptif formaté ;
- découper les objectifs en tickets (ex. `issue_template` ou TODO) ;
- créer une branche `doc/project-description` et ouvrir une PR automatique.

## Stack technique (confirmée)

La stack technique choisie pour ce projet (Phase 1) :

- Frontend : React (TypeScript recommandé)
- Architecture : Front & Back séparés avec une API
- API : REST API
- Backend : Java, Spring Boot
- ORM : JPA / Hibernate
- Base de données : PostgreSQL
- CI/CD : GitHub Actions

Remarques courtes :
- Spring Boot + JPA/Hibernate est un bon choix pour la robustesse et la maturité côté backend et transactions (paiements).
- React côté frontend facilite une UI réactive pour les contrôleurs et l'interface usager.
- GitHub Actions sera utilisé pour builds, tests et déploiements automatiques.

Si tu veux, je peux :

- ajouter un skeleton de projet (`backend/` Spring Boot minimal + `frontend/` React) ;
- créer les workflows GitHub Actions de build/test basiques ;
- proposer un modèle de schéma SQL pour PostgreSQL.
