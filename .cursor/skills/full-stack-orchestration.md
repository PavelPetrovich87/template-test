# Full-Stack Orchestration Skill

> **Purpose:** Coordinating frontend/backend development cycles, API contract enforcement, and integration workflows.

---

## 1. The Contract-First Workflow

### Golden Rule
**The API contract (`systemPatterns.md`) is the source of truth.**
- Frontend and Backend MUST implement against the same contract
- NO deviation without Architect approval
- Contract changes trigger re-validation of both sides

### Workflow Sequence
```
1. [Architect] defines contract in systemPatterns.md
2. [Orchestrator] validates contract completeness
3. [Backend] implements endpoints (can start immediately)
4. [Frontend] implements UI (can start immediately if contract exists)
5. [E2E] validates integration (waits for both)
```

---

## 2. Parallel Development Strategy

### What CAN run in parallel:
- Backend API implementation
- Frontend UI components (using contract types)
- Test scaffolding (structure without assertions)

### What MUST be sequential:
```
Contract Definition → Implementation
Backend Endpoint → Frontend Integration (if hitting real API)
Both Complete → E2E Integration Tests
```

### Parallelization Template
```markdown
## Phase 1: Parallel Implementation
- [ ] [Backend] POST /api/user/profile - implements endpoint
- [ ] [Frontend] ProfileScreen.tsx - builds UI with mock data

## Phase 2: Integration
- [ ] [Frontend] Connect ProfileScreen to real API
- [ ] [E2E] Validate full flow
```

---

## 3. Type Synchronization

### Shared Types Strategy
Types defined in `systemPatterns.md` must be mirrored:
- **Backend:** `backend/src/types/` (source of runtime validation)
- **Frontend:** `src/types/` (imports from shared or duplicates)

### Type Drift Detection
Before ANY full-stack task:
```
1. Read systemPatterns.md for interface definitions
2. Check backend/src/types/ matches
3. Check src/types/ matches
4. If mismatch → STOP and align first
```

### Example Type Flow
```typescript
// systemPatterns.md defines:
interface IUserProfile {
  id: string
  bio: string
  avatarUrl: string | null
}

// Backend validates with Zod:
const UserProfileSchema = z.object({
  id: z.string(),
  bio: z.string(),
  avatarUrl: z.string().nullable()
})

// Frontend uses for typing:
import type { IUserProfile } from '@/types/user'
```

---

## 4. API Integration Patterns

### Environment-Aware Configuration
```typescript
// Frontend must use config, never hardcode
const API_BASE = process.env.EXPO_PUBLIC_API_URL

// Correct
fetch(`${API_BASE}/api/user/profile`)

// FORBIDDEN
fetch('http://localhost:3000/api/user/profile')
```

### Error Response Contract
All APIs must return consistent error shapes:
```typescript
interface IApiError {
  statusCode: number
  message: string
  code: string // e.g., 'USER_NOT_FOUND', 'VALIDATION_ERROR'
}
```

Frontend must handle ALL error codes defined in contract.

---

## 5. State Flow Architecture

### Server State (Backend-Owned)
- Managed by: TanStack Query / React Query
- Cache invalidation on mutations
- Optimistic updates where safe

### Client State (Frontend-Owned)
- Managed by: Zustand
- UI state (modals, forms, navigation)
- Never duplicate server data

### Sync Pattern
```
[Backend DB] ←→ [API] ←→ [React Query Cache] ←→ [UI]
                              ↓
                    [Zustand: UI-only state]
```

---

## 6. Integration Verification

### Pre-Integration Checklist
Before connecting Frontend to Backend:
```
□ Backend endpoint returns 200 for happy path?
□ Backend returns correct error codes?
□ Frontend has error handling for all codes?
□ Types match between frontend/backend?
□ Auth token handling implemented?
```

### Integration Test Template
```typescript
describe('User Profile Integration', () => {
  it('displays profile from API', async () => {
    // 1. Mock API response matching contract
    // 2. Render component
    // 3. Assert UI reflects data
  })

  it('handles API errors gracefully', async () => {
    // 1. Mock 404 response
    // 2. Render component
    // 3. Assert error UI shown
  })
})
```

---

## 7. Deployment Synchronization

### Breaking Change Protocol
If Backend changes break Frontend:
```
1. Backend deploys with BOTH old and new endpoints
2. Frontend updates to new endpoint
3. Frontend deploys
4. Backend removes deprecated endpoint
```

### Version Header Convention
```
X-API-Version: 2024-01-15
```
Frontend should send, Backend should validate compatibility.

---

## 8. Full-Stack Task Template

When delegating full-stack features:

```markdown
## Feature: User Profile Update

### Phase 1: Contract (Architect)
- [ ] Define PATCH /api/user/profile in systemPatterns.md
- [ ] Define IUserProfileUpdate interface
- [ ] Define validation rules

### Phase 2: Implementation (Parallel)
- [ ] [Backend] Implement PATCH endpoint
- [ ] [Frontend] Build ProfileEditScreen UI

### Phase 3: Integration
- [ ] [Frontend] Connect form to PATCH endpoint
- [ ] Handle success/error states

### Phase 4: Validation
- [ ] [E2E] Test full update flow
- [ ] Verify optimistic update behavior
```

---

## 9. Anti-Patterns

| ❌ Avoid | ✅ Correct Approach |
| :--- | :--- |
| Frontend assumes API shape | Frontend reads from systemPatterns.md |
| Backend returns undocumented fields | All fields must be in contract |
| Hardcoded URLs | Environment variables only |
| Ignoring error states | Handle ALL documented error codes |
| Type duplication without sync | Single source of truth for types |

