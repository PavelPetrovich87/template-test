# 🤖 Cursor Multi-Agent Development System

This project uses a multi-agent system for AI-assisted development. Each agent has specialized knowledge and responsibilities.

## Quick Start

```bash
# For new features requiring design:
@system-architect I want to add [feature description]

# After blueprint is ready:
@orchestrator Implement [feature] per systemPatterns.md#Section

# For direct implementation (when contract exists):
@frontend Create the login screen per systemPatterns.md#Auth
@backend Implement POST /api/auth/login per systemPatterns.md#Auth
```

## Agent Directory

| Agent | Invoke With | Responsibility |
|-------|-------------|----------------|
| 🎯 Orchestrator | `@orchestrator` | Task coordination, delegation |
| 🏛️ System Architect | `@system-architect` | Design, specifications, contracts |
| 📱 Frontend | `@frontend` | UI components, screens, navigation |
| ⚙️ Backend | `@backend` | APIs, database, business logic |
| 🧪 E2E | `@e2e` | End-to-end testing |

## Flow Diagram

```
User Request
     │
     ▼
┌─────────────┐
│ Orchestrator │──── Contract exists? ────┐
└─────────────┘                           │
     │ NO                                 │ YES
     ▼                                    ▼
┌─────────────┐                    ┌─────────────┐
│  Architect  │                    │ Delegate to │
│  (Design)   │                    │ Impl Agents │
└─────────────┘                    └─────────────┘
     │                                    │
     ▼                                    ▼
  Blueprint ──────────────────────► Implementation
                                          │
                                          ▼
                                     E2E Tests
```

## File Structure

```
.cursor/
├── rules/              # Agent definitions
│   ├── orchestrator.mdc
│   ├── system-architect.mdc
│   ├── frontend.mdc
│   ├── backend.mdc
│   └── e2e.mdc
└── skills/             # Specialized knowledge
    ├── frontend-development.md
    ├── backend-development.md
    ├── security-compliance.md
    ├── database-design.md
    └── accessibility-compliance.md
```

## Mode Detection

The Orchestrator automatically detects when to use Interactive vs Automated mode:

### Interactive Mode (Design Session)
Triggers:
- ❓ New features without contracts
- 🏗️ Architectural decisions needed
- 🔐 Security-sensitive features
- ⚠️ Ambiguous requirements

**Flow:** Orchestrator → Hand off to `@system-architect` → Design Session → Blueprint → Resume

### Automated Mode (Direct Delegation)
Triggers:
- ✅ Contract exists in `systemPatterns.md`
- ✅ Clear, specific requirements
- ✅ Implementation only (no design needed)

**Flow:** Orchestrator → `call_agent.sh` → Agent implements → Verify → Done

---

## 📋 Memory Bank (MCP Integration)

Memory Bank is an **external MCP server** that stores project context persistently. Files are stored in the MCP, not in your repo.

### Memory Bank Files

| File | Purpose | Who Writes |
|------|---------|------------|
| `projectBrief.md` | Core requirements, goals | Architect (initial) |
| `productContext.md` | User stories, business logic | Architect |
| `systemPatterns.md` | **API contracts, interfaces, schemas** | Architect |
| `techContext.md` | Tech stack, constraints | Architect |
| `activeContext.md` | Current work, TODOs, blockers | Orchestrator |
| `progress.md` | Changelog, history | Orchestrator |

### Setting Up Memory Bank

```typescript
// 1. Create your project in Memory Bank
memory_bank_write('my-project', 'projectBrief.md', `
# Project Brief: My App

## Overview
A mobile app that does X, Y, Z.

## Core Requirements
- User authentication
- Feature A
- Feature B
`)

// 2. Initialize other required files
memory_bank_write('my-project', 'systemPatterns.md', `
# System Patterns

## API Contracts
(Architect will populate during design sessions)

## Database Schema
(Architect will populate during design sessions)
`)

memory_bank_write('my-project', 'activeContext.md', `
# Active Context

## Current Sprint
- [ ] Initial setup

## Blockers
None
`)
```

### File Structure Reference

#### `systemPatterns.md` (The Contract)
```markdown
# System Patterns

## API Contracts

### Authentication
POST /api/auth/login
- Request: { email: string, password: string }
- Response: { accessToken: string, user: IUser }
- Errors: 400 (invalid), 401 (unauthorized)

## Interfaces
interface IUser {
  id: string
  email: string
  name: string
}

## Database Schema
User: id, email, passwordHash, name, createdAt
```

#### `activeContext.md` (Current State)
```markdown
# Active Context

## Current Sprint
- [x] Setup authentication
- [ ] Build profile screen
- [ ] Add avatar upload

## In Progress
Profile screen implementation

## Blockers
Waiting for S3 bucket setup
```

---

## Example Workflow

### 1. New Feature Request

```
You: "@orchestrator Add user profile with avatar upload"

Orchestrator: "No contract found. This needs design.
              👉 Invoke: @system-architect Add user profile with avatar upload"
```

### 2. Design Session

```
You: "@system-architect Add user profile with avatar upload"

Architect: "Before designing, I need to know:
           1. Storage: Local or S3?
           2. Max file size?
           3. Allowed formats?"
           [STATUS] ⏸️ AWAITING INPUT

You: "S3, 5MB max, JPG and PNG only"

Architect: "Here's my design: [proposal]
           Approve?"
           [STATUS] ⏸️ AWAITING APPROVAL

You: "Approved"

Architect: [STATUS] ✅ BLUEPRINT READY
           "Written to systemPatterns.md#Profile-Upload"
```

### 3. Implementation

```
You: "@orchestrator Implement profile upload per systemPatterns.md"

Orchestrator: [Delegates to Backend, Frontend, E2E in sequence]

Backend: [STATUS] ✅ SUCCESS
Frontend: [STATUS] ✅ SUCCESS  
E2E: [STATUS] ✅ TESTS PASSED

Orchestrator: "✅ Profile upload complete!"
```

---

## Customization

### Adding New Skills
Create a new file in `.cursor/skills/your-skill.md` with:
```markdown
# Your Skill Name

## When to Use
- Trigger conditions

## Patterns
- Code examples
- Best practices
```

Then reference it in agent rules:
```markdown
| `@.cursor/skills/your-skill.md` | Purpose |
```

### Modifying Agent Behavior
Edit files in `.cursor/rules/` to:
- Change globs (file matching patterns)
- Add new anti-patterns
- Modify exit protocols
- Adjust mode detection logic
