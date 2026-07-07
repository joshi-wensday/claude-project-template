#!/usr/bin/env bash
# Computes the next run-id for today: YYYY-MM-DD-NN where NN is zero-padded
# and increments based on existing auto-improve/YYYY-MM-DD-* branches.
#
# Prints the run-id on stdout. No other output.

set -euo pipefail

today=$(date +%Y-%m-%d)
prefix="auto-improve/${today}-"

# List remote-tracking + local branches matching the prefix.
existing=$(git branch --list "${prefix}*" --format='%(refname:short)' \
  | grep -E "^auto-improve/${today}-[0-9]{2}$" \
  || true)

max=0
while IFS= read -r branch; do
  [[ -z "$branch" ]] && continue
  num="${branch##*-}"
  num="${num#0}"
  num="${num:-0}"
  if (( num > max )); then
    max=$num
  fi
done <<< "$existing"

next=$(( max + 1 ))
printf "%s-%02d\n" "$today" "$next"
