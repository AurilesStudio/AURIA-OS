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

### 4.5. Caméra Libre & Presets de Vues
- **Contrôles caméra :** MapControls avec rotation activée — clic gauche = pan, clic droit = rotation, scroll = zoom. Le passage sous le sol est bloqué (maxPolarAngle).
- **Presets de vue :** Toolbar flottante en bas à droite avec 4 presets (Isometric, Top-Down, Front, Side). Chaque preset est calculé dynamiquement par rapport au centre du projet actif.
- **Focus avatar :** Deux accès — bouton Focus dans la toolbar (picker listant tous les avatars déployés) et bouton Focus dans le header du panneau info avatar (focus direct sur l'avatar sélectionné).
- **Transitions animées :** CameraAnimator avec interpolation exponentielle frame-rate independent (ease-out smooth, speed=3). L'utilisateur peut interrompre une animation à tout moment en touchant la caméra.
- **Sécurité drag :** Listener window-level `pointerup` pour garantir que les contrôles caméra se réactivent même si le pointeur sort de la zone de drag.

### 4.6. Intégration LLM Multi-Provider
- **Providers supportés :** Claude (Anthropic), Gemini (Google), Mistral, Local (Ollama).
- **Clés API globales :** Configuration centralisée dans le panneau Settings (persisté en localStorage).
- **Ollama :** Endpoint et modèle configurables (défaut: `localhost:11434`, `mistral`).
- **Tripo3D :** Clé API pour la génération d'avatars 3D.
- **Exécution :** Chaque avatar envoie ses tâches au provider LLM configuré. Le coût en tokens est trackable par provider.
- **Pricing :** Calcul automatique du coût par requête (input/output tokens) selon le provider.

### 4.7. Système de Rôles
- **Rôles prédéfinis :** CEO, CTO, CFO, COO, CMO, CPO, Lead Dev, DevOps, Designer, Data Analyst, QA, Support, Legal, HR, Growth.
- **Rôles personnalisés :** Création libre avec nom, description, couleur et system prompt.
- **Panneau de gestion :** Interface dédiée pour créer, éditer et supprimer des rôles.
- **Assignation :** Chaque avatar est lié à un rôle qui définit son comportement via le system prompt.

### 4.8. Settings & Configuration
- **Panneau Settings :** Accessible depuis la sidebar, regroupe les clés API (Claude, Gemini, Mistral), la configuration Ollama et la clé Tripo3D.
- **Token Gauges :** Suivi en temps réel de la consommation par provider avec coût cumulé.
- **Reset tracking :** Possibilité de remettre les compteurs à zéro.

### 4.9. Intégration Écosystème
- **Linear Sync :** Affichage des tickets urgents.
- **Notion Bridge :** Exportation du contexte en cas de saturation de tokens.
- **GitHub Monitor :** Statut des PRs et déploiements.

## 5. Design & UX
- **Vibe :** Dark Mode, Neon Cyan (#00ffcc), Typographie Monospace.
- **Feeling :** "Command Center", "Mission Control".
- **Zero-Refresh :** Toutes les données doivent arriver en "Push".
- **Glass Morphism :** Panneaux overlay avec `backdrop-blur` et bordures semi-transparentes.
- **Caméra Toolbar :** Boutons compacts avec icônes Lucide, séparateur visuel entre presets et focus avatar.
- **Rooms :** Bordures neon subtiles (opacité réduite 0.12/0.04) pour un rendu épuré sans surcharge visuelle.

## 6. Roadmap Phase 1 (MVP)
1. ~~Setup Skeleton React + Tailwind.~~
2. ~~Connexion aux jauges de tokens via JSON/API.~~
3. ~~Champ d'input pour commandes directes.~~
4. ~~Intégration du flux de logs.~~

## 7. Roadmap Phase 2 (Actuel)
1. ~~Scène 3D isométrique avec rooms et avatars.~~
2. ~~Système de team (9 personnages, recrutement, skills, leveling).~~
3. ~~Multi-projet avec layout spatial (3 projets par défaut).~~
4. ~~Caméra libre avec presets de vues et focus avatar.~~
5. ~~Intégration LLM multi-provider (Claude, Gemini, Mistral, Ollama).~~
6. ~~Système de rôles personnalisables avec system prompts.~~
7. ~~Panneau settings centralisé (clés API, Ollama, Tripo3D).~~
8. ~~Team templates (sauvegarde/déploiement d'équipes entre projets).~~

## 8. Roadmap Phase 3 (Prochaine)
1. Exécution réelle des tâches par les agents via LLM.
2. Validation AURIA avec feedback loop sur le leveling.
3. Linear / Notion / GitHub sync temps réel.
4. Persistance serveur (Supabase) en remplacement du localStorage.
5. Mode mobile (Telegram bridge).
