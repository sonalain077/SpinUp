# Frontend HTML Backup

Ce dossier contient la version HTML/CSS/JavaScript vanilla du frontend Park & See.

## Pourquoi ce backup ?

Cette version fonctionne parfaitement et sert de référence/fallback au cas où la version React aurait des problèmes.

## Contenu

- `index.html` - Interface principale de réservation
- `script.js` - Logique JavaScript (formatage plaque, validation, API calls)
- `styles.css` - Styles CSS avec validation visuelle
- `test.html` - Page de test de connectivité backend
- `README.md` - Documentation

## Fonctionnalités

- ✅ Formulaire de réservation complet
- ✅ Validation en temps réel (rouge/vert)
- ✅ Formatage automatique plaque d'immatriculation  
- ✅ Gestion intelligente de la suppression (tirets)
- ✅ Sélection type véhicule, durée, parking
- ✅ Communication avec API backend
- ✅ Gestion d'erreurs détaillée

## Utilisation

Ouvrir directement `index.html` dans un navigateur (avec backend démarré sur port 8081).

## Migration React

Cette version a été migrée vers React TypeScript dans le dossier `frontend/` principal.