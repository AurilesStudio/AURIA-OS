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
  - **Naruto (3) :** Sasuke, Itachi, Madara — tous avec modèles 3D. (Naruto, Kakashi, Sakura, Gaara, Shikamaru, Jiraiya, Tsunade à ajouter quand les GLB seront prêts.)
  - **One Piece (10) :** Luffy, Zoro, Sanji, Nami, Robin, Chopper, Franky, Brook, Usopp, Jinbei — tous avec modèles 3D.
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
- **World Environment :** Fond sombre (#0a0515), étoiles cosmiques (Stars drei), fog exponentiel estompant les zones lointaines, bordures fines par zone de projet.
- **Arena :** Salle dédiée avec décor GLB (`Arena.glb`), layout `arena` (20×20).

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
10. ~~Arena (layout 20×20, décor GLB, agents Dragon Ball).~~
11. ~~World Environment (étoiles, fog, bordures de zone).~~
12. ~~Catalogue complet One Piece (10 personnages avec GLB) + Brook & Jinbei.~~

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

### 4.12. Gestion de projets (Github, Notion, Linear)
Le projet "Gestion de projets" (project-4) utilise un layout identique au Trading : 3 sub-rooms élargies en ligne horizontale (1×3), positionné en grille 2×2 (col=1, row=1).

#### Architecture
- **Layout dédié :** `layoutType: "project-management"` sur le projet, réutilisant `TRADING_ROOM_SIZE` (14×10) et `TRADING_ROOM_SPACING_X` (17).
- **Position grille :** À côté de Prospectauri (col droite), sous Trading (row bas).

#### 3 Sub-rooms
| Room | ID | Couleur | Glyphe | Prop 3D |
|------|----|---------|--------|---------|
| Github | `room-github` | Bleu (#58a6ff) | GIT | Structure de branches — sphère centrale + 3 branches |
| Notion | `room-notion` | Gris clair (#e0e0e0) | WIKI | Pile de 3 pages flottantes empilées |
| Linear | `room-linear` | Indigo (#818cf8) | TASKS | 3 colonnes Kanban de cubes empilés (3-2-1) |

### 4.13. Persistance & Stockage
- **Architecture hybride :** `localStorage` (cache instantané) + **Supabase Cloud** (PostgreSQL) pour la persistance durable et le multi-device.
- **Store Zustand + persist :** L'état applicatif est sérialisé en `localStorage` via `zustand/middleware/persist` (clé `"auria-store"`) pour une hydration instantanée au chargement.
- **Supabase Cloud :** Les données sont synchronisées vers PostgreSQL via le SDK `@supabase/supabase-js`. 8 tables : `projects`, `rooms`, `roles`, `avatars`, `token_gauges`, `team_templates`, `appearances`, `user_settings`.
- **Séquence de chargement :** localStorage hydrate instantanément → Supabase overlay ensuite (~sub-seconde). Au premier lancement (tables vides), les défauts sont seedés automatiquement.
- **Sync bidirectionnelle :** Chaque mutation Zustand est détectée via `subscribe()` et upsertée en Supabase avec debounce à 2 niveaux : 2s pour les positions (drag), 500ms pour le reste. `beforeunload` flush les écritures pendantes.
- **Graceful degradation :** Sans les variables `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, l'app fonctionne en localStorage-only (zéro régression).
- **Tous les avatars persistés :** AURIA, Github, Notion, Linear et tous les autres avatars sont persistés en DB. Leurs customisations (system prompt, level, provider, position) sont conservées. Ils ne sont injectés comme défauts que lors du premier lancement si absents de la DB.
- **Champs runtime exclus :** `status`, `currentAction`, `history` ne sont pas persistés (état éphémère).
- **Positions sauvegardées :** Les positions des rooms et avatars (déplacés via drag en Edit Mode) sont conservées au refresh, en localStorage et en Supabase.
- **Merge intelligent :** Au chargement, les données sauvées sont fusionnées avec les défauts courants — les nouvelles rooms/rôles/projets par défaut sont ajoutés sans écraser les données existantes.
- **IndexedDB :** Utilisé pour stocker les fichiers GLB locaux (avatars 3D générés). Hydratation automatique au démarrage (`hydrateLocalGlbs`).

### 4.14. Edit Mode & Grid System
Le mode édition permet de réorganiser spatialement les rooms et projets sur la scène 3D avec un système de grille configurable par projet.

#### Activation
- **Toggle :** Settings → Scene → Edit Mode (amber indicator) ou via la floating toolbar "Done" pour quitter.
- **Effet :** Active le drag des rooms individuelles et des projets entiers. Les bordures de rooms deviennent plus visibles (opacité augmentée).

#### Grille & Snap
- **Snap automatique :** En edit mode, toutes les positions se calent sur la grille. Pas de toggle séparé — le snap est intrinsèque à l'édition.
- **Grid Overlay :** Grille visuelle Three.js (gridHelper) toggleable, s'adapte dynamiquement au `gridCellSize` du projet actif.
- **Configuration par projet :** Chaque projet stocke ses propres paramètres de grille (`gridCellSize`, `gridColumns`, `gridRows`), indépendants des autres projets.

#### Floating Toolbar (bottom-center)
Apparaît quand edit mode est actif, avec les contrôles :
- **Edit indicator :** Pastille amber pulsante + label "EDIT".
- **Grid toggle :** Afficher/masquer l'overlay grille (purple highlight).
- **Snap (cell size) :** Stepper +/- 0.5 (range 0.5–10) — taille des cellules du projet actif.
- **W (colonnes) :** Stepper +/- 1 — nombre de cellules en largeur du cadre projet.
- **H (rangées) :** Stepper +/- 1 — nombre de cellules en hauteur du cadre projet.
- **Done :** Quitte le mode édition.

#### Project Frame
- **Bounds snappés :** En edit mode, les limites du cadre projet sont alignées sur les lignes de la grille.
- **Taille explicite :** Quand `gridColumns`/`gridRows` sont définis, le cadre s'étend depuis son coin supérieur-gauche (ancre fixe). Chaque +1 = exactement 1 cellule supplémentaire.
- **Minimum garanti :** La taille ne peut pas descendre en-dessous de l'espace nécessaire pour contenir toutes les rooms + padding.

#### Drag
- **Room drag :** Déplacement individuel avec snap au `gridCellSize` du projet parent. Les avatars de la room suivent.
- **Project drag :** Via la barre de label du cadre projet. Déplace toutes les rooms et avatars du projet simultanément avec snap cohérent.
- **Cell size locké au drag :** Le `gridCellSize` est capturé au `pointerDown` et reste constant pendant tout le drag (pas de changement mid-drag).

#### Persistance
- **localStorage + Supabase :** `gridCellSize`, `gridColumns`, `gridRows` sont persistés dans l'objet `Project` (table `projects` : `grid_cell_size`, `grid_columns`, `grid_rows`).
- **Grid overlay & edit mode :** Persistés dans `user_settings`.

### 4.15. Mission Control — Modules de gestion
Le Mission Control est un ensemble de modules intégrés dans AURIA-OS pour piloter, monitorer et collaborer avec AURIA et ses sous-agents. Basé sur le PRD Notion "AURIA Mission Control", adapté à la stack existante (Vite + React + Supabase au lieu de NextJS + Convex).

#### Modules prévus
| Module | Description | Priorité |
|--------|-------------|----------|
| **Tasks Board** | Kanban partagé Auriles/AURIA, sync Linear, drag & drop | Haute |
| **Calendar** | Calendrier des tâches planifiées, cron jobs, rappels | Haute |
| **Content Pipeline** | Pipeline création de contenu RS (Idée → Publié) | Haute |
| **Memory** | Visualisation navigable des mémoires d'AURIA | Moyenne |
| **Team** | Organigramme, fiches agents, métriques de performance | Moyenne |
| **Monitoring** | Dashboard santé système, métriques API, logs temps réel | ✅ Fait |
| **Office** | Scène 3D existante (déjà implémentée) | ✅ Fait |

#### Phase 0 — Setup
- ~~Init projet~~ ✅ Projet Vite + React + Supabase existant (AURI-39)
- ~~Schema Supabase pour les nouveaux modules~~ ✅ 5 tables MC créées avec types TS, row converters, sync engine, et store Zustand (AURI-40)
  - `mc_tasks` : Kanban tasks avec status/priority/assignee/labels
  - `mc_calendar_events` : Events avec type/dates/status/executionResult
  - `mc_content_pipeline` : Pipeline contenu avec stage/platform/script/mediaUrls
  - `mc_memories` : Base de connaissances avec category/source + index full-text (french)
  - `mc_team_agents` : Agents MC avec role/responsibilities/taskHistory
- Authentification token gateway (AURI-41)

#### Phase 1 — Tasks Board (AURI-43 → AURI-48) ✅ Complete
- ~~Modèle de données MCTask~~ ✅ Déjà implémenté dans Phase 0 : type `MCTask` + CRUD store + sync Supabase `mc_tasks` (AURI-43)
- ~~Vue Kanban avec drag & drop~~ ✅ Board 5 colonnes (Backlog, To Do, In Progress, Done, Cancelled) avec `@hello-pangea/dnd`, TaskCard draggable, KanbanColumn droppable (AURI-44)
  - **KanbanBoard :** DragDropContext + 5 colonnes + handleDragEnd → updateMCTask(status)
  - **KanbanColumn :** Header (dot couleur + label + badge compteur) + liste de TaskCards
  - **TaskCard :** Carte overlay-glass draggable (titre line-clamp-2, dot priorité, assignee, labels chips)
- ~~Modal création/édition tâche~~ ✅ TaskModal AnimatePresence, mode create/edit, champs titre/description/status/priority/assignee/labels, suppression avec confirmation inline (AURI-45)
  - **TaskBoardHeader :** Barre compteur total + bouton "+ New Task" (mc-accent)
  - **MCTasksModule :** Remplacé placeholder par TaskBoardHeader + KanbanBoard
- ~~Filtres et recherche~~ ✅ TaskFilters avec recherche full-text (titre/description/labels), filtres combinables par priorité/assignee/label, bouton reset, compteur de résultats (AURI-46)
- ~~Import Linear (read-only)~~ ✅ Service `linearClient.ts` (GraphQL, mapping statuts/priorités), LinearImportModal avec sélection d'équipe, liste checkable, détection de doublons, import en batch (AURI-47)
  - Bouton "Import Linear" dans TaskBoardHeader (visible si `VITE_LINEAR_API_KEY` configuré)
- ~~API actions pour AURIA~~ ✅ Service `taskActions.ts` avec `createTaskAPI()` : CRUD validé (createTask, updateTask, moveTask, deleteTask, assignTask), queries (listTasks, getTask), validation des statuts/priorités (AURI-48)

- ~~Layout principal + Navigation entre modules~~ ✅ MCSidebar + MCHeader + MCLayout + 5 placeholders modules (AURI-42)
  - **MCSidebar :** Navigation principale (bord gauche, z-10), 6 modules (Office, Tasks, Content, Calendar, Memory, Team), collapsible 56px/200px, icônes Lucide, indicateur actif cyan, statut AURIA (online/offline)
  - **MCHeader :** Header 48px avec titre du module actif + badge statut AURIA + nom utilisateur
  - **MCLayout :** Shell layout intégrant sidebar + header + contenu module
  - **MCModuleContent :** Router AnimatePresence entre modules, return null pour Office
  - **Placeholders :** Chaque module non-Office affiche un empty-state centré (icône, titre, compteur d'items du store)
  - **Office mode :** Scène 3D + DashboardOverlay existant (décalé à droite par la sidebar)
  - **Autres modules :** Panneau pleine largeur par-dessus la scène avec overlay dim (bg-base/70)
  - **CSS :** Variable `--color-mc-accent: #00ffff`, utilitaire `.glow-mc`

#### Phase 2 — Calendar Module (AURI-49 → AURI-53) ✅ Complete
- ~~Modèle de données MCCalendarEvent~~ ✅ Déjà implémenté dans Phase 0 : type `MCCalendarEvent` + CRUD store + sync Supabase `mc_calendar_events` (AURI-49)
- ~~Vue mois avec grille et dots~~ ✅ MonthView grille CSS 7×6, dots colorés par type (task=cyan, meeting=indigo, deployment=amber, reminder=amber, milestone=emerald), max 3 visibles + overflow "+N", clic cellule → création, clic événement → édition (AURI-50)
- ~~Vue semaine avec timeline~~ ✅ WeekView 7 colonnes jour, timeline 0h-23h avec blocs positionnés en absolu, bord gauche coloré par type, clic bloc → édition, clic zone vide → création (AURI-50)
- ~~CalendarHeader~~ ✅ Navigation chevrons < > mois/semaine, toggle Month/Week (bg-white/10 actif), compteur événements, bouton "+ New Event" (mc-accent) (AURI-50)
- ~~Modal création/édition événement~~ ✅ EventModal AnimatePresence, champs titre/type/start-end datetime-local/status/executionResult, suppression avec confirmation inline (AURI-51)
- ~~Badges de statut d'exécution~~ ✅ EventBadge compact (dot type + titre tronqué + dot statut : vert completed, rouge cancelled, gris scheduled, amber in_progress) (AURI-52)
- ~~API actions pour AURIA~~ ✅ Service `calendarActions.ts` avec `createCalendarAPI()` : CRUD validé (createEvent, updateEvent, markExecuted, deleteEvent), queries (listEvents, getUpcoming, getEvent), validation types/statuts (AURI-53)

#### Phase 3 — Content Pipeline (AURI-54 → AURI-59) ✅ Complete
- ~~Modèle de données MCContentItem~~ ✅ Déjà implémenté dans Phase 0 : type `MCContentItem` + CRUD store + sync Supabase `mc_content_pipeline` (AURI-54)
- ~~Vue pipeline Kanban~~ ✅ ContentBoard 5 colonnes (Idea, Draft, Review, Scheduled, Published) avec `@hello-pangea/dnd`, ContentCard draggable, ContentColumn droppable, badge plateforme coloré (AURI-55)
  - **ContentBoard :** DragDropContext + 5 colonnes + handleDragEnd → updateMCContentItem(stage)
  - **ContentColumn :** Header (dot couleur + label + badge compteur) + liste de ContentCards
  - **ContentCard :** Carte overlay-glass draggable (titre, script preview, badge plateforme, date planifiée)
  - **ContentBoardHeader :** Compteur total + filtre par plateforme (pills All/X/Instagram/LinkedIn/TikTok/YouTube/Blog) + bouton "+ New Content" (mc-accent)
- ~~Éditeur de contenu intégré~~ ✅ ContentModal AnimatePresence, champs titre/stage/plateforme/script (textarea mono avec compteur caractères par plateforme : X=280, Instagram=2200, LinkedIn=3000, etc.)/date planifiée, suppression avec confirmation inline (AURI-56)
- ~~API actions pour AURIA~~ ✅ Service `contentActions.ts` avec `createContentAPI()` : CRUD validé (createContent, updateContent, moveStage, deleteContent), queries (listContent, getScheduled, getContent), validation des stages (AURI-59)

#### Phase 4 — Memory Module (AURI-60 → AURI-64) ✅ Complete
- ~~Modèle de données MCMemory~~ ✅ Déjà implémenté dans Phase 0 : type `MCMemory` + CRUD store + sync Supabase `mc_memories` (AURI-60)
- ~~Interface liste + documents formatés~~ ✅ MemoryList scrollable avec MemoryCard (badge catégorie coloré, titre, content preview line-clamp-2, source, date), tri newest-first (AURI-61)
- ~~Recherche globale full-text~~ ✅ MemoryHeader avec barre de recherche temps réel (titre + content + source), filtres par catégorie (pills All/Decision/Learning/Context/Reference), compteur résultats, bouton "+ New Memory" (AURI-62)
- ~~Modal création/édition~~ ✅ MemoryModal AnimatePresence, champs titre/catégorie/source/content (textarea mono 10 lignes), suppression avec confirmation inline
- ~~API actions pour AURIA~~ ✅ Service `memoryActions.ts` avec `createMemoryAPI()` : CRUD validé (createMemory, updateMemory, deleteMemory), queries (listMemories, searchMemories, getRecent, getMemory), validation catégories (AURI-64)

#### Phase 5 — Team Module (AURI-65 → AURI-68) ✅ Complete
- ~~Modèle de données MCTeamAgent~~ ✅ Déjà implémenté dans Phase 0 : type `MCTeamAgent` + CRUD store + sync Supabase `mc_team_agents` (AURI-65)
- ~~Organigramme visuel~~ ✅ TeamGrid responsive (1/2/3 colonnes), AgentCard overlay-glass avec avatar (image ou Bot icon), nom, rôle, status indicator (active=vert, idle=amber, offline=gris), responsibilities preview, task count (AURI-66)
- ~~Création et gestion de sous-agents~~ ✅ AgentModal AnimatePresence, champs name/role/status/responsibilities/avatarUrl, suppression avec confirmation inline (AURI-68)
  - **TeamHeader :** Compteur + barre de recherche (name+role+responsibilities) + filtres statut (pills All/Active/Idle/Offline) + bouton "+ New Agent" (mc-accent)
- ~~API actions pour AURIA~~ ✅ Service `teamActions.ts` avec `createTeamAPI()` : CRUD validé (createAgent, updateAgent, setStatus, logTask, deleteAgent), queries (listAgents, getActiveAgents, getAgent), validation statuts

#### Phase 6 — Office v2: Multi-agent workspace + Three.js (AURI-69 → AURI-70) ✅ Complete
- ~~Three.js 3D avatars~~ ✅ GLB loading via useGLTF, AnimationMixer avec FBX retargeting (idle/walking/running), scène isométrique, éclairage, orbit controls, responsive (AURI-70)
- ~~Status bubble~~ ✅ StatusBubble (drei Html) au-dessus de chaque agent : dot animé (working=vert pulse, idle=amber, success=vert, error=rouge) + texte tâche en cours tronqué, glass overlay bg-black/60, pointer-events-none, masqué en FPV (AURI-69)
- ~~Workstations 3D~~ ✅ Desk (box geometry) + monitor (emissive color agent, intensité 0.15→0.4 quand working) + stand, 6 positions par room en arc, AURIA exclue (superviseur cross-room) (AURI-69)
- ~~Comportement lié au statut~~ ✅ working=immobile au bureau (Happy Idle), idle=patrouille (Walking), success/error=sur place (Happy Idle), patrol guard empêche mouvement pendant working/success/error (AURI-69)

#### Transversal — API Bridge + Deployment Config (AURI-73, AURI-71) ✅ Complete
- ~~API Bridge (serveur Hono)~~ ✅ Serveur Hono sur port 3001 avec 5 routes CRUD (`/api/mc/tasks`, `/api/mc/calendar`, `/api/mc/content`, `/api/mc/memories`, `/api/mc/team`) + health check, auth Bearer token (`GATEWAY_TOKEN`), rate limiting (100 req/min/IP), audit logger (AURI-73)
  - **Stack :** Hono 4.12 + @hono/node-server + tsx
  - **Middleware :** auth.ts (401/403, health exempt), rateLimit.ts (in-memory, X-RateLimit-* headers), logger.ts (structured console)
  - **Routes :** REST CRUD standard (GET list, GET :id, POST, PATCH :id, DELETE :id) pour chaque module, validation des champs requis et enums
  - **Supabase :** Client server-side avec service role key (`server/lib/supabase.ts`)
  - **Config :** `server/tsconfig.json` (ES2022, Node target)
  - **Scripts :** `npm run server:dev` (tsx watch), `npm run server:start` (tsx)
- ~~Deployment config~~ ✅ PM2 (`ecosystem.config.cjs`), Nginx reverse proxy (`deploy/nginx.conf` : SPA + /api/* proxy), GitHub Actions CI (`.github/workflows/ci.yml` : lint + tsc frontend + tsc server) (AURI-71)
  - **Pas de déploiement réel** — configs prêtes pour VPS futur

#### Transversal — Monitoring Dashboard (AURI-72) ✅ Complete
- ~~Dashboard de santé système~~ ✅ 7e module Mission Control read-only avec polling 10s, state local React (pas de Zustand — données éphémères) (AURI-72)
  - **Server — MetricsCollector** (`server/lib/metrics.ts`) : classe singleton, ring buffer 50 logs, compteurs requêtes/erreurs 4xx/5xx/429, avg response time (max 1000 durations), reset pour tests
  - **Server — Route monitoring** (`server/routes/monitoring.ts`) : `GET /api/monitoring` → system info (uptime, heap memory, node version, platform) + services status (AURIA API + Supabase ping `mc_tasks` avec latence) + metrics snapshot + logs
  - **Server — Logger branché** : `metrics.record()` dans `server/middleware/logger.ts` — chaque requête est trackée automatiquement
  - **MCMonitoringModule** : fetch `${VITE_API_URL}/api/monitoring` avec Bearer token, polling 10s, toggle auto-refresh, states loading/error/data
  - **MonitoringHeader** : titre + auto-refresh ON/OFF + bouton refresh animé + timestamp dernière MAJ
  - **SystemHealth** : uptime formaté (Xd Xh Xm Xs), heap memory (barre % cyan), Node version, platform
  - **ServiceStatus** : cartes AURIA API + Supabase avec dot vert/rouge glow + latence ms + message erreur
  - **RequestMetrics** : 4 stat cards overlay-glass (total requests, error rate %, avg response time, rate limit hits)
  - **LogViewer** : terminal-style scrollable (font-mono, 11px), 50 entries max, status color-coded (2xx=emerald, 4xx=amber, 5xx=red), auto-scroll
  - **Intégration** : sidebar (icône Activity), MCModuleContent, MCHeader (MODULE_TITLES), `.env.example` (VITE_GATEWAY_TOKEN)
  - **Tests** : 10 tests MetricsCollector (counters, ring buffer, avg, reset) + 7 tests route monitoring (system, services, Supabase error, metrics, logs)
- **Résultat :** 10 fichiers créés, 7 fichiers modifiés, 17 nouveaux tests, 150 tests total tous verts

#### Transversal — Tests unitaires et d'intégration (AURI-75) ✅ Complete
- ~~Infrastructure Vitest~~ ✅ Setup Vitest (devDep) + `vitest.config.ts` (globals, node env, alias `@`) + scripts `npm test` / `npm run test:coverage` (AURI-75)
- ~~Tests middleware serveur~~ ✅ 8 tests — auth (401 sans header, 403 token invalide, 500 GATEWAY_TOKEN absent, skip health, pass valide) + rate limit (X-RateLimit-* headers, 429 après dépassement, décrémentation remaining) (AURI-75)
- ~~Tests routes serveur~~ ✅ 36 tests — Health + 5 modules CRUD (tasks, calendar, content, memories, team) : validation inputs requis, enums, codes HTTP (400/201/200), Supabase mocké (chainable) (AURI-75)
- ~~Tests agent action APIs~~ ✅ 89 tests — 5 fichiers de fonctions pures avec store Zustand mocké (vi.fn()) (AURI-75)
  - `taskActions` (22 tests) : createTask, updateTask, moveTask, deleteTask, listTasks, getTask, assignTask
  - `calendarActions` (17 tests) : createEvent, updateEvent, markExecuted, deleteEvent, listEvents, getUpcoming
  - `contentActions` (15 tests) : createContent, updateContent, moveStage, deleteContent, listContent, getScheduled
  - `memoryActions` (17 tests) : createMemory, updateMemory, deleteMemory, listMemories, searchMemories, getRecent
  - `teamActions` (18 tests) : createAgent, updateAgent, setStatus, logTask, deleteAgent, listAgents, getActiveAgents
- ~~CI intégration~~ ✅ Step `npm test` ajouté dans `.github/workflows/ci.yml` après les type checks (AURI-75)
- **Résultat :** 9 fichiers de test, 150 tests, tous verts

## 8. Roadmap — Prochaines étapes
1. Exécution réelle des tâches par les agents via LLM.
2. Validation AURIA avec feedback loop sur le leveling.
3. Linear / Notion / GitHub sync temps réel.
4. ~~Persistance serveur (Supabase) en remplacement du localStorage.~~ ✅ Supabase Cloud intégré (8 tables, sync bidirectionnelle, graceful degradation).
5. Mode mobile (Telegram bridge).
6. Trading Room : connexion Binance WebSocket, stratégies réelles, exécution d'ordres, historique trades.
7. ~~Mission Control : Tasks Board, Calendar, Content Pipeline, Memory, Team~~ ✅ — Tous les 5 modules implémentés.
8. ~~API Bridge Hono + Deployment Config~~ ✅ — Serveur API sur port 3001, PM2/Nginx/CI configs.
9. ~~Tests unitaires et d'intégration~~ ✅ — Vitest, 133 tests (middleware + routes + 5 action APIs), CI intégré.
10. ~~Monitoring Dashboard~~ ✅ — 7e module MC, MetricsCollector + route monitoring + 5 sous-composants, 150 tests total.
