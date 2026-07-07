#!/usr/bin/env bash
# Sets up a new auto-improve run.
# Usage: setup-run.sh
# Prints the run-id on stdout. Side effects:
#   - Cuts auto-improve/<run-id>/trunk from the configured trunk-base branch
#     (default: main; override via $AUTO_IMPROVE_TRUNK_BASE or
#     project.trunk_base in auto-improve.config.yaml)
#   - Creates docs/runs/<run-id>/{log.md,rejected_proposals/}
#   - Pre-condition: working tree must be clean

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if ! git diff-index --quiet HEAD --; then
  echo "ERROR: working tree is not clean. Commit or stash first." >&2
  exit 1
fi

scripts_dir="$(cd "$(dirname "$0")" && pwd)"

# Resolve trunk-base: env var > config field > "main".
if [[ -n "${AUTO_IMPROVE_TRUNK_BASE:-}" ]]; then
  trunk_base="$AUTO_IMPROVE_TRUNK_BASE"
elif [[ -f auto-improve.config.yaml ]]; then
  trunk_base="$(node "$scripts_dir/read-config.mjs" auto-improve.config.yaml project.trunk_base main)"
else
  trunk_base="main"
fi

if ! git rev-parse --verify --quiet "$trunk_base" >/dev/null; then
  echo "ERROR: trunk-base branch '$trunk_base' not found." >&2
  exit 1
fi

run_id="$("$scripts_dir/compute-run-id.sh")"
trunk="auto-improve/${run_id}/trunk"

git checkout "$trunk_base" >/dev/null 2>&1
git checkout -b "$trunk" >/dev/null 2>&1

mkdir -p "docs/runs/${run_id}/rejected_proposals"
cat > "docs/runs/${run_id}/log.md" <<EOF
# Auto-improve run ${run_id}

Started: $(date '+%Y-%m-%d %H:%M:%S')
Trunk: ${trunk}

---
EOF

echo "$run_id"
