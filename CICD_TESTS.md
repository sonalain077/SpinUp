# CI/CD - Tests Unitaires Automatisés

## 📋 Vue d'ensemble

Ce projet utilise GitHub Actions pour l'intégration et le déploiement continus (CI/CD) avec des tests unitaires automatisés.

## 🔄 Workflow CI/CD

### Déclenchement

Le pipeline se déclenche automatiquement sur :
- **Push** sur les branches : `main`, `feature/**`, `feat/**`
- **Pull Request** vers la branche `main`

### Jobs Exécutés

#### 1. Backend Tests (Java/Spring Boot)
- ✅ Configuration JDK 17
- ✅ Cache Maven pour optimiser les builds
- ✅ Compilation du backend
- ✅ Exécution des tests unitaires
- ✅ Génération du rapport de couverture JaCoCo
- ✅ Upload des rapports (tests + couverture)

#### 2. Frontend Tests (React)
- ✅ Configuration Node.js 18
- ✅ Installation des dépendances
- ✅ Lint du code (si configuré)
- ✅ Build du frontend

#### 3. Quality Check
- ✅ Vérification finale de la qualité
- ✅ Génération du résumé global

## 🧪 Tests Unitaires Backend

### Structure des Tests

```
backend/src/test/java/com/parkandsee/backend/
├── service/
│   ├── ActiveVehicleServiceTest.java       (7 tests)
│   └── ParkingOccupancyServiceTest.java    (7 tests)
└── controller/
    ├── ActiveVehicleControllerTest.java     (5 tests)
    └── ParkingOccupancyControllerTest.java  (3 tests)
```

### Tests Créés

#### ActiveVehicleServiceTest
- ✅ `getAllActiveVehicles_ShouldReturnAllVehicles`
- ✅ `getAllActiveVehicles_ShouldCalculateCorrectStatus`
- ✅ `getOverdueVehicles_ShouldReturnOnlyOverdueVehicles`
- ✅ `getAllActiveVehicles_ShouldCalculateCorrectAmount`
- ✅ `getAllActiveVehicles_WithEmptyList_ShouldReturnEmptyList`
- ✅ `getOverdueVehicles_WithNoOverdueVehicles_ShouldReturnEmptyList`

#### ParkingOccupancyServiceTest
- ✅ `getAllParkingOccupancy_ShouldReturnAllParkings`
- ✅ `getAllParkingOccupancy_ShouldCalculateCorrectOccupancy`
- ✅ `getAllParkingOccupancy_ShouldCountOverdueVehicles`
- ✅ `getAllParkingOccupancy_WithNoParkings_ShouldReturnEmptyList`
- ✅ `getAllParkingOccupancy_WithNoReservations_ShouldReturnZeroOccupancy`
- ✅ `getAllParkingOccupancy_ShouldHandleFullParking`

#### ActiveVehicleControllerTest
- ✅ Tests des endpoints REST avec MockMvc
- ✅ Validation du format JSON
- ✅ Vérification des status HTTP

#### ParkingOccupancyControllerTest
- ✅ Tests des endpoints REST
- ✅ Validation de la structure des données
- ✅ Gestion des cas limites

### Technologies de Test

- **JUnit 5** : Framework de test principal
- **Mockito** : Mocking des dépendances
- **AssertJ** : Assertions fluides et lisibles
- **MockMvc** : Tests des controllers REST
- **JaCoCo** : Couverture de code (objectif: 50%+)

## 🚀 Exécution Locale des Tests

### Backend

```bash
# Tous les tests
cd backend
mvn test

# Tests spécifiques
mvn test -Dtest=ActiveVehicleServiceTest
mvn test -Dtest=ParkingOccupancyServiceTest

# Avec rapport de couverture
mvn clean test jacoco:report

# Voir le rapport HTML
# Ouvrir : backend/target/site/jacoco/index.html
```

### Frontend

```bash
cd frontend-react
npm test
```

## 📊 Rapports Générés

### Backend
- **Surefire Reports** : `backend/target/surefire-reports/`
  - Résultats XML des tests
  - Rapports TXT détaillés

- **JaCoCo Coverage** : `backend/target/site/jacoco/`
  - Rapport HTML interactif
  - Statistiques par package/classe/méthode
  - Lignes couvertes/non couvertes

### GitHub Actions
Les rapports sont automatiquement uploadés comme artifacts :
- 📄 `test-reports` : Résultats des tests
- 📊 `coverage-report` : Couverture de code

## 🎯 Objectifs de Qualité

### Couverture de Code
- **Minimum requis** : 50% de couverture de ligne
- **Objectif** : 70%+ pour les nouveaux services
- **Controllers** : 80%+ (endpoints critiques)

### Standards de Test
- ✅ Chaque méthode publique doit avoir au moins 1 test
- ✅ Tester les cas nominaux ET les cas d'erreur
- ✅ Isoler les tests (pas de dépendances entre tests)
- ✅ Noms explicites : `methodName_condition_expectedResult`

## 🔧 Configuration JaCoCo

Le plugin JaCoCo est configuré dans `pom.xml` :

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.10</version>
    <executions>
        <!-- Préparation de l'agent -->
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <!-- Génération du rapport -->
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
        <!-- Vérification de la couverture -->
        <execution>
            <id>jacoco-check</id>
            <goals>
                <goal>check</goal>
            </goals>
            <configuration>
                <rules>
                    <rule>
                        <element>PACKAGE</element>
                        <limits>
                            <limit>
                                <counter>LINE</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.50</minimum>
                            </limit>
                        </limits>
                    </rule>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>
```

## 📈 Visualisation dans GitHub

### Pull Request Checks
Chaque PR affiche automatiquement :
- ✅ Status des tests backend
- ✅ Status du build frontend
- ✅ Quality check global

### Actions Tab
- 📊 Historique de tous les runs
- ⏱️ Durée d'exécution
- 📄 Logs détaillés
- 📦 Artifacts téléchargeables

## 🐛 Dépannage

### Les tests échouent localement mais passent en CI
```bash
# Nettoyer et rebuilder
mvn clean install
```

### JaCoCo ne génère pas de rapport
```bash
# Vérifier la version de Java
java -version  # Doit être 17+

# Forcer la régénération
mvn clean test jacoco:report
```

### Les artifacts ne sont pas uploadés
- Vérifier que les tests ont bien été exécutés
- Vérifier les chemins dans le workflow YAML

## 🎓 Bonnes Pratiques

### Avant de Commit
1. ✅ Exécuter tous les tests localement : `mvn test`
2. ✅ Vérifier la couverture : `mvn jacoco:report`
3. ✅ Corriger les tests qui échouent
4. ✅ Ajouter des tests pour le nouveau code

### Écriture de Tests
1. **AAA Pattern** : Arrange, Act, Assert
   ```java
   @Test
   void methodName_condition_expectedResult() {
       // Given (Arrange)
       // When (Act)
       // Then (Assert)
   }
   ```

2. **Isolation** : Utiliser `@Mock` et `@InjectMocks`
3. **Assertions claires** : AssertJ pour la lisibilité
4. **Edge cases** : Tester les limites et erreurs

## 📝 Checklist PR

Avant de créer une Pull Request :

- [ ] ✅ Tous les tests passent localement
- [ ] ✅ Couverture de code ≥ 50%
- [ ] ✅ Nouveaux tests pour nouveau code
- [ ] ✅ Pas de code commenté
- [ ] ✅ Documentation mise à jour
- [ ] ✅ CI/CD passe au vert

## 🔗 Liens Utiles

- [Documentation JUnit 5](https://junit.org/junit5/docs/current/user-guide/)
- [Mockito Documentation](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html)
- [AssertJ Documentation](https://assertj.github.io/doc/)
- [JaCoCo Documentation](https://www.jacoco.org/jacoco/trunk/doc/)
- [GitHub Actions](https://docs.github.com/en/actions)

## 📞 Support

En cas de problème avec le CI/CD :
1. Vérifier les logs dans l'onglet "Actions" de GitHub
2. Télécharger les artifacts pour analyser les rapports
3. Consulter ce guide de dépannage
4. Contacter l'équipe si le problème persiste
