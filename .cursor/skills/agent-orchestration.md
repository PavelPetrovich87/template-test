# Agent Orchestration Skill

> **Purpose:** Multi-agent coordination, task delegation, and workflow management patterns.

---

## 1. Task Decomposition Framework

### The "Atomic Task" Principle
Break complex requests into **single-responsibility units** that can be:
- Assigned to exactly ONE specialist agent
- Verified with a clear success/failure criteria
- Completed without external dependencies (or with dependencies explicitly mapped)

### Decomposition Checklist
```
□ Can this task be parallelized? (Frontend + Backend simultaneously)
□ Are there blocking dependencies? (Backend must finish before E2E tests)
□ Does each sub-task have a clear "Definition of Done"?
□ Is the scope small enough for one agent session?
```

---

## 2. Delegation Patterns

### Pattern A: Sequential Pipeline
Use when tasks have strict dependencies.
```
[Architect] → defines API contract
    ↓
[Backend] → implements endpoint
    ↓
[Frontend] → builds UI against endpoint
    ↓
[E2E] → validates full flow
```

### Pattern B: Parallel Fan-Out
Use when tasks are independent.
```
[Orchestrator] ──┬── [Backend: API endpoint]
                 ├── [Frontend: UI component]
                 └── [E2E: Test scaffolding]
                     ↓
            [Orchestrator: Merge & Verify]
```

### Pattern C: Iterative Refinement
Use when requirements are unclear.
```
[Architect] → draft spec
    ↓
[User Review] → feedback
    ↓
[Architect] → refined spec
    ↓
[Implementation agents]
```

---

## 3. Context Assembly Protocol

### NEVER delegate without context. Always provide:

| Component | Example |
| :--- | :--- |
| **OBJECTIVE** | "Implement user avatar upload" |
| **CONTRACT_REF** | "See `systemPatterns.md#UserAvatar`" |
| **CONSTRAINTS** | "Do not modify auth middleware" |
| **SUCCESS_CRITERIA** | "Returns 201 with `{ avatarUrl: string }`" |
| **DEPENDENCIES** | "Requires S3 config from `env.ts`" |

### The "Handoff Template"
```markdown
[OBJECTIVE]
{What the agent must accomplish}

[CONTEXT]
- Reference: {systemPatterns.md section}
- Related work: {Previous task IDs or file changes}
- User requirement: {Original user request summary}

[CONSTRAINTS]
- DO NOT: {Forbidden actions}
- MUST: {Required behaviors}

[SUCCESS_CRITERIA]
- Output: {Expected deliverable}
- Verification: {How to confirm success}
```

---

## 4. Progress Tracking & State Management

### Memory Bank Synchronization
```
BEFORE delegation:
  → memory_bank_read('activeContext.md')
  → memory_bank_read('progress.md')

AFTER completion:
  → memory_bank_update('activeContext.md', newStatus)
  → memory_bank_update('progress.md', completionLog)
```

### Status Lifecycle
```
PENDING → IN_PROGRESS → VERIFYING → COMPLETED
                ↓              ↓
            BLOCKED        FAILED → RETRY (max 2)
                               ↓
                           ESCALATE
```

---

## 5. Conflict Resolution

### Agent Collision Detection
If two agents need the same file:
1. **STOP** both tasks
2. **SEQUENCE** them (determine which goes first)
3. **MERGE** carefully if changes are orthogonal

### Scope Violation Handling
If an agent reports needing work outside their domain:
```
[Backend] reports: "Need frontend route change"
    ↓
[Orchestrator] creates NEW delegation to [Frontend]
    ↓
[Backend] task marked BLOCKED until dependency resolved
```

---

## 6. Anti-Patterns

| ❌ Don't | ✅ Do Instead |
| :--- | :--- |
| "Fix the bug" (vague) | "Fix null check in `getUserById` at line 45 of `user.service.ts`" |
| Delegate without contract | Always verify `systemPatterns.md` first |
| Trust agent output blindly | Always `read_file` to verify changes |
| Retry infinitely | Max 2 retries, then ESCALATE to user |
| Start dependent task early | Wait for predecessor verification |

---

## 7. Verification Checklist

After EVERY agent completion:
```
□ Exit status is ✅ SUCCESS?
□ [FILES] list matches expected scope?
□ Read each modified file and verify changes
□ Changes match systemPatterns.md contract?
□ No hallucinated imports or dependencies?
□ Memory Bank updated with results?
```

