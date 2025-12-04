#!/bin/bash

# Usage: ./scripts/call_agent.sh <agent_name> <task_description>
AGENT_NAME=$1
TASK=$2

echo "🤖 Orchestrator delegating to: $AGENT_NAME..."

# 1. Define the Persona File
RULE_FILE=".cursor/rules/$AGENT_NAME.mdc"

# 2. Check if rule file exists
if [ ! -f "$RULE_FILE" ]; then
    echo "❌ Error: Agent rule file $RULE_FILE not found."
    exit 1
fi

# 3. Execute Cursor Agent Headless
# - We pass the specific agent's persona (@$RULE_FILE)
# - We pass the Memory Bank so they share the same brain (@memory-bank/...)
# - --force allows it to run without asking you for permission every time
cursor-agent chat "$TASK" \
    @$RULE_FILE \
    @memory-bank/activeContext.md \
    @memory-bank/productContext.md \
    --force

echo "✅ $AGENT_NAME finished."
