import sys
import json

# ANSI Colors
BLUE = "\033[94m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
RESET = "\033[0m"
DIM = "\033[90m"
MAGENTA = "\033[95m"

def clean_text(text_obj):
    """Extract text from various nested formats"""
    if isinstance(text_obj, dict) and "content" in text_obj:
        try:
            # Handle content array: [{"type": "text", "text": "..."}]
            items = text_obj["content"]
            if isinstance(items, list):
                return " ".join([i.get("text", "") for i in items if i.get("type") == "text"])
            return str(items)
        except:
            return str(text_obj)
    return str(text_obj) if text_obj is not None else ""

def extract_args(data):
    """Extract args from the 'tool_call' object found in debug logs"""
    # The debug logs showed a 'tool_call' key.
    tc = data.get("tool_call", {})
    
    # It likely has 'name' and 'arguments' or 'function' inside
    if isinstance(tc, dict):
        # Try standard function calling format
        if "function" in tc:
            return f"{tc['function'].get('name')} {tc['function'].get('arguments')}"
        
        # Try direct arguments
        args = tc.get("arguments") or tc.get("args") or ""
        name = tc.get("name") or ""
        
        # If args is a JSON string, prettify it slightly
        if isinstance(args, str) and args.startswith("{"):
            try:
                parsed = json.loads(args)
                # If it's just a 'command' key (common for shell tools), show that
                if "command" in parsed: return parsed["command"]
                return str(parsed)
            except:
                pass
        
        return f"{name} {args}".strip()

    return str(tc)

def main():
    print(f"{DIM}--- Agent Stream Started ---{RESET}")
    
    last_type = None
    
    for line in sys.stdin:
        try:
            if not line.strip(): continue
            data = json.loads(line)
            
            event_type = data.get("type")
            
            # 1. ASSISTANT MESSAGES (The real thoughts!)
            if event_type == "assistant":
                # This contains the text like "Reading the file..."
                msg = data.get("message", {})
                content = clean_text(msg)
                if content:
                    print(f"\n{GREEN}{content}{RESET}")
                last_type = "text"

            # 2. TOOL CALLS
            elif event_type == "tool_call" or event_type == "command":
                args = extract_args(data)
                # Fallback if extraction failed but we have a top-level name
                name = data.get("name", "tool")
                
                print(f"{CYAN}🛠  [TOOL]: {RESET}{MAGENTA}{args or name}{RESET}")
                last_type = "tool"

            # 3. THINKING DOTS (Keep these minimal now that we have assistant text)
            elif event_type == "thinking":
                if last_type != "thinking":
                     print(f"{YELLOW}.{RESET}", end="", flush=True)
                else:
                     print(f"{YELLOW}.{RESET}", end="", flush=True)
                last_type = "thinking"

            # 4. USER
            elif event_type == "user":
                print(f"\n{BLUE}👤 [USER]:{RESET} Task Received")

        except Exception:
            continue
            
    print(f"\n{DIM}--- Agent Finished ---{RESET}")

if __name__ == "__main__":
    main()
