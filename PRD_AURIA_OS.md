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
- **Character Catalog :** Bibliothèque de personnages 3D répartis en 3 teams (Dragon Ball, Naruto, One Piece). Chaque personnage avec modèle GLB est directement utilisable comme avatar dans les rooms, découplé du provider LLM.
  - **Dragon Ball (9) :** Goku, Vegeta, Gohan, Piccolo, Gogeta, Vegeto, Trunks, Broly, Black Goku — tous avec modèles 3D.
  - **Naruto (10) :** Naruto, Sasuke, Kakashi, Sakura, Itachi, Gaara, Shikamaru, Jiraiya, Tsunade, Madara — Madara, Itachi et Sasuke avec modèles 3D.
  - **One Piece (9) :** Luffy, Zoro, Sanji, Nami, Robin, Chopper, Franky, Brook, Jinbe — Luffy, Zoro, Sanji et Franky avec modèles 3D.
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

### 4.5. AURIA — Superviseur Global
AURIA est l'orchestrateur du système. Ce n'est pas un avatar classique :
- **Non sélectionnable / non draggable :** Cliquer sur AURIA ne fait rien (pas de panneau info, pas de drag).
- **Non recruitable :** AURIA n'apparaît pas dans le modal de recrutement ni dans les onglets de teams.
- **Toujours présent :** Spawné automatiquement au démarrage dans l'état initial du store (id fixe `avatar-auria`). Filtré à la restauration du localStorage pour garantir unicité.
- **Patrol cross-room :** AURIA se déplace librement entre toutes les rooms de tous les projets (Walking permanent). Son `roomId`/`projectId` restent vides — il n'appartient à aucune room.
- **Actions store :** `spawnAuria()` (avec dédup), `removeAuria()`, `selectAvatar()` bloque la sélection si `characterId === "auria"`.

### 4.6. Caméra Libre, Presets & Tracking Temps Réel
- **Contrôles caméra :** MapControls avec rotation activée — clic gauche = pan, clic droit = rotation, scroll = zoom. Le passage sous le sol est bloqué (maxPolarAngle).
- **Presets de vue :** Toolbar flottante en bas à droite avec 4 presets (Isometric, Top-Down, Front, Side). Chaque preset est calculé dynamiquement par rapport au centre du projet actif.
- **Focus avatar :** Deux accès — bouton Focus dans la toolbar (picker listant tous les avatars déployés) et bouton Focus dans le header du panneau info avatar.
- **Tracking temps réel :** Le focus avatar est un toggle qui active un suivi continu de la caméra. La caméra suit l'avatar frame par frame via `avatarWorldPositions` (Map globale mise à jour chaque frame dans le `useFrame` de chaque avatar). Le tracking s'arrête automatiquement quand l'utilisateur touche les contrôles caméra (orbit), ou par re-clic sur le bouton Focus.
- **Positions monde :** Les avatars opèrent en coordonnées monde (le `groupRef` Three.js est positionné directement en world-space). La position est synchronisée vers le store toutes les 250ms pendant le walk, et immédiatement quand le walk s'arrête, garantissant la cohérence entre la position visuelle 3D et les données du store.
- **Transitions animées :** CameraAnimator avec interpolation exponentielle frame-rate independent (ease-out smooth, speed=3). L'utilisateur peut interrompre une animation/tracking à tout moment en touchant la caméra.
- **Sécurité drag :** Listener window-level `pointerup` pour garantir que les contrôles caméra se réactivent même si le pointeur sort de la zone de drag.

### 4.7. Intégration LLM Multi-Provider
- **Providers supportés :** Claude (Anthropic), Gemini (Google), Mistral, Local (Ollama).
- **Clés API globales :** Configuration centralisée dans le panneau Settings (persisté en localStorage).
- **Ollama :** Endpoint et modèle configurables (défaut: `localhost:11434`, `mistral`).
- **Tripo3D :** Clé API pour la génération d'avatars 3D.
- **Exécution :** Chaque avatar envoie ses tâches au provider LLM configuré. Le coût en tokens est trackable par provider.
- **Pricing :** Calcul automatique du coût par requête (input/output tokens) selon le provider.

### 4.8. Système de Rôles
- **Rôles prédéfinis :** CEO, CTO, CFO, COO, CMO, CPO, Lead Dev, DevOps, Designer, Data Analyst, QA, Support, Legal, HR, Growth.
- **Rôles personnalisés :** Création libre avec nom, description, couleur et system prompt.
- **Panneau de gestion :** Interface dédiée pour créer, éditer et supprimer des rôles.
- **Assignation :** Chaque avatar est lié à un rôle qui définit son comportement via le system prompt.

### 4.9. Settings & Configuration
- **Panneau Settings :** Accessible depuis la sidebar, regroupe les clés API (Claude, Gemini, Mistral), la configuration Ollama et la clé Tripo3D.
- **Token Gauges :** Suivi en temps réel de la consommation par provider avec coût cumulé.
- **Reset tracking :** Possibilité de remettre les compteurs à zéro.

### 4.10. Intégration Écosystème
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
9. ~~Trading Room immersive (3 sub-rooms, agents dédiés, UI trading mock, props 3D).~~

### 4.11. Trading Room (Projet Trading)
Le projet "Trading" (project-2) dispose d'un layout immersif spécialisé, distinct du layout standard 9 rooms.

#### Architecture
- **Layout dédié :** `layoutType: "trading"` sur le projet, avec 3 sub-rooms spécialisées en ligne horizontale (1×3) au lieu de la grille 3×3 standard.
- **Rooms élargies :** Footprint 14×10 (`TRADING_ROOM_SIZE`) contre 10×8 pour les rooms standard, avec spacing de 17 entre centres.
- **Alignement :** Les rooms Trading sont alignées horizontalement avec les rooms SAAS (même bord supérieur), à droite du projet SAAS avec un gap visuel identique au gap vertical entre projets.

#### 3 Sub-rooms
| Room | ID | Couleur | Glyphe | Prop 3D |
|------|----|---------|--------|---------|
| The Oracle | `room-oracle` | Cyan (#00ffcc) | EYE | Hologramme diamant rotatif semi-transparent |
| The Strategy Forge | `room-forge` | Amber (#f59e0b) | FORGE | Enclume lumineuse avec marteau |
| The Safe | `room-safe` | Rouge (#ff003c) | SAFE | Porte de coffre-fort cylindrique |

#### 3 Agents Trading (Naruto)
| Agent | Rôle | Description |
|-------|------|-------------|
| Madara | Market Surveillance (`role-market-watcher`) | Surveille les flux marché en temps réel |
| Itachi | Risk Analysis (`role-risk-analyst`) | Évalue le ratio risque/rendement |
| Sasuke | Order Execution (`role-executor`) | Exécute les ordres validés |

#### UI Trading
- **Onglet Trading :** Nouvel onglet dans la sidebar (icône TrendingUp) avec panneau dédié (`w-80`).
- **System Health :** Statut API Binance (connected/degraded/disconnected), latence ms, nombre de stratégies actives, Kill Switch (toggle rouge pulsant).
- **Live Ticker :** 5 paires (BTC, ETH, SOL, BNB, XRP/USDT) avec prix, variation % colorée (vert/rouge), animation sur changement.
- **Decision Card :** Carte amber affichant les opportunités détectées (paire, type LONG/SHORT, entry/target/stop loss, R/R, confidence %) avec boutons Validate (cyan) / Reject (rouge). Overlay en haut à droite de l'écran.
- **Kill Switch :** Persisted dans le store, coupe les mises à jour de prix et la génération d'opportunités quand actif.

#### Données actuelles (Mock)
- Prix : random walk toutes les 2.5s avec volatilité simulée.
- Opportunités : générées aléatoirement (~8% de chance par tick).
- System Health : latence jitter (30-70ms), statut Binance fixe "connected".

#### Reste à finaliser (Trading)
1. **Connexion Binance WebSocket :** Remplacer le mock `setInterval` par un vrai flux WebSocket Binance pour les prix temps réel.
2. **Stratégies de trading réelles :** Implémenter les algorithmes de détection d'opportunités (remplacer la génération aléatoire).
3. **Exécution d'ordres :** Connecter le bouton Validate à l'API Binance pour passer de vrais ordres.
4. **Historique des trades :** Ajouter un journal des opportunités validées/rejetées avec P&L.
5. **Alertes Telegram :** Notifications push quand une opportunité est détectée ou qu'un ordre est exécuté.
6. **Agent autonomie :** Permettre aux agents Madara/Itachi/Sasuke d'analyser et exécuter via LLM avec validation AURIA.
7. **Graphiques candlestick :** Ajouter des mini-charts dans le Live Ticker ou sur le prop 3D Oracle.
8. **Portfolio tracker :** Affichage du portefeuille global (positions ouvertes, P&L réalisé/non réalisé).
9. **Risk management avancé :** Limites de drawdown, sizing automatique, corrélation inter-paires.

## 8. Roadmap Phase 3 (Prochaine)
1. Exécution réelle des tâches par les agents via LLM.
2. Validation AURIA avec feedback loop sur le leveling.
3. Linear / Notion / GitHub sync temps réel.
4. Persistance serveur (Supabase) en remplacement du localStorage.
5. Mode mobile (Telegram bridge).
6. Trading Room : connexion Binance WebSocket, stratégies réelles, exécution d'ordres, historique trades.
