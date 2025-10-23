# Start SpinUp Tests

Lance les tests unitaires et d'intégration du projet SpinUp (Park & See) en utilisant les scripts d'automatisation optimisés.

## Instructions

Exécute le script de tests complet du projet SpinUp qui inclut :
- Validation de l'environnement de développement Java/Maven
- Exécution des tests unitaires du backend Spring Boot
- Génération des rapports de tests détaillés
- Options avancées pour tests spécifiques et couverture de code

## Commandes à exécuter

### Méthode recommandée (Maven direct)
```powershell
# Naviguer vers le dossier backend
cd backend

# Exécuter tous les tests
mvn test
```

### Scripts PowerShell (alternatif - si problèmes d'encodage résolus)
```powershell
# Naviguer vers le dossier des scripts
cd scripts

# Exécuter tous les tests avec rapport détaillé
.\run-tests.ps1

# Ou version simple
.\run-tests-simple.ps1
```

## Options avancées avec Maven

### Tests par catégorie
```powershell
# Naviguer vers le backend
cd backend

# Tests unitaires uniquement (exclut les tests d'intégration)
mvn test -Dtest=!IntegrationTest

# Tests d'intégration uniquement
mvn test -Dtest=IntegrationTest

# Tests rapides (Controllers et Services uniquement)
mvn test -Dtest=*ControllerTest,*ServiceTest
```

### Tests spécifiques
```powershell
# Test d'une classe spécifique
mvn test -Dtest=ParkingControllerTest

# Test d'une méthode spécifique
mvn test -Dtest=ParkingServiceTest#testCreateReservation
```

### Options de rapport
```powershell
# Tests avec couverture de code
mvn test jacoco:report

# Mode verbeux pour debugging
mvn test -X

# Mode échec rapide (arrêt au premier échec)
mvn test -Dmaven.test.failure.ignore=false
```

### Scripts PowerShell (si disponibles)
```powershell
# Si les scripts fonctionnent (après résolution des problèmes d'encodage)
cd scripts
.\run-tests.ps1 -Coverage
.\run-tests.ps1 -Verbose
.\run-tests.ps1 -TestClass "ParkingControllerTest"
```

## Contexte technique

### Structure des tests
- **Tests unitaires**: `/backend/src/test/java/com/parkandsee/backend/`
- **Configuration Maven**: Spring Boot Test, JUnit 5, Mockito
- **Rapports**: Générés dans `/backend/target/surefire-reports/`

### Classes de tests disponibles
- `ParkingControllerTest` - Tests du contrôleur REST
- `ParkingServiceTest` - Tests de la logique métier
- `ReservationEntityTest` - Tests des entités JPA
- `PaymentRequestTest` - Tests des DTOs de paiement
- `PaymentResponseTest` - Tests des réponses de paiement
- `IntegrationTest` - Tests d'intégration complets

### Prérequis validés
- Java 17+ (pour Spring Boot 3.1.4)
- Maven 3.6+ (pour la compilation et les tests)
- Backend Spring Boot compilé

## Comportement attendu

Le script va :
1. ✅ Valider l'environnement Java/Maven
2. 📂 Naviguer vers le répertoire backend
3. 🧪 Compiler et exécuter les tests Maven
4. 📊 Générer les rapports de tests automatiquement
5. 📈 Afficher les statistiques de réussite/échec
6. 🕐 Mesurer la durée d'exécution

**Note importante**: En cas de problèmes d'encodage avec les scripts PowerShell, utiliser directement Maven dans le dossier backend est la méthode la plus fiable.

## Rapports générés

### Rapports Surefire (toujours générés)
- **Location**: `/backend/target/surefire-reports/`
- **Format**: XML et TXT pour chaque classe de test
- **Contenu**: Résultats détaillés, temps d'exécution, échecs

### Rapport de couverture (avec option -Coverage)
- **Location**: `/backend/target/site/jacoco/index.html`
- **Format**: HTML interactif
- **Contenu**: Couverture ligne par ligne, méthodes, classes

## Exemples d'utilisation courante

```powershell
# Tests complets avec statistiques (RECOMMANDÉ)
cd backend
mvn test

# Tests rapides pendant le développement
cd backend
mvn test -Dtest=*ControllerTest,*ServiceTest

# Validation avant commit
cd backend
mvn test -Dtest=!IntegrationTest -Dmaven.test.failure.ignore=false

# Analyse de couverture complète
cd backend
mvn test jacoco:report

# Debug d'un test spécifique
cd backend
mvn test -Dtest=ParkingControllerTest -X

# Scripts PowerShell (si fonctionnels)
cd scripts
.\run-tests.ps1
.\run-tests.ps1 -Quick
```

## En cas de problème

### Tests qui échouent
```powershell
# Relancer avec plus de détails
cd backend
mvn test -X

# Test spécifique qui pose problème
cd backend
mvn test -Dtest=ClasseQuiEchoue -X
```

### Problèmes de compilation
```powershell
# Nettoyer et recompiler avant les tests
cd backend
mvn clean compile
mvn test
```

### Problèmes avec les scripts PowerShell
```powershell
# Utiliser Maven directement (méthode recommandée)
cd backend
mvn test

# Ou corriger l'encodage des scripts
cd scripts
# Vérifier l'encodage UTF-8 des fichiers .ps1
```

## Résultat attendu

Une fois la commande terminée :
- ✅ **Succès** : Tous les tests passent, statistiques Maven affichées
- ❌ **Échecs** : Détails des tests échoués, logs d'erreur Maven
- 📊 **Rapports** : Fichiers XML/HTML générés dans `target/surefire-reports/`
- ⏱️ **Performance** : Temps d'exécution mesuré par Maven
- 🎯 **Résultats attendus** : 82 tests exécutés, tous réussis

**Exemple de sortie réussie** :
```
[INFO] Tests run: 82, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
[INFO] Total time: ~21 seconds
```

## Intégration CI/CD

Ces scripts sont conçus pour être utilisés dans :
- **Développement local** : Tests avant commit
- **Pipelines CI/CD** : Validation automatique
- **Pull Requests** : Tests de non-régression
- **Releases** : Validation complète avec couverture