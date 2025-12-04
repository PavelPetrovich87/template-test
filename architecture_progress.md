# Architecture Progress: Neural Breach

**Status:** Phase 5 - C4 Document Complete  
**Last Updated:** 2025-12-02  
**C4 Target:** Complete C4 Document for Development  

---

## 1. Project Context (From GDD)

### What is Neural Breach?
A cognitive training app wrapping the Dual N-Back working memory exercise in a cyberpunk "hacking" narrative. Users complete training sessions ("Breach Attempts") to earn Data Shards, unlock upgrades, and track their cognitive progress.

### Core Requirements (Confirmed)
- **Platform:** Mobile-first (React Native + Expo Router), offline-capable
- **Genre:** Educational Cognitive Training + Idle RPG mechanics
- **Target Audience:** Cognitive training enthusiasts, productivity users, competitive learners

### Key Features (MVP)
- [ ] Dual N-Back training engine (visual grid + audio letters)
- [ ] Connection Stability mechanic (health bar)
- [ ] Data Shards economy (earn/spend currency)
- [ ] Hardware Upgrades shop (9 upgrades across 3 tiers)
- [ ] Cosmetic Themes (5 terminal themes)
- [ ] Session history & analytics
- [ ] Leaderboards (mocked for MVP, real social later)

---

## 2. Resolved Questions

### 2.1 Actors & Roles
- [x] **Q1:** Mock social features (leaderboards) for MVP, real social later ✓
- [x] **Q2:** No admin/researcher dashboard ✓

### 2.2 External Systems
- [x] **Q3:** Supabase Auth (JWT-based, validates on custom backend) ✓
- [x] **Q4:** In-app only (no external research API) ✓
- [x] **Q5:** No ads for MVP ✓

### 2.3 Deployment & Offline
- [x] **Q6:** Mobile-first (React Native + Expo Router) ✓
- [x] **Q7:** Offline-first with sync ✓

### 2.4 Tech Stack
- [x] **Q8:** React Native (with Expo Router) ✓
- [x] **Q9:** Custom Node.js backend (Express) ✓
- [x] **Q10:** Database: Supabase PostgreSQL ✓
- [x] **Q11:** Offline Storage: expo-sqlite ✓
- [x] **Q12:** State Management: Zustand ✓

---

## 3. C4 Model

### Level 1: System Context Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM CONTEXT                                    │
│                           Neural Breach                                     │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │   Player    │
                              │   (Actor)   │
                              └──────┬──────┘
                                     │
                                     │ Uses mobile app to:
                                     │ • Train working memory
                                     │ • Earn Data Shards
                                     │ • Buy upgrades/themes
                                     │ • View progress stats
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         ┌───────────────────────┐                           │
│                         │                       │                           │
│                         │    NEURAL BREACH      │                           │
│                         │    (Software System)  │                           │
│                         │                       │                           │
│                         │  Cognitive training   │                           │
│                         │  app with dual n-back │                           │
│                         │  exercises, progress  │                           │
│                         │  tracking, and RPG    │                           │
│                         │  progression system   │                           │
│                         │                       │                           │
│                         └───────────┬───────────┘                           │
│                                     │                                       │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
          ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
          │   Supabase      │ │   Push      │ │   App Store /   │
          │   Auth          │ │   Service   │ │   Play Store    │
          │   (External)    │ │   (Future)  │ │   (External)    │
          └─────────────────┘ └─────────────┘ └─────────────────┘
```

---

### Level 2: Container Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CONTAINER DIAGRAM                                 │
│                           Neural Breach                                     │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │   Player    │
                              │   (Actor)   │
                              └──────┬──────┘
                                     │
                                     │ Installs and uses
                                     ▼
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│                         NEURAL BREACH SYSTEM                                │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      MOBILE APP CONTAINER                           │   │
│  │                   [React Native + Expo Router]                      │   │
│  │                                                                     │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐   │   │
│  │  │  Game Engine  │  │   UI Layer    │  │   Offline Sync        │   │   │
│  │  │               │  │               │  │      Service          │   │   │
│  │  │ • N-Back Core │  │ • Screens     │  │                       │   │   │
│  │  │ • Stimulus    │  │ • Components  │  │ • Queue local changes │   │   │
│  │  │ • Scoring     │  │ • Themes      │  │ • Sync when online    │   │   │
│  │  │ • Adaptation  │  │ • Navigation  │  │ • Conflict resolution │   │   │
│  │  └───────┬───────┘  └───────────────┘  └───────────┬───────────┘   │   │
│  │          │                                         │               │   │
│  │          │ Reads/Writes                            │ Syncs         │   │
│  │          ▼                                         │               │   │
│  │  ┌───────────────────────────┐                     │               │   │
│  │  │    LOCAL DATABASE         │                     │               │   │
│  │  │    [expo-sqlite]          │                     │               │   │
│  │  │                           │                     │               │   │
│  │  │ • Sessions & Trials       │                     │               │   │
│  │  │ • User Progress           │                     │               │   │
│  │  │ • Owned Upgrades/Themes   │                     │               │   │
│  │  │ • Pending Sync Queue      │                     │               │   │
│  │  └───────────────────────────┘                     │               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                       │                     │
│                                                       │ HTTPS/JSON          │
│                                                       │ (when online)       │
│                                                       ▼                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      BACKEND API CONTAINER                          │   │
│  │                      [Node.js + Express]                            │   │
│  │                                                                     │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐   │   │
│  │  │  Auth         │  │   Sync API    │  │   Leaderboard API     │   │   │
│  │  │  Middleware   │  │               │  │   (Mock for MVP)      │   │   │
│  │  │               │  │ • POST /sync  │  │                       │   │   │
│  │  │ • Validate    │  │ • Batch write │  │ • GET /leaderboard    │   │   │
│  │  │   Supabase    │  │ • Conflict    │  │ • Returns static data │   │   │
│  │  │   JWT tokens  │  │   resolution  │  │   for MVP             │   │   │
│  │  └───────────────┘  └───────┬───────┘  └───────────────────────┘   │   │
│  │                             │                                       │   │
│  └─────────────────────────────┼───────────────────────────────────────┘   │
│                                │                                           │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┼ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
                                 │
                                 │ SQL Queries
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SUPABASE PLATFORM (External)                           │
│                                                                             │
│  ┌───────────────────────────┐      ┌───────────────────────────────────┐  │
│  │     SUPABASE AUTH         │      │     SUPABASE POSTGRESQL           │  │
│  │                           │      │     [Database Container]          │  │
│  │ • User registration       │      │                                   │  │
│  │ • Login / Logout          │      │ • users (profile data)            │  │
│  │ • JWT token issuance      │      │ • sessions (training history)     │  │
│  │ • Password reset          │      │ • trials (per-trial data)         │  │
│  │                           │      │ • upgrades (owned items)          │  │
│  │                           │      │ • themes (owned cosmetics)        │  │
│  └───────────────────────────┘      └───────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Container Descriptions

| Container | Technology | Responsibility |
|-----------|------------|----------------|
| **Mobile App** | React Native + Expo Router | User interface, game logic, offline-first data storage, sync orchestration |
| **Local Database** | expo-sqlite | Stores all game data locally. Source of truth when offline. |
| **Backend API** | Node.js + Express | Validates JWT tokens, receives sync payloads, writes to PostgreSQL |
| **Supabase Auth** | Managed Service | Handles user identity, issues JWT tokens |
| **Supabase PostgreSQL** | Managed Database | Persistent cloud storage, source of truth when online |

---

### Data Flow: Offline-First Sync Pattern

```
1. USER PLAYS OFFLINE
   ┌──────────────┐
   │ Mobile App   │──writes──►│ expo-sqlite │
   └──────────────┘           │ (local DB)  │
                              └─────────────┘

2. USER COMES ONLINE
   ┌──────────────┐           ┌─────────────┐           ┌─────────────┐
   │ Sync Service │──reads───►│ Pending     │──POST────►│ Backend API │
   │              │           │ Sync Queue  │  /sync    │             │
   └──────────────┘           └─────────────┘           └──────┬──────┘
                                                               │
                                                               ▼
                                                       ┌─────────────┐
                                                       │ Supabase    │
                                                       │ PostgreSQL  │
                                                       └─────────────┘

3. CONFLICT RESOLUTION
   Strategy: "Last Write Wins" with timestamp comparison
   - Each record has `updated_at` timestamp
   - Server compares client timestamp vs server timestamp
   - Most recent wins
```

---

### Key Interactions

| From | To | Protocol | Purpose |
|------|-----|----------|---------|
| Mobile App | Local DB | SQLite | Store sessions, progress, offline data |
| Mobile App | Backend API | HTTPS/JSON | Sync data when online |
| Backend API | Supabase Auth | JWT Validation | Verify user identity |
| Backend API | Supabase PostgreSQL | SQL | Persist user data |
| Mobile App | Supabase Auth | HTTPS | Login, register, get JWT |

---

### Level 3: Component Diagrams

#### 3.1 Mobile App Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    MOBILE APP COMPONENT DIAGRAM                                 │
│                    [React Native + Expo Router + Zustand]                       │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              UI LAYER                                           │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         SCREENS (Expo Router)                           │   │
│  │                                                                         │   │
│  │  app/                                                                   │   │
│  │  ├── (auth)/                    ├── (main)/                             │   │
│  │  │   ├── login.tsx              │   ├── index.tsx      [Main Menu]      │   │
│  │  │   └── register.tsx           │   ├── game.tsx       [Game Session]   │   │
│  │  │                              │   ├── store.tsx      [Hardware Shop]  │   │
│  │  │                              │   ├── stats.tsx      [Stats/History]  │   │
│  │  │                              │   ├── leaderboard.tsx [Leaderboard]   │   │
│  │  │                              │   └── settings.tsx   [Settings]       │   │
│  │  └── _layout.tsx                                                        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         UI COMPONENTS                                   │   │
│  │                                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │ Grid        │  │ StabilityBar│  │ ShardCounter│  │ MatchButtons│    │   │
│  │  │             │  │             │  │             │  │             │    │   │
│  │  │ 3x3 visual  │  │ Health bar  │  │ Currency    │  │ Audio/Pos   │    │   │
│  │  │ stimulus    │  │ with colors │  │ display     │  │ input btns  │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  │                                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │ UpgradeCard │  │ ThemeCard   │  │ SessionCard │  │ StatGraph   │    │   │
│  │  │             │  │             │  │             │  │             │    │   │
│  │  │ Shop item   │  │ Theme       │  │ History     │  │ Progress    │    │   │
│  │  │ display     │  │ preview     │  │ row item    │  │ chart       │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  │                                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐                                      │   │
│  │  │ Terminal    │  │ BlockEnd    │   + ThemeProvider (wraps app)        │   │
│  │  │ Frame       │  │ Modal       │   + Typography components            │   │
│  │  │             │  │             │   + Common buttons, inputs           │   │
│  │  │ Cyberpunk   │  │ Block       │                                      │   │
│  │  │ border/glow │  │ summary     │                                      │   │
│  │  └─────────────┘  └─────────────┘                                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└───────────────────────────────────┬─────────────────────────────────────────────┘
                                    │ uses
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           STATE LAYER (Zustand)                                 │
│                                                                                 │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────────┐ │
│  │   useGameStore        │  │   useUserStore        │  │  useSettingsStore   │ │
│  │                       │  │                       │  │                     │ │
│  │ Session State:        │  │ Persistent State:     │  │ Preferences:        │ │
│  │ • currentNLevel       │  │ • totalShards         │  │ • audioVolume       │ │
│  │ • currentBlock        │  │ • ownedUpgrades[]     │  │ • currentTheme      │ │
│  │ • stability           │  │ • ownedThemes[]       │  │ • sessionLength     │ │
│  │ • trials[]            │  │ • sessionHistory[]    │  │ • stimulusSpeed     │ │
│  │ • shardsEarned        │  │ • dailyStreak         │  │ • hapticFeedback    │ │
│  │ • streakCorrect       │  │ • lastPlayedDate      │  │                     │ │
│  │ • isPlaying           │  │ • peakNLevel          │  │ Actions:            │ │
│  │ • isPaused            │  │                       │  │ • setTheme()        │ │
│  │                       │  │ Actions:              │  │ • setVolume()       │ │
│  │ Actions:              │  │ • addShards()         │  │ • setSessionLen()   │ │
│  │ • startSession()      │  │ • spendShards()       │  │                     │ │
│  │ • recordTrial()       │  │ • buyUpgrade()        │  │ Persisted to:       │ │
│  │ • endBlock()          │  │ • buyTheme()          │  │ AsyncStorage        │ │
│  │ • applyDamage()       │  │ • saveSession()       │  │                     │ │
│  │ • awardShards()       │  │ • updateStreak()      │  └─────────────────────┘ │
│  │ • adaptDifficulty()   │  │                       │                          │
│  │                       │  │ Persisted to:         │  ┌─────────────────────┐ │
│  │ Transient (in-memory) │  │ expo-sqlite           │  │  useAuthStore       │ │
│  └───────────────────────┘  └───────────────────────┘  │                     │ │
│                                                        │ • user              │ │
│                                                        │ • accessToken       │ │
│                                                        │ • isAuthenticated   │ │
│                                                        │                     │ │
│                                                        │ Actions:            │ │
│                                                        │ • login()           │ │
│                                                        │ • logout()          │ │
│                                                        │ • refreshToken()    │ │
│                                                        └─────────────────────┘ │
└───────────────────────────────────┬─────────────────────────────────────────────┘
                                    │ uses
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           GAME ENGINE LAYER                                     │
│                                                                                 │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────────┐ │
│  │  StimulusGenerator    │  │  DifficultyAdapter    │  │  ScoringEngine      │ │
│  │                       │  │                       │  │                     │ │
│  │ • generateSequence()  │  │ • calculateAccuracy() │  │ • evaluateTrial()   │ │
│  │ • getNextStimulus()   │  │ • shouldLevelUp()     │  │ • calculateShards() │ │
│  │ • isMatchPosition()   │  │ • shouldLevelDown()   │  │ • applyStreakBonus()│ │
│  │ • isMatchAudio()      │  │ • getNextNLevel()     │  │ • applyUpgrades()   │ │
│  │                       │  │                       │  │                     │ │
│  │ Pure functions        │  │ Thresholds:           │  │ Upgrade effects:    │ │
│  │ No side effects       │  │ • ≥80% → level up     │  │ • Overclock CPU     │ │
│  │                       │  │ • ≤60% → level down   │  │ • Dual-Core         │ │
│  └───────────────────────┘  └───────────────────────┘  └─────────────────────┘ │
│                                                                                 │
│  ┌───────────────────────┐  ┌───────────────────────┐                          │
│  │  StabilityManager     │  │  InputHandler         │                          │
│  │                       │  │                       │                          │
│  │ • applyDamage()       │  │ • handleMatchAudio()  │                          │
│  │ • applyRecovery()     │  │ • handleMatchPos()    │                          │
│  │ • isStable()          │  │ • getReactionTime()   │                          │
│  │ • isSafeMode()        │  │ • validateTiming()    │                          │
│  │                       │  │                       │                          │
│  │ Damage values:        │  │ Timing precision:     │                          │
│  │ • False alarm: -15%   │  │ • ±50ms tolerance     │                          │
│  │ • Miss: -10%          │  │ • Uses Date.now()     │                          │
│  │ (Modified by upgrades)│  │                       │                          │
│  └───────────────────────┘  └───────────────────────┘                          │
│                                                                                 │
└───────────────────────────────────┬─────────────────────────────────────────────┘
                                    │ uses
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                         │
│                                                                                 │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────────┐ │
│  │  DatabaseService      │  │  SyncService          │  │  AudioService       │ │
│  │  [expo-sqlite]        │  │                       │  │  [expo-av]          │ │
│  │                       │  │ • queueForSync()      │  │                     │ │
│  │ • initDB()            │  │ • syncPending()       │  │ • playLetter()      │ │
│  │ • saveSession()       │  │ • resolveConflicts()  │  │ • preloadSounds()   │ │
│  │ • getHistory()        │  │ • getNetworkStatus()  │  │ • setVolume()       │ │
│  │ • saveUpgrade()       │  │                       │  │                     │ │
│  │ • getUpgrades()       │  │ Uses:                 │  │ Audio files:        │ │
│  │ • saveTrial()         │  │ • @react-native-      │  │ • A-Z letter sounds │ │
│  │                       │  │   community/netinfo   │  │ • Feedback sounds   │ │
│  │ Tables:               │  │ • ApiService          │  │                     │ │
│  │ • sessions            │  │                       │  └─────────────────────┘ │
│  │ • trials              │  └───────────────────────┘                          │
│  │ • upgrades            │                                                     │
│  │ • themes              │  ┌───────────────────────┐  ┌─────────────────────┐ │
│  │ • sync_queue          │  │  ApiService           │  │  AuthService        │ │
│  └───────────────────────┘  │                       │  │  [@supabase/        │ │
│                             │ • POST /api/sync      │  │   supabase-js]      │ │
│                             │ • GET /api/leaderboard│  │                     │ │
│                             │                       │  │ • signIn()          │ │
│                             │ Base URL config       │  │ • signUp()          │ │
│                             │ JWT token injection   │  │ • signOut()         │ │
│                             │ Error handling        │  │ • getSession()      │ │
│                             │                       │  │ • onAuthChange()    │ │
│                             └───────────────────────┘  └─────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

#### Component Descriptions: Mobile App

| Layer | Component | Responsibility |
|-------|-----------|----------------|
| **UI** | Screens | Expo Router file-based navigation. Each screen composes components and reads from stores. |
| **UI** | Components | Reusable visual elements. Pure presentational where possible. |
| **State** | useGameStore | In-memory session state. Reset each game. Drives game UI. |
| **State** | useUserStore | Persistent user data. Syncs to SQLite. Shards, upgrades, history. |
| **State** | useSettingsStore | User preferences. Persisted to AsyncStorage. |
| **State** | useAuthStore | Auth state from Supabase. JWT token management. |
| **Engine** | StimulusGenerator | Pure functions to create n-back sequences and check matches. |
| **Engine** | DifficultyAdapter | Calculates accuracy, decides when to adjust n-level. |
| **Engine** | ScoringEngine | Evaluates trials, calculates shard rewards with upgrade bonuses. |
| **Engine** | StabilityManager | Tracks connection stability, applies damage/recovery. |
| **Engine** | InputHandler | Captures user input, measures reaction time. |
| **Service** | DatabaseService | SQLite CRUD operations for offline persistence. |
| **Service** | SyncService | Manages offline queue, syncs when network available. |
| **Service** | AudioService | Plays letter sounds using expo-av. |
| **Service** | ApiService | HTTP client for backend communication. |
| **Service** | AuthService | Supabase auth SDK wrapper. |

---

#### Component Dependencies

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Screens   │────►│   Stores    │────►│  Services   │
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │ Game Engine │
                   │ (pure fns)  │
                   └─────────────┘
```

**Data flows down, events flow up:**
- Screens subscribe to Zustand stores
- Stores call Game Engine for calculations
- Stores call Services for persistence/network
- Services are stateless (except caching)

---

#### Zustand Store Interfaces

```typescript
// stores/useGameStore.ts
interface GameState {
  currentNLevel: number
  currentBlock: number
  totalBlocks: number
  stability: number
  shardsEarned: number
  streakCorrect: number
  trials: Trial[]
  isPlaying: boolean
  isPaused: boolean
}

interface GameActions {
  startSession: (config: SessionConfig) => void
  recordTrial: (response: TrialResponse) => void
  endBlock: () => BlockResult
  pauseSession: () => void
  resumeSession: () => void
  quitSession: () => SessionSummary
}

// stores/useUserStore.ts
interface UserState {
  totalShards: number
  ownedUpgrades: UpgradeId[]
  ownedThemes: ThemeId[]
  sessionHistory: SessionSummary[]
  dailyStreak: number
  lastPlayedDate: string | null
  peakNLevel: number
}

interface UserActions {
  addShards: (amount: number) => void
  spendShards: (amount: number) => boolean
  buyUpgrade: (upgradeId: UpgradeId) => boolean
  buyTheme: (themeId: ThemeId) => boolean
  saveSession: (summary: SessionSummary) => void
  updateStreak: () => void
}
```

---

#### 3.2 Database Schema

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                       │
│                     [Supabase PostgreSQL + expo-sqlite]                         │
└─────────────────────────────────────────────────────────────────────────────────┘

Note: Same schema used in both cloud (PostgreSQL) and local (SQLite) databases.
      Local DB adds `sync_status` column to track pending syncs.

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  USERS                                        (Managed by Supabase Auth) │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  id              UUID        PK    (from Supabase Auth)                 │   │
│  │  email           VARCHAR     NOT NULL                                    │   │
│  │  created_at      TIMESTAMP   DEFAULT NOW()                              │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                          │                                                      │
│                          │ 1:1                                                  │
│                          ▼                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  USER_PROFILES                                                          │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  id              UUID        PK    DEFAULT gen_random_uuid()            │   │
│  │  user_id         UUID        FK -> users.id  UNIQUE                     │   │
│  │  total_shards    INTEGER     DEFAULT 0                                  │   │
│  │  daily_streak    INTEGER     DEFAULT 0                                  │   │
│  │  last_played_at  TIMESTAMP   NULLABLE                                   │   │
│  │  peak_n_level    INTEGER     DEFAULT 2                                  │   │
│  │  created_at      TIMESTAMP   DEFAULT NOW()                              │   │
│  │  updated_at      TIMESTAMP   DEFAULT NOW()                              │   │
│  │  sync_status     VARCHAR     LOCAL ONLY ('pending'|'synced')            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                          │                                                      │
│          ┌───────────────┼───────────────┬───────────────┐                     │
│          │ 1:N           │ 1:N           │ 1:N           │ 1:N                  │
│          ▼               ▼               ▼               ▼                      │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────────┐   │
│  │  SESSIONS     │ │  UPGRADES     │ │  THEMES       │ │  SYNC_QUEUE       │   │
│  ├───────────────┤ ├───────────────┤ ├───────────────┤ ├───────────────────┤   │
│  │ id        UUID│ │ id        UUID│ │ id        UUID│ │ id            UUID│   │
│  │ user_id   UUID│ │ user_id   UUID│ │ user_id   UUID│ │ user_id       UUID│   │
│  │ started_at  TS│ │ upgrade_id VAR│ │ theme_id  VAR │ │ table_name    VAR │   │
│  │ ended_at    TS│ │ purchased_at  │ │ purchased_at  │ │ record_id     UUID│   │
│  │ total_blocks  │ │ sync_status   │ │ sync_status   │ │ operation     VAR │   │
│  │ total_shards  │ │               │ │               │ │ payload       JSON│   │
│  │ avg_accuracy  │ │ Upgrade IDs:  │ │ Theme IDs:    │ │ created_at    TS  │   │
│  │ peak_n_level  │ │ buffer_exp    │ │ system        │ │ attempts      INT │   │
│  │ sync_status   │ │ overclock_cpu │ │ monochrome    │ │                   │   │
│  └───────┬───────┘ │ enhanced_cool │ │ amber_retro   │ │ LOCAL DB ONLY     │   │
│          │         │ dual_core     │ │ vaporwave     │ │ (not synced)      │   │
│          │ 1:N     │ predictive    │ │ cyberpunk     │ └───────────────────┘   │
│          ▼         │ stability_reg │ │               │                         │
│  ┌───────────────┐ │ neural_integ  │ └───────────────┘                         │
│  │  TRIALS       │ │ failsafe      │                                           │
│  ├───────────────┤ │ temporal      │                                           │
│  │ id        UUID│ └───────────────┘                                           │
│  │ session_id    │                                                             │
│  │ block_number  │                                                             │
│  │ trial_number  │                                                             │
│  │ n_level       │                                                             │
│  │ stimulus_pos  │  (0-8 for 3x3 grid)                                        │
│  │ stimulus_audio│  (A-Z letter)                                              │
│  │ is_pos_match  │  BOOLEAN                                                   │
│  │ is_audio_match│  BOOLEAN                                                   │
│  │ user_pos_resp │  BOOLEAN (did user press position?)                        │
│  │ user_audio_rsp│  BOOLEAN (did user press audio?)                           │
│  │ is_correct    │  BOOLEAN                                                   │
│  │ reaction_ms   │  INTEGER (milliseconds)                                    │
│  │ stability_at  │  INTEGER (0-100)                                           │
│  │ shards_earned │  INTEGER                                                   │
│  │ created_at    │  TIMESTAMP                                                 │
│  │ sync_status   │                                                            │
│  └───────────────┘                                                             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

#### Schema Details

| Table | Purpose | Sync Strategy |
|-------|---------|---------------|
| **users** | Managed by Supabase Auth. Don't modify directly. | N/A (Supabase) |
| **user_profiles** | Extended user data (shards, streak, peak level). | Last-write-wins |
| **sessions** | Training session summaries. | Append-only |
| **trials** | Individual trial data for analytics. | Append-only |
| **upgrades** | Purchased upgrades per user. | Append-only |
| **themes** | Purchased themes per user. | Append-only |
| **sync_queue** | Local-only queue tracking pending syncs. | N/A (local) |

---

#### Sync Status Values

```typescript
type SyncStatus = 'pending' | 'synced' | 'conflict'

// Local DB workflow:
// 1. New record created → sync_status = 'pending'
// 2. SyncService uploads to server → sync_status = 'synced'
// 3. If conflict detected → sync_status = 'conflict' (manual resolution)
```

---

#### TypeScript Interfaces

```typescript
// types/database.ts

interface UserProfile {
  id: string
  userId: string
  totalShards: number
  dailyStreak: number
  lastPlayedAt: string | null
  peakNLevel: number
  createdAt: string
  updatedAt: string
}

interface Session {
  id: string
  userId: string
  startedAt: string
  endedAt: string
  totalBlocks: number
  totalShards: number
  avgAccuracy: number
  peakNLevel: number
}

interface Trial {
  id: string
  sessionId: string
  blockNumber: number
  trialNumber: number
  nLevel: number
  stimulusPos: number        // 0-8
  stimulusAudio: string      // A-Z
  isPosMatch: boolean
  isAudioMatch: boolean
  userPosResponse: boolean
  userAudioResponse: boolean
  isCorrect: boolean
  reactionMs: number
  stabilityAt: number
  shardsEarned: number
  createdAt: string
}

interface OwnedUpgrade {
  id: string
  userId: string
  upgradeId: UpgradeId
  purchasedAt: string
}

interface OwnedTheme {
  id: string
  userId: string
  themeId: ThemeId
  purchasedAt: string
}

// Enums
type UpgradeId = 
  | 'buffer_expansion'
  | 'overclock_cpu'
  | 'enhanced_cooling'
  | 'dual_core'
  | 'predictive_algorithms'
  | 'stability_regeneration'
  | 'neural_integration'
  | 'failsafe_protocol'
  | 'temporal_analysis'

type ThemeId = 
  | 'system'
  | 'monochrome'
  | 'amber_retro'
  | 'vaporwave'
  | 'cyberpunk_neon'
```

---

#### 3.3 Backend API Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    BACKEND API COMPONENT DIAGRAM                                │
│                    [Node.js + Express]                                          │
└─────────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   Mobile App    │
                              │   (Client)      │
                              └────────┬────────┘
                                       │
                                       │ HTTPS + JWT
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           EXPRESS APPLICATION                                   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         MIDDLEWARE LAYER                                │   │
│  │                                                                         │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ │   │
│  │  │ cors           │  │ helmet          │  │ express.json()          │ │   │
│  │  │                 │  │                 │  │                         │ │   │
│  │  │ Allow mobile    │  │ Security        │  │ Parse JSON bodies       │ │   │
│  │  │ app origins     │  │ headers         │  │                         │ │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────────┘ │   │
│  │                                                                         │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ │   │
│  │  │ rateLimiter    │  │ requestLogger   │  │ errorHandler            │ │   │
│  │  │                 │  │                 │  │                         │ │   │
│  │  │ 100 req/min     │  │ Log method,     │  │ Catch & format errors   │ │   │
│  │  │ per IP          │  │ path, duration  │  │ Return JSON errors      │ │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                         │
│                                       ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         ROUTE LAYER                                     │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  AUTH ROUTES                    /api/auth/*                     │   │   │
│  │  │                                                                 │   │   │
│  │  │  POST /api/auth/callback   ←  Supabase webhook (optional)       │   │   │
│  │  │  GET  /api/auth/me         ←  [authMiddleware] Get current user │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  SYNC ROUTES                    /api/sync/*          [PROTECTED]│   │   │
│  │  │                                                                 │   │   │
│  │  │  POST /api/sync              ←  Batch sync from mobile          │   │   │
│  │  │       Body: { sessions[], trials[], profile, upgrades[], ... }  │   │   │
│  │  │       Response: { synced: true, conflicts: [], serverTime }     │   │   │
│  │  │                                                                 │   │   │
│  │  │  GET  /api/sync/pull         ←  Pull latest server state        │   │   │
│  │  │       Response: { profile, sessions[], upgrades[], themes[] }   │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  LEADERBOARD ROUTES             /api/leaderboard/*   [PROTECTED]│   │   │
│  │  │                                                                 │   │   │
│  │  │  GET  /api/leaderboard/weekly    ←  Top 10 by peak n-level      │   │   │
│  │  │  GET  /api/leaderboard/accuracy  ←  Top 10 by avg accuracy      │   │   │
│  │  │  GET  /api/leaderboard/streak    ←  Top 10 by daily streak      │   │   │
│  │  │                                                                 │   │   │
│  │  │  MVP: Returns mock data. Real implementation in Phase 2.        │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  HEALTH ROUTES                  /api/health                     │   │   │
│  │  │                                                                 │   │   │
│  │  │  GET  /api/health            ←  { status: 'ok', timestamp }     │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                         │
│                                       ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         SERVICE LAYER                                   │   │
│  │                                                                         │   │
│  │  ┌───────────────────────┐  ┌───────────────────────┐                  │   │
│  │  │  AuthService          │  │  SyncService          │                  │   │
│  │  │                       │  │                       │                  │   │
│  │  │ • verifyJWT()         │  │ • processBatch()      │                  │   │
│  │  │ • getUserFromToken()  │  │ • resolveConflicts()  │                  │   │
│  │  │ • validateScopes()    │  │ • mergeProfile()      │                  │   │
│  │  │                       │  │ • appendSessions()    │                  │   │
│  │  │ Uses:                 │  │ • appendTrials()      │                  │   │
│  │  │ • @supabase/supabase  │  │                       │                  │   │
│  │  │ • jose (JWT verify)   │  │ Conflict Strategy:    │                  │   │
│  │  │                       │  │ • Sessions: append    │                  │   │
│  │  │                       │  │ • Profile: last-write │                  │   │
│  │  └───────────────────────┘  └───────────────────────┘                  │   │
│  │                                                                         │   │
│  │  ┌───────────────────────┐  ┌───────────────────────┐                  │   │
│  │  │  LeaderboardService   │  │  ProfileService       │                  │   │
│  │  │                       │  │                       │                  │   │
│  │  │ • getWeeklyTop()      │  │ • getProfile()        │                  │   │
│  │  │ • getAccuracyTop()    │  │ • updateProfile()     │                  │   │
│  │  │ • getStreakTop()      │  │ • createProfile()     │                  │   │
│  │  │                       │  │                       │                  │   │
│  │  │ MVP: Returns mock     │  │ Uses: Repository      │                  │   │
│  │  │ data array            │  │                       │                  │   │
│  │  └───────────────────────┘  └───────────────────────┘                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                         │
│                                       ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         REPOSITORY LAYER                                │   │
│  │                                                                         │   │
│  │  ┌───────────────────────┐  ┌───────────────────────┐                  │   │
│  │  │  ProfileRepository    │  │  SessionRepository    │                  │   │
│  │  │                       │  │                       │                  │   │
│  │  │ • findByUserId()      │  │ • findByUserId()      │                  │   │
│  │  │ • create()            │  │ • createMany()        │                  │   │
│  │  │ • update()            │  │ • findById()          │                  │   │
│  │  │                       │  │                       │                  │   │
│  │  └───────────────────────┘  └───────────────────────┘                  │   │
│  │                                                                         │   │
│  │  ┌───────────────────────┐  ┌───────────────────────┐                  │   │
│  │  │  TrialRepository      │  │  UpgradeRepository    │                  │   │
│  │  │                       │  │                       │                  │   │
│  │  │ • createMany()        │  │ • findByUserId()      │                  │   │
│  │  │ • findBySessionId()   │  │ • create()            │                  │   │
│  │  │                       │  │ • exists()            │                  │   │
│  │  └───────────────────────┘  └───────────────────────┘                  │   │
│  │                                                                         │   │
│  │  ┌───────────────────────┐                                             │   │
│  │  │  ThemeRepository      │   All repositories use:                     │   │
│  │  │                       │   • @supabase/supabase-js                   │   │
│  │  │ • findByUserId()      │   • Direct PostgreSQL queries               │   │
│  │  │ • create()            │                                             │   │
│  │  │ • exists()            │                                             │   │
│  │  └───────────────────────┘                                             │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                         │
└───────────────────────────────────────┼─────────────────────────────────────────┘
                                        │
                                        │ SQL
                                        ▼
                              ┌─────────────────┐
                              │    Supabase     │
                              │   PostgreSQL    │
                              └─────────────────┘
```

---

#### Component Descriptions: Backend API

| Layer | Component | Responsibility |
|-------|-----------|----------------|
| **Middleware** | cors, helmet, json | Standard Express security & parsing |
| **Middleware** | rateLimiter | Prevent abuse (100 req/min/IP) |
| **Middleware** | authMiddleware | Validate Supabase JWT on protected routes |
| **Middleware** | errorHandler | Centralized error formatting |
| **Routes** | Auth Routes | User identity endpoints |
| **Routes** | Sync Routes | Offline data synchronization |
| **Routes** | Leaderboard Routes | Social rankings (mocked for MVP) |
| **Service** | AuthService | JWT verification, user extraction |
| **Service** | SyncService | Batch processing, conflict resolution |
| **Service** | LeaderboardService | Ranking queries |
| **Service** | ProfileService | User profile CRUD |
| **Repository** | *Repository | Database access layer (Supabase client) |

---

#### API Contracts

```typescript
// POST /api/sync
// Sync local data to server

interface SyncRequest {
  profile?: Partial<UserProfile>
  sessions?: Session[]
  trials?: Trial[]
  upgrades?: OwnedUpgrade[]
  themes?: OwnedTheme[]
  clientTime: string  // ISO timestamp
}

interface SyncResponse {
  success: boolean
  synced: {
    profile: boolean
    sessions: number  // count synced
    trials: number
    upgrades: number
    themes: number
  }
  conflicts: ConflictRecord[]
  serverTime: string
}

interface ConflictRecord {
  table: string
  recordId: string
  clientValue: unknown
  serverValue: unknown
  resolution: 'client_wins' | 'server_wins' | 'merged'
}

// GET /api/sync/pull
// Pull latest server state to client

interface PullResponse {
  profile: UserProfile
  sessions: Session[]
  upgrades: OwnedUpgrade[]
  themes: OwnedTheme[]
  serverTime: string
}

// GET /api/leaderboard/:type
// type = 'weekly' | 'accuracy' | 'streak'

interface LeaderboardEntry {
  rank: number
  username: string  // anonymized or opted-in
  value: number     // n-level, accuracy %, or streak days
  isCurrentUser: boolean
}

interface LeaderboardResponse {
  type: 'weekly' | 'accuracy' | 'streak'
  entries: LeaderboardEntry[]
  currentUserRank?: number
}
```

---

#### Backend Folder Structure

```
backend/
├── src/
│   ├── index.ts                 # Express app entry point
│   ├── config/
│   │   ├── env.ts               # Environment variables
│   │   └── supabase.ts          # Supabase client init
│   │
│   ├── middleware/
│   │   ├── auth.ts              # JWT validation middleware
│   │   ├── rateLimiter.ts       # Rate limiting
│   │   └── errorHandler.ts      # Error formatting
│   │
│   ├── routes/
│   │   ├── index.ts             # Route aggregator
│   │   ├── auth.routes.ts       # /api/auth/*
│   │   ├── sync.routes.ts       # /api/sync/*
│   │   ├── leaderboard.routes.ts# /api/leaderboard/*
│   │   └── health.routes.ts     # /api/health
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── sync.service.ts
│   │   ├── leaderboard.service.ts
│   │   └── profile.service.ts
│   │
│   ├── repositories/
│   │   ├── profile.repository.ts
│   │   ├── session.repository.ts
│   │   ├── trial.repository.ts
│   │   ├── upgrade.repository.ts
│   │   └── theme.repository.ts
│   │
│   └── types/
│       ├── database.ts          # DB interfaces
│       ├── api.ts               # Request/Response types
│       └── errors.ts            # Custom error classes
│
├── package.json
├── tsconfig.json
└── .env.example
```

---

### Level 4: Code (Optional)
*(Available on request - critical path implementations)*

---

## 4. Decisions Log (ADRs)

### ADR-001: Authentication Provider

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2025-12-02 |
| **Decision** | Use Supabase Auth for user authentication |
| **Context** | Need auth that works with offline-first mobile app, custom Node.js backend, and React Native. Solo developer needs manageable complexity. |
| **Options Considered** | Firebase Auth, Custom JWT Auth, Supabase Auth, No Auth |
| **Rationale** | Supabase offers: (1) Open-source foundation (less lock-in), (2) 50k MAU free tier, (3) JWT tokens compatible with custom backend validation, (4) Works offline (tokens stored locally), (5) Good React Native SDK support |
| **Consequences** | Backend must validate Supabase JWT tokens. User data for auth lives in Supabase. |

---

### ADR-002: Backend Framework

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2025-12-02 |
| **Decision** | Use Express.js for the backend API |
| **Context** | Need a Node.js framework for custom backend. Solo developer, LLM-assisted development. |
| **Options Considered** | Express, Fastify, Hono |
| **Rationale** | Express is: (1) Most widely documented, (2) Huge middleware ecosystem, (3) LLM training data is rich with Express examples, (4) Simple and familiar |
| **Consequences** | Standard Node.js patterns apply. No special configuration needed. |

---

### ADR-003: Database Platform

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2025-12-02 |
| **Decision** | Use Supabase PostgreSQL for cloud database |
| **Context** | Already using Supabase Auth. Need persistent storage for synced user data. |
| **Options Considered** | Supabase PostgreSQL, Separate PostgreSQL (Railway/Render), MongoDB |
| **Rationale** | (1) Single platform with auth reduces operational complexity, (2) PostgreSQL is relational (good for structured game data), (3) Supabase free tier is generous, (4) Built-in dashboard for debugging |
| **Consequences** | All cloud data lives in Supabase. Migration would require exporting data if moving platforms later. |

---

### ADR-004: Offline Storage

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2025-12-02 |
| **Decision** | Use expo-sqlite for local offline storage |
| **Context** | Offline-first architecture requires local database. React Native + Expo environment. |
| **Options Considered** | AsyncStorage, expo-sqlite, WatermelonDB, MMKV |
| **Rationale** | (1) SQL queries match the structured nature of game data (sessions, trials, upgrades), (2) Schema can mirror Supabase PostgreSQL, (3) Simpler than WatermelonDB for MVP, (4) Good Expo support |
| **Consequences** | Must implement custom sync logic (not built-in like WatermelonDB). Acceptable for MVP complexity. |

---

### ADR-005: State Management

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2025-12-02 |
| **Decision** | Use Zustand for client-side state management |
| **Context** | Need state management for React Native app. Multiple stores needed (game session, user data, settings, auth). |
| **Options Considered** | Zustand, Redux, Jotai, React Context |
| **Rationale** | (1) Minimal boilerplate compared to Redux, (2) Simple mental model, (3) Built-in persistence middleware, (4) Works well with React Native, (5) Easy to split into multiple stores |
| **Consequences** | Four stores: useGameStore (session), useUserStore (persistent), useSettingsStore (preferences), useAuthStore (auth). |

---

### ADR-006: Sync Strategy

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2025-12-02 |
| **Decision** | Use "Last Write Wins" with append-only for immutable data |
| **Context** | Offline-first app needs conflict resolution strategy when syncing to server. |
| **Options Considered** | Last-write-wins, CRDT, Manual conflict resolution, Server-always-wins |
| **Rationale** | (1) Sessions/trials are append-only (no conflicts possible), (2) Profile data uses last-write-wins with timestamps (simple, predictable), (3) Upgrades/themes are append-only (purchase once, never deleted), (4) Complexity of CRDT not justified for this data model |
| **Consequences** | Client must track `updated_at` timestamps. Server compares timestamps for profile conflicts. Rare edge case: two devices update profile simultaneously → most recent wins. |

---

## 5. Next Steps

1. ~~Answer the 9 open questions in Section 2~~ ✓
2. ~~Draft Level 1: System Context diagram~~ ✓
3. ~~Draft Level 2: Container Diagram~~ ✓
4. ~~Draft Level 3: Mobile App Components~~ ✓
5. ~~Draft Level 3: Backend API Components~~ ✓
6. ~~Define database schema~~ ✓
7. **→ Review & Finalize C4 Document**
8. Optional: Level 4 Code sketches for critical paths

---

**Document Version:** 0.5  
**Phase:** C4 Document Complete - Ready for Review
