#!/usr/bin/env bash
# Merges a pass branch back into trunk with --no-ff and a structured message.
# Usage: accept-pass.sh <run-id> <pass-branch> <pass-number> <scope> <proposal-slug>
# Prints the merge commit SHA on stdout.

set -euo pipefail

if [[ $# -ne 5 ]]; then
  echo "Usage: $0 <run-id> <pass-branch> <pass-number> <scope> <proposal-slug>" >&2
  exit 2
fi

run_id="$1"
branch="$2"
pass_num="$3"
scope="$4"
proposal="$5"
trunk="auto-improve/${run_id}/trunk"

cd "$(git rev-parse --show-toplevel)"
git checkout "$trunk" >/dev/null 2>&1
git merge --no-ff -m "Pass ${pass_num} — ${scope} — ${proposal}" "$branch" >/dev/null
git rev-parse HEAD
