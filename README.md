# 🤖 Cursor Multi-Agent System Template

A reusable boilerplate for setting up a multi-agent AI development system in Cursor IDE. Designed for React Native + Expo + Node.js projects, but adaptable to any stack.

[![Use this template](https://img.shields.io/badge/Use%20this-template-blue?style=for-the-badge)](../../generate)

---

## ✨ Features

- **5 Specialized Agents** - Orchestrator, Architect, Frontend, Backend, E2E
- **Interactive Design Mode** - Human-in-the-loop for architectural decisions
- **Automated Implementation** - Contract-driven code generation
- **Skill Injection System** - Modular knowledge that agents can load
- **Memory Bank Integration** - Persistent project context across sessions
- **Context7 Support** - Real-time library documentation lookup

---

## 🚀 Quick Start

### Option 1: Use GitHub Template
1. Click **"Use this template"** button above
2. Clone your new repo
3. Run the init script:
   ```bash
   ./scripts/init-cursor-agents.sh
   ```

### Option 2: Add to Existing Project
```bash
# Download and run the init script
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/cursor-agents-template/main/scripts/init-cursor-agents.sh | bash
```

### Option 3: Manual Setup
Copy these directories to your project:
- `.cursor/rules/` - Agent definitions
- `.cursor/skills/` - Knowledge modules
- `scripts/call_agent.sh` - Delegation script

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER REQUEST                             │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────┐
│                        🎯 ORCHESTRATOR                            │
│  • Analyzes request                                               │
│  • Checks for existing contracts                                  │
│  • Decides: Interactive or Automated mode                         │
└───────────────────────────────┬───────────────────────────────────┘
                                │
              ┌─────────────────┴─────────────────┐
              │                                   │
              ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│   🗣️ INTERACTIVE        │         │   ⚡ AUTOMATED           │
│   (Design Session)       │         │   (Implementation)       │
│                         │         │                         │
│   User ↔ Architect      │         │   call_agent.sh →       │
│   dialog until          │         │   Frontend/Backend/E2E  │
│   blueprint approved    │         │                         │
└─────────────────────────┘         └─────────────────────────┘
              │                                   │
              └─────────────────┬─────────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │  📋 MEMORY BANK     │
                    │  (Persistent State)  │
                    └─────────────────────┘
```

---

## 👥 Agent Directory

| Agent | File | Invoke | Responsibility |
|-------|------|--------|----------------|
| 🎯 **Orchestrator** | `orchestrator.mdc` | `@orchestrator` | Workflow coordination, task delegation, mode detection |
| 🏛️ **System Architect** | `system-architect.mdc` | `@system-architect` | Design sessions, specifications, API contracts |
| 📱 **Frontend** | `frontend.mdc` | `@frontend` | React Native screens, components, navigation |
| ⚙️ **Backend** | `backend.mdc` | `@backend` | Node.js APIs, database models, business logic |
| 🧪 **E2E** | `e2e.mdc` | `@e2e` | Playwright/Detox tests, integration tests |

---

## 📚 Skills Library

Skills are modular knowledge files that agents load when needed:

| Skill | File | Used By |
|-------|------|---------|
| Frontend Development | `frontend-development.md` | Frontend |
| Backend Development | `backend-development.md` | Backend |
| Security Compliance | `security-compliance.md` | Architect, Backend |
| Database Design | `database-design.md` | Architect, Backend |
| Accessibility | `accessibility-compliance.md` | Frontend, E2E |

---

## 🔄 Workflow Examples

### Example 1: New Feature (Interactive Mode)

```
You: "I want to add user authentication with Google OAuth"

Orchestrator: "This needs design decisions. Handing off to System Architect..."
              "👉 Invoke: @system-architect I want Google OAuth login"

You: "@system-architect I want Google OAuth login"

Architect: "Before I design this, some questions:
           1. Account linking with existing users?
           2. Also need Apple Sign-In?
           3. Token storage preference?"
           [STATUS] ⏸️ AWAITING INPUT

You: "Yes linking, yes Apple, use SecureStore"

Architect: "Here's my proposal: [design]
           Does this look right?"
           [STATUS] ⏸️ AWAITING APPROVAL

You: "Approved"

Architect: [STATUS] ✅ BLUEPRINT READY
           "systemPatterns.md updated"

You: "@orchestrator Implement OAuth per systemPatterns.md#OAuth"

Orchestrator: [Delegates to Backend, Frontend, E2E]
```

### Example 2: Implementation Task (Automated Mode)

```
You: "@orchestrator Add a loading spinner to the login button"

Orchestrator: [Checks systemPatterns.md - contract exists for LoginButton]
              "Contract found. Delegating to Frontend..."
              
              ./scripts/call_agent.sh frontend "
              [OBJECTIVE] Add loading spinner to LoginButton
              [CONTEXT] See systemPatterns.md#Auth for button interface
              [CRITERIA] Show spinner during auth request, disable button
              "

Frontend: [STATUS] ✅ SUCCESS
          [FILES] src/components/LoginButton.tsx
          [SUMMARY] Added loading state with ActivityIndicator
```

---

## 📁 File Structure

```
your-project/
├── .cursor/
│   ├── rules/                    # Agent definitions
│   │   ├── orchestrator.mdc
│   │   ├── system-architect.mdc
│   │   ├── frontend.mdc
│   │   ├── backend.mdc
│   │   └── e2e.mdc
│   └── skills/                   # Knowledge modules
│       ├── frontend-development.md
│       ├── backend-development.md
│       ├── security-compliance.md
│       └── database-design.md
├── scripts/
│   ├── init-cursor-agents.sh     # Setup script
│   └── call_agent.sh             # Delegation script
├── .cursorrules                  # Project-wide Cursor rules
└── AGENTS.md                     # Usage documentation
```

---

## 🔧 Configuration

### Required MCP Servers

| MCP Server | Purpose | Required |
|------------|---------|----------|
| **Memory Bank** | Persistent project memory | Recommended |
| **Context7** | Real-time library docs | Optional |

### Customization

1. **Adjust Globs** - Edit `globs:` in rule files to match your directory structure
2. **Add Skills** - Create new `.md` files in `.cursor/skills/`
3. **Modify Workflows** - Edit agent rules to fit your process
4. **Stack Variants** - Run `init-cursor-agents.sh` and select your stack

---

## 📖 Memory Bank Files

Memory Bank is an **external MCP server** - files are stored in the MCP, not in your repo.

| File | Purpose | Owner |
|------|---------|-------|
| `projectBrief.md` | High-level project requirements | Architect |
| `productContext.md` | User stories, business logic | Architect |
| `systemPatterns.md` | **API contracts**, interfaces, schemas | Architect |
| `techContext.md` | Technology stack, constraints | Architect |
| `activeContext.md` | Current sprint, in-progress work | Orchestrator |
| `progress.md` | Changelog, milestones | Orchestrator |

See `AGENTS.md` for setup instructions and file structure examples.

---

## 🎛️ Mode Detection Logic

The Orchestrator uses these rules to determine mode:

**→ Interactive Mode (Design Session)**
- No contract in `systemPatterns.md`
- Architectural decision required
- Security-sensitive feature
- Ambiguous requirements
- Cost implications

**→ Automated Mode (Direct Delegation)**
- Contract exists
- Requirements are specific
- Implementation only
- Similar patterns exist

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your improvements
4. Submit a pull request

### Ideas for Contribution
- [ ] Additional agent types (DevOps, Documentation)
- [ ] More skill files (GraphQL, Testing Patterns)
- [ ] Stack variants (Flutter, Next.js, Django)
- [ ] Cursor extension for one-click setup

---

## 📄 License

MIT License - feel free to use in personal and commercial projects.

---

## 🙏 Acknowledgments

- Inspired by the need for structured AI-assisted development
- Built for the Cursor IDE ecosystem
- Uses MCP (Model Context Protocol) for tool integration

