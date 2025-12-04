#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# 🤖 Cursor Multi-Agent System Initializer
# ═══════════════════════════════════════════════════════════════════════════════
#
# Creates .cursor/rules/ and .cursor/skills/ for multi-agent development.
#
# Usage:
#   ./scripts/init-cursor-agents.sh
#
# ═══════════════════════════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  🤖 Cursor Multi-Agent System Initializer${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_step() { echo -e "${BLUE}▶ $1${NC}"; }
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }

# ─────────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────────

get_config() {
    print_header
    
    echo -e "${YELLOW}What is your project name?${NC}"
    echo -e "(Used for Memory Bank organization)"
    while true; do
        read -p "> " PROJECT_NAME
        if [ -n "$PROJECT_NAME" ]; then
            break
        fi
        echo -e "${RED}Project name is required.${NC}"
    done
    PROJECT_NAME=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
    
    echo ""
    echo -e "${YELLOW}Do you have Memory Bank MCP installed?${NC}"
    echo "  y) Yes, it's configured"
    echo "  n) No, skip Memory Bank setup"
    read -p "> " HAS_MEMORY_BANK
    HAS_MEMORY_BANK=${HAS_MEMORY_BANK:-"y"}
    echo ""
}

# ─────────────────────────────────────────────────────────────────────────────
# Create Directories
# ─────────────────────────────────────────────────────────────────────────────

create_directories() {
    print_step "Creating directories..."
    mkdir -p .cursor/rules
    mkdir -p .cursor/skills
    mkdir -p scripts
    print_success "Directories created"
}

# ─────────────────────────────────────────────────────────────────────────────
# Agent Rules
# ─────────────────────────────────────────────────────────────────────────────

create_orchestrator_rule() {
    print_step "Creating Orchestrator agent..."
    cat > .cursor/rules/orchestrator.mdc << 'EOF'
---
description: ORCHESTRATOR AGENT - Task Delegation & Workflow Manager
globs: 
alwaysApply: false
---
# Identity: The Orchestrator
You are the **Workflow Manager and Task Delegator**.
- **Role:** Analyze requests, maintain Memory Bank, delegate to sub-agents.
- **Restriction:** You **DO NOT** edit source code directly. Delegate all coding tasks.
- **Restriction:** You **DO NOT** modify `systemPatterns.md`. That is the Architect's domain.

---

# 🎛️ MODE DETECTION

## Interactive Mode (Hand off to Architect)
- ❓ New Feature: No contract in `systemPatterns.md`
- 🏗️ Architectural Decision needed
- 🔐 Security-Sensitive: Auth, payments, user data
- ⚠️ Ambiguous Requirements

**Action:** Tell user to invoke `@system-architect`

## Automated Mode (Delegate directly)
- ✅ Contract EXISTS in `systemPatterns.md`
- ✅ Requirements are SPECIFIC

---

# Agent Registry

| Agent | Domain |
|-------|--------|
| `system-architect` | systemPatterns.md, Specs |
| `frontend` | app/, src/components/ |
| `backend` | backend/ |
| `e2e` | tests/ |

---

# Workflow

1. `memory_bank_read(projectName, 'systemPatterns.md')`
2. Check: Does contract exist?
3. Interactive → `@system-architect` | Automated → delegate

# Delegation Template
```bash
./scripts/call_agent.sh <agent> "
[OBJECTIVE] What to build
[CONTEXT] systemPatterns.md section
[CRITERIA] Success conditions
"
```
EOF
    print_success "Orchestrator created"
}

create_architect_rule() {
    print_step "Creating System Architect agent..."
    cat > .cursor/rules/system-architect.mdc << 'EOF'
---
description: SYSTEM ARCHITECT AGENT - System Design & Technical Specifications
globs: src/types/**/*
alwaysApply: false
---
# Identity: The Systems Architect
You are the **Technical Authority**.
- **Role:** Turn requirements into specifications in `systemPatterns.md`.
- **Restriction:** You DO NOT write feature code. Only definitions.

---

# 🎛️ MODES

## Interactive (Design Session)
**Flow:** DISCOVERY → PROPOSAL → APPROVAL → FINALIZE

**Exit Statuses:**
- `[STATUS] ⏸️ AWAITING INPUT` - Questions asked
- `[STATUS] ⏸️ AWAITING APPROVAL` - Proposal ready
- `[STATUS] ✅ BLUEPRINT READY` - Finalized

## Automated
**Detection:** Prompt has `[OBJECTIVE]`, `[CONTEXT]`, `[CRITERIA]`
**Flow:** READ → DESIGN → WRITE → EXIT

---

# Memory Bank Files

| File | Purpose |
|------|---------|
| `systemPatterns.md` | API contracts, interfaces, schemas |
| `productContext.md` | User stories, business logic |
| `techContext.md` | Tech stack, constraints |

---

# Standards
- Database: Prefer additive changes
- API: RESTful, JSON responses
- Security: Secure by default
EOF
    print_success "System Architect created"
}

create_frontend_rule() {
    print_step "Creating Frontend agent..."
    cat > .cursor/rules/frontend.mdc << 'EOF'
---
description: FRONTEND AGENT - UI/UX Specialist
globs: app/**/*,src/components/**/*,src/hooks/**/*
alwaysApply: false
---
# Identity: The Frontend Specialist
- **Role:** Build screens, components, navigation.
- **Authority:** Own UI directories.
- **Constraint:** NEVER mock data. Implement against `systemPatterns.md`.

---

# Workflow

1. Read `systemPatterns.md` for interfaces
2. Implement with TypeScript + React Query/Zustand
3. Verify: `tsc --noEmit`

# Exit Protocol
```
[STATUS] ✅ SUCCESS
[FILES] app/screen.tsx
[SUMMARY] What was created
[VERIFIED] Matches systemPatterns.md#Section
```
EOF
    print_success "Frontend created"
}

create_backend_rule() {
    print_step "Creating Backend agent..."
    cat > .cursor/rules/backend.mdc << 'EOF'
---
description: BACKEND AGENT - API & Logic Specialist
globs: backend/**/*
alwaysApply: false
---
# Identity: The Backend Specialist
- **Role:** Implement REST APIs, database models, business logic.
- **Authority:** Own `backend/` directory.
- **Critical:** NEVER invent API responses. Match `systemPatterns.md` exactly.

---

# Structure
- Controllers: `backend/src/controllers/`
- Services: `backend/src/services/`
- Models: `backend/src/models/`
- Routes: `backend/src/routes/`

# Security
- Validate all inputs (Zod)
- Never log sensitive data
- Parameterized queries

# Exit Protocol
```
[STATUS] ✅ SUCCESS
[FILES] backend/src/routes/auth.ts
[SUMMARY] What was implemented
[VERIFIED] Matches systemPatterns.md#Section
```
EOF
    print_success "Backend created"
}

create_e2e_rule() {
    print_step "Creating E2E agent..."
    cat > .cursor/rules/e2e.mdc << 'EOF'
---
description: E2E AGENT - QA & Testing Specialist
globs: tests/**/*
alwaysApply: false
---
# Identity: The QA Specialist
- **Role:** Write E2E and Integration tests.
- **Authority:** Own `tests/` directory.
- **Mission:** If tests fail, feature is NOT done.

---

# Strategy
- API Tests: supertest or Playwright
- Mobile UI: Detox
- Web UI: Playwright

# Standards
- Tests clean up their data
- Under 30s, mock heavy APIs
- Happy path AND sad paths

# Anti-Patterns
- ❌ Fixed `wait(5000)` - use polling
- ❌ Fragile selectors - use `data-testid`

# Exit Protocol
```
[STATUS] ✅ TESTS PASSED
[FILES] tests/e2e/feature.spec.ts
[COVERAGE] Happy path, error cases
```
EOF
    print_success "E2E created"
}

# ─────────────────────────────────────────────────────────────────────────────
# Skills
# ─────────────────────────────────────────────────────────────────────────────

create_skills() {
    print_step "Creating skills..."
    
    cat > .cursor/skills/frontend-development.md << 'EOF'
# Frontend Development Skill

## State Management
- **Server State:** TanStack Query
- **Client State:** Zustand
- **Form State:** React Hook Form + Zod

## Patterns
```typescript
const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => api.getUser(id),
  })
}
```
EOF

    cat > .cursor/skills/backend-development.md << 'EOF'
# Backend Development Skill

## Structure
```
backend/src/
├── controllers/
├── services/
├── models/
├── routes/
├── middleware/
└── utils/
```

## Validation (Zod)
```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})
const validated = schema.parse(req.body)
```
EOF

    cat > .cursor/skills/security-compliance.md << 'EOF'
# Security Compliance Skill

## Auth
- JWT: 15min access, 7d refresh
- Storage: SecureStore (mobile), httpOnly cookies (web)
- Hash passwords with bcrypt (cost 12)

## Input
- Validate ALL user input
- Parameterized queries
- Sanitize HTML output
EOF

    cat > .cursor/skills/database-design.md << 'EOF'
# Database Design Skill

## Principles
- Additive migrations over destructive
- UUIDs for public IDs
- Include createdAt, updatedAt

## Migrations
```typescript
export async function up(db) {
  await db.schema.addColumn('users', 'avatarUrl', 'string')
}
export async function down(db) {
  await db.schema.dropColumn('users', 'avatarUrl')
}
```
EOF
    print_success "Skills created"
}

# ─────────────────────────────────────────────────────────────────────────────
# Scripts & Files
# ─────────────────────────────────────────────────────────────────────────────

create_call_agent_script() {
    print_step "Creating call_agent.sh..."
    cat > scripts/call_agent.sh << 'EOF'
#!/bin/bash
AGENT_NAME=$1
TASK=$2

RULE_FILE=".cursor/rules/$AGENT_NAME.mdc"
if [ ! -f "$RULE_FILE" ]; then
    echo "❌ Agent not found: $AGENT_NAME"
    exit 1
fi

echo "📋 Task: $TASK"
echo "To execute: @$AGENT_NAME $TASK"
EOF
    chmod +x scripts/call_agent.sh
    print_success "call_agent.sh created"
}

create_cursorrules() {
    print_step "Creating .cursorrules..."
    cat > .cursorrules << 'EOF'
# Project Rules

## Code Style
- Omit semicolons
- Use const/let, not var
- Prefer arrow functions
- Strict TypeScript typing

## Architecture
- DRY, KISS, YAGNI
- No default parameter values
- Functional over OOP

## Error Handling
- Raise errors explicitly
- No silent failures
- No fallbacks - fix root cause

## Multi-Agent
- Rules: `.cursor/rules/`
- Skills: `.cursor/skills/`
- Orchestrator: `@orchestrator`
- Architect: `@system-architect`
EOF
    print_success ".cursorrules created"
}

create_readme() {
    print_step "Creating AGENTS.md..."
    cat > AGENTS.md << 'EOF'
# 🤖 Multi-Agent System

| Agent | Invoke | Role |
|-------|--------|------|
| Orchestrator | `@orchestrator` | Coordination |
| Architect | `@system-architect` | Design |
| Frontend | `@frontend` | UI |
| Backend | `@backend` | API |
| E2E | `@e2e` | Testing |

## Usage

```bash
# Design a feature
@system-architect Add user profile with avatar

# Implement after blueprint
@orchestrator Implement profile per systemPatterns.md
```

## Flow

```
Request → Orchestrator → Contract exists?
                              │
            NO ───────────────┼─────────── YES
             ↓                              ↓
         Architect                     Delegate
             ↓                              ↓
         Blueprint ──────────────→ Implementation
```
EOF
    print_success "AGENTS.md created"
}

# ─────────────────────────────────────────────────────────────────────────────
# Memory Bank Instructions
# ─────────────────────────────────────────────────────────────────────────────

print_memory_bank_instructions() {
    if [ "$HAS_MEMORY_BANK" != "y" ]; then
        print_warning "Skipping Memory Bank (not configured)"
        return
    fi
    
    echo ""
    print_step "Memory Bank Setup"
    echo ""
    echo "Run in Cursor to initialize:"
    echo ""
    echo -e "${CYAN}memory_bank_write('${PROJECT_NAME}', 'projectBrief.md', '# ${PROJECT_NAME}\\n\\n## Overview\\n...')${NC}"
    echo -e "${CYAN}memory_bank_write('${PROJECT_NAME}', 'systemPatterns.md', '# System Patterns\\n...')${NC}"
    echo -e "${CYAN}memory_bank_write('${PROJECT_NAME}', 'activeContext.md', '# Active Context\\n...')${NC}"
}

# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

main() {
    get_config
    
    print_step "Setting up agents for: $PROJECT_NAME"
    echo ""
    
    create_directories
    create_orchestrator_rule
    create_architect_rule
    create_frontend_rule
    create_backend_rule
    create_e2e_rule
    create_skills
    create_call_agent_script
    create_cursorrules
    create_readme
    
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✅ Done!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Created:"
    echo "  • .cursor/rules/   (5 agents)"
    echo "  • .cursor/skills/  (4 skills)"
    echo "  • scripts/         (call_agent.sh)"
    echo "  • .cursorrules"
    echo "  • AGENTS.md"
    echo ""
    echo -e "Start with: ${CYAN}@orchestrator [task]${NC}"
    
    print_memory_bank_instructions
}

main
