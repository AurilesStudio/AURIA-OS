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

### 4.3. Intégration Écosystème
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
