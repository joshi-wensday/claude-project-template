#!/usr/bin/env bash
# Renames a pass branch into the rejected/ namespace.
# Usage: reject-pass.sh <run-id> <pass-branch> <pass-number> <scope> <proposal-slug>
# Prints the new (rejected) branch name on stdout.

set -euo pipefail

if [[ $# -ne 5 ]]; then
  echo "Usage: $0 <run-id> <pass-branch> <pass-number> <scope> <proposal-slug>" >&2
  exit 2
fi

run_id="$1"
old_branch="$2"
pass_num="$(printf "%02d" "$3")"
scope="$4"
proposal="$5"
trunk="auto-improve/${run_id}/trunk"
new_branch="auto-improve/${run_id}/rejected/${pass_num}-${scope}-${proposal}"

cd "$(git rev-parse --show-toplevel)"
git checkout "$trunk" >/dev/null 2>&1
git branch -m "$old_branch" "$new_branch"
echo "$new_branch"
