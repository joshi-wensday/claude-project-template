#!/usr/bin/env bash
# Creates a pass branch off the current trunk.
# Usage: start-pass.sh <run-id> <pass-number> <scope-slug> <proposal-slug>
# Prints the new branch name on stdout.

set -euo pipefail

if [[ $# -ne 4 ]]; then
  echo "Usage: $0 <run-id> <pass-number> <scope-slug> <proposal-slug>" >&2
  exit 2
fi

run_id="$1"
pass_num="$(printf "%02d" "$2")"
scope="$3"
proposal="$4"

trunk="auto-improve/${run_id}/trunk"
branch="auto-improve/${run_id}/passes/${pass_num}-${scope}-${proposal}"

cd "$(git rev-parse --show-toplevel)"
git checkout "$trunk" >/dev/null 2>&1
git checkout -b "$branch" >/dev/null 2>&1
echo "$branch"
