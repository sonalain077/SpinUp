# Park & See - Frontend

Frontend minimal pour l'application Park & See (Phase 1 - Stationnement en parkings publics).

## Description

Interface utilisateur simple pour la réservation et le paiement de places de parking. Cette version utilise HTML/CSS/JavaScript vanilla pour une compatibilité maximale.

## Fonctionnalités

- ✅ Formulaire de réservation de parking
- ✅ Validation en temps réel des données
- ✅ Formatage automatique des plaques d'immatriculation
- ✅ Communication avec l'API backend
- ✅ Interface responsive
- ✅ Gestion des erreurs et feedback utilisateur

## Structure

```
frontend/
├── index.html          # Page principale
├── styles.css          # Styles CSS
├── script.js           # Logique JavaScript
└── README.md          # Ce fichier
```

## Utilisation

### Prérequis

1. Backend Spring Boot démarré sur `http://localhost:8081`
2. Navigateur web moderne

### Démarrage

1. **Option 1 - Fichier local :**
   Ouvrez directement `index.html` dans votre navigateur

2. **Option 2 - Serveur local simple :**
   ```bash
   # Avec Python (si installé)
   python -m http.server 3000
   
   # Avec Node.js (si installé)
   npx http-server -p 3000
   
   # Avec PHP (si installé)
   php -S localhost:3000
   ```

3. Accédez à l'application dans votre navigateur

### Test

1. Remplissez le formulaire :
   - **Plaque :** Format AB-123-CD (formatage automatique)
   - **Début :** Date et heure de début (défaut : +30 minutes)
   - **Durée :** Sélection prédéfinie
   - **Adresse :** Nom du parking
   - **Token :** "demo" (mode démo)

2. Cliquez sur "Réserver et Payer"

3. Vérifiez la réponse de l'API

## API Backend

L'interface communique avec l'endpoint :
- **POST** `http://localhost:8081/api/parking/reserve`

### Format de requête

```json
{
  "licencePlate": "AB-123-CD",
  "startAt": "2025-09-30T15:00:00",
  "durationMinutes": 60,
  "address": "Parking Central",
  "paymentToken": "demo"
}
```

### Format de réponse

```json
{
  "success": true,
  "message": "Réservation confirmée",
  "reservationId": "uuid-string"
}
```

## Améliorations futures

- [ ] Framework React/Vue.js pour plus de complexité
- [ ] Authentification utilisateur
- [ ] Visualisation des places disponibles en temps réel
- [ ] Carte interactive des parkings
- [ ] Historique des réservations
- [ ] Notifications push
- [ ] Mode PWA (Progressive Web App)
- [ ] Tests automatisés

## Dépannage

### Erreur CORS
Si vous obtenez des erreurs CORS, vérifiez que :
1. Le backend inclut la configuration CORS (`CorsConfig.java`)
2. L'URL du backend est correcte dans `script.js`

### Backend non accessible
Si le frontend ne peut pas contacter le backend :
1. Vérifiez que Spring Boot est démarré : `mvn spring-boot:run`
2. Testez l'API directement : `curl http://localhost:8081/api/parking/reserve`
3. Vérifiez les logs du backend pour les erreurs

### Validation des données
- La plaque doit suivre le format français : 2 lettres, 3 chiffres, 2 lettres
- La date doit être dans le futur
- Tous les champs sont obligatoires

## Technologies

- **HTML5** - Structure sémantique
- **CSS3** - Styles modernes avec Flexbox/Grid
- **JavaScript ES6+** - Logique applicative
- **Fetch API** - Communication HTTP
- **Responsive Design** - Compatible mobile/desktop