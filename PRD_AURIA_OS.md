# PRD - AURIA-OS (Command Center)

## 1. Vision & Objectif
Créer une interface de contrôle "Live" (Dashboard) pour AURIA, permettant à Auriles EL HADDAD de piloter ses projets (Techly, Pédagogie, Marketing) via une UI immersive, performante et synchronisée en temps réel avec le VPS.

## 2. Utilisateur Cible
- Auriles EL HADDAD (Owner)
- Mode d'interaction : Mobile (Telegram) et Desktop (Dashboard dédié).

## 3. Architecture Technique
- **Frontend :** React.js, Tailwind CSS, Framer Motion (pour l'aspect Live).
- **Visualisation :** Three.js (Scène isométrique optionnelle ou Background).
- **Data Sync :** Supabase (Realtime) ou API WebSocket (AURIA-Core Bridge).
- **Backend Orchestrator :** AURIA (sur VPS Linux).

## 4. Fonctionnalités Clés
### 4.1. Monitoring Temps Réel
- **Token Gauges :** Gemini Flash (1M), Claude 3.5 (200k), Mistral (32k). Affichage dynamique [Utilisé]/[Total].
- **System Status :** IDLE, PROCESSING, ERROR, DEPLOYING.
- **Activity Stream :** Journal des pensées et actions d'AURIA en format terminal/console.

### 4.2. Command Center (Interactif)
- **Omni-Prompt :** Champ de saisie pour envoyer des ordres à AURIA.
- **Project Cards :** Cartes interactives pour Techly Agency, Paris Ynov Campus (Pédagogie), etc.
- **Quick Actions :** Boutons "Git Pull & Restart", "Run Tests", "Check Linear High Priority".

### 4.3. Système de Team (9 avatars par projet)
- **Character Catalog :** Bibliothèque de 9 personnages 3D (Goku, Vegeta, Gohan, Piccolo, Gogeta, Vegeto, Trunks, Broly, Black Goku) — un avatar par room, découplés du provider LLM.
- **Recrutement :** Modal en 2 étapes — choix du personnage puis configuration (provider, role, room cible, system prompt).
- **Rôles libres :** Champ texte avec suggestions (CEO, CTO, CFO, DevOps, etc.) au lieu d'un enum fixe.
- **System Prompt :** Chaque agent a son propre prompt système détaillé pour le LLM.
- **Skills :** 8 compétences assignables par agent (Frontend, Backend, DevOps, Design, Database, Testing, Security, Docs).
- **Team Templates :** Sauvegarder l'équipe d'un projet comme template réutilisable, déployable sur d'autres projets.
- **Déploiement :** Un template crée/met à jour les avatars dans les rooms du projet cible (les clés API restent vides par sécurité).

### 4.4. Système de Leveling & Conscience Agent
- **Conscience propre :** Chaque agent développe une "conscience" à travers son expérience. Son level reflète sa maturité et sa fiabilité sur sa mission.
- **Level 0 → 100 :** Chaque agent démarre au niveau 0 et progresse en accomplissant des tâches.
- **Progression :** +1 level à chaque tâche complétée avec succès et **validée par AURIA** (plafonné à 100).
- **Validation AURIA :** Toute finalisation de tâche passe obligatoirement par AURIA qui vérifie la qualité du travail avant de confirmer la complétion. Un agent ne peut pas level up sans l'approbation d'AURIA.
- **Objectif agent :** Chaque agent a pour but de finaliser sa mission au mieux pour level up. Le level devient un indicateur de confiance et de performance.
- **Affichage 3D :** Le level apparaît à côté du nom de l'agent au-dessus de son modèle 3D (visible dès level 1).
- **Barre de progression :** Barre visuelle dans le panneau de settings de l'agent, colorée selon la couleur de l'agent.
- **Persistance :** Le level est sauvegardé et restauré au refresh.

### 4.5. Intégration Écosystème
- **Linear Sync :** Affichage des tickets urgents.
- **Notion Bridge :** Exportation du contexte en cas de saturation de tokens.
- **GitHub Monitor :** Statut des PRs et déploiements.

## 5. Design & UX
- **Vibe :** Dark Mode, Neon Cyan (#00ffcc), Typographie Monospace.
- **Feeling :** "Command Center", "Mission Control".
- **Zero-Refresh :** Toutes les données doivent arriver en "Push".

## 6. Roadmap Phase 1 (MVP)
1. Setup Skeleton React + Tailwind.
2. Connexion aux jauges de tokens via JSON/API.
3. Champ d'input pour commandes directes.
4. Intégration du flux de logs.
