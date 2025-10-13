# Tests Unitaires - SpinUp

Guide pour créer et lancer les tests unitaires du projet SpinUp.

## 📋 Prérequis

- Java JDK 17+
- Maven 3.6+
- Les dépendances de test sont incluses dans le `pom.xml` via `spring-boot-starter-test`

## 🔍 Vérifier les dépendances de test

Vérifiez que votre `backend/pom.xml` contient la dépendance de test :

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

## 📁 Structure des tests

Les tests doivent être placés dans :
```
backend/
├── src/
│   ├── main/java/com/parkandsee/backend/
│   └── test/java/com/parkandsee/backend/
│       ├── controller/
│       ├── service/
│       └── repository/
```

## 🧪 Exemples de tests à créer

### Test du Controller (ParkingControllerTest.java)

Créez le fichier `backend/src/test/java/com/parkandsee/backend/controller/ParkingControllerTest.java` :

```java
package com.parkandsee.backend.controller;

import com.parkandsee.backend.service.ParkingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ParkingController.class)
class ParkingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ParkingService parkingService;

    @Test
    void ping_ShouldReturnBackendRunningMessage() throws Exception {
        mockMvc.perform(get("/api/parking/ping"))
                .andExpect(status().isOk())
                .andExpect(content().string("Backend is running!"));
    }

    @Test
    void status_ShouldReturnJsonStatus() throws Exception {
        mockMvc.perform(get("/api/parking/status"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$.status").value("OK"));
    }
}
```

### Test du Service (ParkingServiceTest.java)

Créez le fichier `backend/src/test/java/com/parkandsee/backend/service/ParkingServiceTest.java` :

```java
package com.parkandsee.backend.service;

import com.parkandsee.backend.dto.PaymentRequest;
import com.parkandsee.backend.dto.PaymentResponse;
import com.parkandsee.backend.entity.ReservationEntity;
import com.parkandsee.backend.repository.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ParkingServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private ParkingService parkingService;

    private PaymentRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new PaymentRequest();
        validRequest.setLicencePlate("AB-123-CD");
        validRequest.setVehicleType("voiture");
        validRequest.setStartAt(LocalDateTime.now().plusHours(1));
        validRequest.setDurationMinutes(60);
        validRequest.setAddress("Test Parking");
        validRequest.setPaymentToken("test-token");
    }

    @Test
    void reserveAndPay_WithValidRequest_ShouldReturnSuccess() {
        // Given
        ReservationEntity savedEntity = new ReservationEntity();
        savedEntity.setId("test-id");
        when(reservationRepository.save(any(ReservationEntity.class))).thenReturn(savedEntity);

        // When
        PaymentResponse response = parkingService.reserveAndPay(validRequest);

        // Then
        assertTrue(response.isSuccess());
        assertEquals("Reservation confirmed", response.getMessage());
        assertNotNull(response.getReservationId());
        verify(reservationRepository).save(any(ReservationEntity.class));
    }

    @Test
    void reserveAndPay_ShouldSaveReservationWithCorrectData() {
        // Given
        when(reservationRepository.save(any(ReservationEntity.class))).thenReturn(new ReservationEntity());

        // When
        parkingService.reserveAndPay(validRequest);

        // Then
        verify(reservationRepository).save(argThat(entity -> 
            entity.getLicencePlate().equals("AB-123-CD") &&
            entity.getVehicleType().equals("voiture") &&
            entity.getDurationMinutes().equals(60) &&
            entity.getAddress().equals("Test Parking")
        ));
    }
}
```

### Test d'intégration (IntegrationTest.java)

Créez le fichier `backend/src/test/java/com/parkandsee/backend/IntegrationTest.java` :

```java
package com.parkandsee.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parkandsee.backend.dto.PaymentRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void fullReservationFlow_ShouldWork() throws Exception {
        PaymentRequest request = new PaymentRequest();
        request.setLicencePlate("IT-999-XX");
        request.setVehicleType("voiture");
        request.setStartAt(LocalDateTime.now().plusHours(2));
        request.setDurationMinutes(120);
        request.setAddress("Integration Test Parking");
        request.setPaymentToken("integration-test");

        mockMvc.perform(post("/api/parking/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Reservation confirmed"))
                .andExpect(jsonPath("$.reservationId").exists());
    }
}
```

## 🚀 Commandes pour lancer les tests

### Depuis PowerShell (répertoire racine du projet)

```powershell
# Aller dans le dossier backend
cd backend

# Lancer tous les tests
mvn test

# Lancer les tests avec rapport détaillé
mvn test -Dmaven.test.failure.ignore=true

# Lancer les tests en mode verbeux (debug)
mvn -X test

# Lancer un test spécifique
mvn -Dtest=ParkingControllerTest test

# Lancer tous les tests d'une classe
mvn -Dtest=ParkingServiceTest test

# Lancer une méthode de test spécifique
mvn -Dtest=ParkingControllerTest#ping_ShouldReturnBackendRunningMessage test

# Lancer les tests avec couverture de code (si JaCoCo configuré)
mvn test jacoco:report
```

### Lancer les tests avec différents profils

```powershell
# Tests avec base H2 en mémoire (rapide)
mvn test -Dspring.profiles.active=test

# Tests avec base PostgreSQL (si configurée pour les tests)
mvn test -Dspring.profiles.active=integration
```

## 📊 Analyser les résultats

### Rapports de tests
Les rapports sont générés dans :
- `target/surefire-reports/` - Rapports XML et TXT
- `target/site/jacoco/` - Rapport de couverture (si JaCoCo activé)

### Voir les résultats en console
```powershell
# Afficher uniquement les résultats
mvn test | Select-String "Tests run:"

# Afficher les échecs en détail
mvn test | Select-String "FAILURE\|ERROR"
```

## 🐛 Dépannage

### Erreurs communes

1. **Tests échouent avec erreur de base de données**
   ```powershell
   # Utiliser H2 pour les tests
   mvn test -Dspring.datasource.url=jdbc:h2:mem:testdb
   ```

2. **Erreur "No tests found"**
   ```powershell
   # Vérifier la structure des dossiers
   ls backend/src/test/java/ -Recurse
   ```

3. **Tests lents**
   ```powershell
   # Désactiver les tests d'intégration
   mvn test -DskipITs=true
   ```

## 🎯 Script PowerShell pour automatiser les tests

Créez un fichier `run-tests.ps1` dans le répertoire backend :

```powershell
# Script pour lancer les tests unitaires
param(
    [string]$TestClass = "",
    [switch]$Verbose,
    [switch]$Coverage
)

Write-Host "🧪 Lancement des tests unitaires SpinUp" -ForegroundColor Green

$TestCommand = "mvn test"

if ($TestClass) {
    $TestCommand += " -Dtest=$TestClass"
}

if ($Verbose) {
    $TestCommand += " -X"
}

if ($Coverage) {
    $TestCommand += " jacoco:report"
}

Write-Host "Commande: $TestCommand" -ForegroundColor Cyan

Invoke-Expression $TestCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tests réussis!" -ForegroundColor Green
} else {
    Write-Host "❌ Certains tests ont échoué" -ForegroundColor Red
}
```

### Utilisation du script
```powershell
# Tous les tests
.\run-tests.ps1

# Test spécifique
.\run-tests.ps1 -TestClass ParkingControllerTest

# Avec couverture
.\run-tests.ps1 -Coverage

# Mode verbeux
.\run-tests.ps1 -Verbose
```

## 📚 Bonnes pratiques

1. **Nommage des tests** : `methodName_condition_expectedResult`
2. **Organisation** : Un fichier de test par classe
3. **Isolation** : Chaque test doit être indépendant
4. **Mocks** : Utiliser `@MockBean` pour les dépendances externes
5. **Assertions** : Utiliser AssertJ pour des assertions plus lisibles

## 🔧 Configuration avancée

### Ajout de JaCoCo pour la couverture de code

Ajoutez dans votre `pom.xml` :

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.8</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

---

**💡 Conseil** : Commencez par créer les fichiers de test de base, puis lancez `mvn test` pour vérifier la configuration. Ajoutez progressivement plus de tests selon vos besoins.