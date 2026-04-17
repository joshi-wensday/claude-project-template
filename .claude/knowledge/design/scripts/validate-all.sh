#!/usr/bin/env bash
# .claude/knowledge/design/scripts/validate-all.sh
# Validates all schema/example pairs in the design knowledge base.
# Run from repo root.

set -euo pipefail

SCHEMAS_DIR=".claude/knowledge/design/schemas"
EXAMPLES_DIR="$SCHEMAS_DIR/examples"

echo "Validating design schemas..."

for schema in "$SCHEMAS_DIR"/*.schema.json; do
  base=$(basename "$schema" .schema.json)
  valid="$EXAMPLES_DIR/$base.valid.json"
  invalid="$EXAMPLES_DIR/$base.invalid.json"

  if [[ -f "$valid" ]]; then
    echo "  -> $base: valid example must pass"
    npx -y ajv-cli@5 validate -s "$schema" -d "$valid" --spec=draft2020 >/dev/null
    echo "     OK"
  else
    echo "  !! $base: missing valid example"
    exit 1
  fi

  if [[ -f "$invalid" ]]; then
    echo "  -> $base: invalid example must fail"
    if npx -y ajv-cli@5 validate -s "$schema" -d "$invalid" --spec=draft2020 >/dev/null 2>&1; then
      echo "     FAIL: invalid example passed validation (schema too permissive)"
      exit 1
    else
      echo "     OK (correctly rejected)"
    fi
  else
    echo "  !! $base: missing invalid example"
    exit 1
  fi
done

echo ""
echo "All schemas validated."
