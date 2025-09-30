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
