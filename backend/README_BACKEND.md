Backend minimal pour l'interface client (Park & See)

Démarrage :
- JDK 17 et Maven installés
- Depuis le répertoire `backend` : mvn spring-boot:run

Endpoints :
- POST /api/parking/reserve
  Body JSON (Content-Type: application/json):
  {
    "licencePlate": "AB-123-CD",
    "startAt": "2025-09-30T10:00:00",
    "durationMinutes": 60,
    "address": "Parking Central",
    "paymentToken": "demo"
  }

Réponse :
  {
    "success": true,
    "message": "Reservation confirmed",
    "reservationId": "..."
  }

Notes :
- Ceci est un backend minimal avec stockage en mémoire et simulation du paiement.
- À améliorer : persistance (Postgres), intégration d'un vrai PSP, validation plus fine.

Postgres (local) pour développement
----------------------------------

Un fichier `docker-compose.yml` a été ajouté à la racine du projet pour lancer un conteneur Postgres :

  POSTGRES_DB=parkandsee
  POSTGRES_USER=postgres
  POSTGRES_PASSWORD=example

Pour démarrer Postgres (depuis la racine du repository) :

```powershell
docker-compose up -d
```

Puis lancer le backend en lui passant les variables d'environnement (exemple depuis PowerShell) :

```powershell
cd .\backend
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/parkandsee"
$env:SPRING_DATASOURCE_USERNAME = "postgres"
$env:SPRING_DATASOURCE_PASSWORD = "example"
mvn spring-boot:run
```

Si Docker/Postgres n'est pas disponible, l'application retombe automatiquement sur une base H2 en mémoire (config par défaut) pour tests rapides.
