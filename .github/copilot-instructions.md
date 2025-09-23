# copilot-instructions.md

Ce fichier contient des instructions pour GitHub Copilot / assistants IA utilisées dans ce dépôt.

## Objectif

Fournir des consignes claires et non sensibles pour les assistants automatisés qui contribuent à ce dépôt. Le fichier doit aider à automatiser les petites tâches sûres tout en évitant les actions sensibles ou non autorisées.

## Règles générales

- Ne pas modifier les fichiers binaires sans consentement explicite.
- Vérifier la compatibilité avec la branche `main` avant d'ouvrir une PR.
- Respecter les conventions de code présentes dans le dépôt.
- Toujours exécuter les tests locaux avant de proposer une PR automatisée.

## Exemples de tâches permises

- Correction de typos et de la documentation.
- Ajout de petits scripts utilitaires (tests, formatters) avec tests unitaires.
- Refactorings locaux et sûrs qui n'altèrent pas les API publiques sans discussion.

## Exemples de tâches interdites

- Ajout ou exfiltration de secrets.
- Changements de configuration CI/CD sensibles sans relecture humaine.
- Publication de versions sans approbation humaine.

## Processus de contribution automatique

1. L'agent propose un patch localement et exécute les tests.
2. Si les tests passent, l'agent peut ouvrir une PR depuis une branche `auto/<description>`.
3. Une revue humaine est requise avant la fusion.

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
