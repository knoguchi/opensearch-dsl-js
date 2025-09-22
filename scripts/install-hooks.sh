#!/bin/bash

# Script to install git hooks for the opensearch-dsl-js project

echo "Installing git hooks..."

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Install pre-commit hook for emoji checking
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Pre-commit hook to check for emojis in code
# This hook prevents commits that contain emoji characters

echo "Checking for emojis in staged files..."

# Get list of staged files (excluding deleted files)
staged_files=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$staged_files" ]; then
    echo "No staged files to check."
    exit 0
fi

# Check for emoji patterns in staged files
emoji_found=false
emoji_pattern='[\x{1F600}-\x{1F64F}\x{1F300}-\x{1F5FF}\x{1F680}-\x{1F6FF}\x{1F700}-\x{1F77F}\x{1F780}-\x{1F7FF}\x{1F800}-\x{1F8FF}\x{1F900}-\x{1F9FF}\x{1FA00}-\x{1FA6F}\x{1FA70}-\x{1FAFF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}]'

for file in $staged_files; do
    # Skip the git hook scripts themselves (they contain emoji patterns for detection)
    if [[ "$file" == *"install-hooks.sh"* ]] || [[ "$file" == *"hooks/"* ]]; then
        continue
    fi

    if [ -f "$file" ]; then
        # Check if file contains emojis using perl regex
        if perl -ne "print if /$emoji_pattern/;" "$file" | grep -q .; then
            echo "ERROR: Emoji found in $file"
            emoji_found=true
        fi

        # Also check for common emoji text patterns
        if grep -E '(✅|❌|🔄|⏳|🎯|🚀|💡|⚠️|📝|🔧|🎨|🐛|✨|🔥|💥|📦|🏗️|👍|👎|🎉|💪)' "$file" > /dev/null 2>&1; then
            echo "ERROR: Text emoji found in $file"
            emoji_found=true
        fi
    fi
done

if [ "$emoji_found" = true ]; then
    echo ""
    echo "Commit rejected: Emojis are not allowed in this codebase."
    echo "Please remove all emojis from your changes and try again."
    echo ""
    echo "This includes:"
    echo "- Unicode emoji characters (😀, 🚀, etc.)"
    echo "- Text-based emojis (✅, ❌, 🔄, etc.)"
    echo ""
    exit 1
fi

echo "No emojis found. Commit allowed."
exit 0
EOF

# Make the hook executable
chmod +x .git/hooks/pre-commit

echo "Git hooks installed successfully!"
echo "The pre-commit hook will now check for emojis in all commits."