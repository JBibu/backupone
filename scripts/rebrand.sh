#!/bin/bash

# Rebranding script: Zerobyte -> C3i Backup ONE
# This script replaces only USER-VISIBLE strings (display text)
# It does NOT modify code identifiers, package names, or internal references

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Show help message
show_help() {
    echo "Rebranding Script: Zerobyte -> C3i Backup ONE"
    echo ""
    echo "Usage: ./scripts/rebrand.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --dry-run    Preview changes without modifying any files"
    echo "  --help       Show this help message"
    echo ""
    echo "What this script changes:"
    echo "  - 'Zerobyte' (capital Z) -> 'C3i Backup ONE' in docs and code"
    echo "  - This includes JSX text, quoted strings, and documentation"
    echo ""
    echo "What this script does NOT change:"
    echo "  - Lowercase 'zerobyte' (function names, variables, paths)"
    echo "  - Package names (package.json)"
    echo "  - Config files (Cargo.toml, docker-compose.yml, etc.)"
    echo ""
    echo "Excluded paths:"
    echo "  - node_modules/"
    echo "  - .git/"
    echo "  - dist/"
    echo "  - Binary files (images, fonts, etc.)"
    echo ""
    echo "Examples:"
    echo "  ./scripts/rebrand.sh --dry-run   # Preview changes"
    echo "  ./scripts/rebrand.sh             # Apply changes"
}

# Handle --help flag
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    show_help
    exit 0
fi

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${YELLOW}Rebranding Zerobyte to C3i Backup ONE${NC}"
echo "Project root: $PROJECT_ROOT"
echo ""

# Dry run mode
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}DRY RUN MODE - No changes will be made${NC}"
    echo ""
fi

# Files to skip (config files, package manifests, etc.)
SKIP_FILES=(
    "package.json"
    "package-lock.json"
    "bun.lock"
    "tsconfig.json"
    "drizzle.config.ts"
    "tauri.conf.json"
    "Cargo.toml"
    "Cargo.lock"
    ".env"
    ".env.example"
    "docker-compose.yml"
    "mutagen.yml"
    "rebrand.sh"
)

should_skip_file() {
    local filename=$(basename "$1")
    for skip in "${SKIP_FILES[@]}"; do
        if [[ "$filename" == "$skip" ]]; then
            return 0
        fi
    done
    return 1
}

# Replace "Zerobyte" (capital Z only) in all eligible files
# This catches: JSX text, quoted strings, comments, documentation
replace_zerobyte() {
    echo -e "${GREEN}Replacing 'Zerobyte' -> 'C3i Backup ONE'...${NC}"
    echo ""

    find "$PROJECT_ROOT" -type f \
        \( -name "*.md" -o -name "*.html" -o -name "*.txt" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
        -not -path "*/node_modules/*" \
        -not -path "*/.git/*" \
        -not -path "*/dist/*" \
        -print0 2>/dev/null | \
    while IFS= read -r -d '' file; do
        if should_skip_file "$file"; then
            continue
        fi

        # Check if file contains "Zerobyte" as a standalone word (not part of identifier)
        # \b = word boundary, so "getZerobytePath" won't match, but "Zerobyte" will
        if grep -qE '\bZerobyte\b' "$file" 2>/dev/null; then
            if [[ "$DRY_RUN" == "true" ]]; then
                echo "  Would modify: ${file#$PROJECT_ROOT/}"
                # Show matching lines
                grep -nE '\bZerobyte\b' "$file" 2>/dev/null | head -5 | sed 's/^/    /'
            else
                # Replace only "Zerobyte" as standalone word, not as part of identifiers
                sed -i 's/\bZerobyte\b/C3i Backup ONE/g' "$file"
                echo "  Modified: ${file#$PROJECT_ROOT/}"
            fi
        fi
    done
    echo ""
}

# Run the replacement
replace_zerobyte

echo -e "${GREEN}Done!${NC}"

if [[ "$DRY_RUN" == "true" ]]; then
    echo ""
    echo -e "${YELLOW}This was a dry run. Run without --dry-run to apply changes.${NC}"
else
    echo ""
    echo -e "${YELLOW}Note:${NC}"
    echo "  Only 'Zerobyte' (capital Z) was replaced."
    echo "  Lowercase 'zerobyte' (identifiers, paths) were NOT modified."
fi
