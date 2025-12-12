#!/bin/bash

set -e  # Exit on error

echo "=========================================="
echo "🚀 CURSOR AGENT DELEGATION SCRIPT"
echo "=========================================="
echo ""

# Debug: Show current directory
echo "📁 Working Directory: $(pwd)"
echo ""

# Load environment variables from .env file
echo "🔍 Checking for .env file..."
if [ -f .env ]; then
    echo "   ✓ .env file found"
    echo "   📄 .env contents (redacted):"
    # Show variable names without values for security
    grep -v '^#' .env | grep -v '^$' | cut -d'=' -f1 | while read var; do
        echo "      - $var=***"
    done
    echo ""
    echo "   🔑 Loading environment variables..."
    set -a  # Automatically export all variables
    source .env
    set +a
    echo "   ✓ Environment loaded"
else
    echo "   ⚠️  .env file NOT found"
fi
echo ""

# Check CURSOR_API_KEY specifically
echo "🔐 Checking CURSOR_API_KEY..."
if [ -z "$CURSOR_API_KEY" ]; then
    echo "   ❌ CURSOR_API_KEY is NOT set"
    echo ""
    echo "   To fix this, either:"
    echo "   1. Add CURSOR_API_KEY=your_key to .env file"
    echo "   2. Run: export CURSOR_API_KEY=your_key"
    echo "   3. Run: cursor-agent login"
    echo ""
else
    # Show first/last 4 chars for verification
    KEY_LENGTH=${#CURSOR_API_KEY}
    if [ $KEY_LENGTH -gt 8 ]; then
        KEY_PREVIEW="${CURSOR_API_KEY:0:4}...${CURSOR_API_KEY: -4}"
    else
        KEY_PREVIEW="***"
    fi
    echo "   ✓ CURSOR_API_KEY is set (${KEY_LENGTH} chars): $KEY_PREVIEW"
fi
echo ""

# Check cursor-agent CLI
echo "🔧 Checking cursor-agent CLI..."
if command -v cursor-agent &> /dev/null; then
    CURSOR_VERSION=$(cursor-agent --version 2>/dev/null || echo "unknown")
    echo "   ✓ cursor-agent found: $CURSOR_VERSION"
else
    echo "   ❌ cursor-agent CLI not found in PATH"
    echo "   PATH: $PATH"
    exit 1
fi
echo ""

# Parse arguments
AGENT_NAME=$1
TASK=$2

if [ -z "$AGENT_NAME" ]; then
    echo "❌ Error: No agent name provided"
    echo "Usage: ./scripts/call_agent.sh <agent_name> <task_description>"
    exit 1
fi

if [ -z "$TASK" ]; then
    echo "❌ Error: No task description provided"
    echo "Usage: ./scripts/call_agent.sh <agent_name> <task_description>"
    exit 1
fi

echo "🤖 Delegating to: $AGENT_NAME"
echo "📝 Task length: ${#TASK} characters"
echo ""

# Check rule file
RULE_FILE=".cursor/rules/$AGENT_NAME.mdc"
echo "📋 Checking agent rule file..."
if [ -f "$RULE_FILE" ]; then
    echo "   ✓ Found: $RULE_FILE"
else
    echo "   ❌ NOT found: $RULE_FILE"
    echo ""
    echo "   Available agents:"
    ls -1 .cursor/rules/*.mdc 2>/dev/null | while read f; do
        basename "$f" .mdc | sed 's/^/      - /'
    done
    exit 1
fi
echo ""

# Select model based on agent
echo "🧠 Selecting model..."
case "$AGENT_NAME" in
    orchestrator)
        SELECTED_MODEL="composer-1"
        ;;
    system-architect)
        SELECTED_MODEL="gpt-5.2-high"
        ;;
    *)
        SELECTED_MODEL="composer-1"
        ;;
esac
echo "   ✓ Model selected: $SELECTED_MODEL"
echo ""

# Execute
echo "=========================================="
echo "⚡ EXECUTING CURSOR-AGENT"
echo "=========================================="
echo ""

cursor-agent \
    --model "$SELECTED_MODEL" \
    --print "$TASK" \
    @$RULE_FILE \
    @memory-bank/activeContext.md \
    @memory-bank/productContext.md \
    --force \
    --output-format stream-json \
    | python3 scripts/format_agent.py

EXIT_CODE=$?

echo ""
echo "=========================================="
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ $AGENT_NAME completed successfully"
else
    echo "❌ $AGENT_NAME failed with exit code: $EXIT_CODE"
fi
echo "=========================================="

exit $EXIT_CODE
