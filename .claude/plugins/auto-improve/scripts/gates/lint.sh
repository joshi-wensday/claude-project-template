#!/usr/bin/env bash
# Lint gate. Same pattern as typescript.sh but uses lint_command.
set -uo pipefail

out_path="${1:-/dev/null}"

cmd=$(node -e "
const yaml = require('js-yaml');
const fs = require('fs');
const cfg = yaml.load(fs.readFileSync('auto-improve.config.yaml', 'utf8'));
process.stdout.write(cfg.project.lint_command);
")

if [[ -z "$cmd" ]]; then
  echo '{"gate":"lint","status":"error","message":"no lint_command"}' > "$out_path"
  exit 1
fi

output=$(eval "$cmd" 2>&1)
exit_code=$?

if [[ $exit_code -eq 0 ]]; then
  cat > "$out_path" <<EOF
{"gate":"lint","status":"pass","output":$(echo "$output" | jq -Rs .)}
EOF
  echo "PASS: lint"
  exit 0
else
  cat > "$out_path" <<EOF
{"gate":"lint","status":"fail","output":$(echo "$output" | jq -Rs .)}
EOF
  echo "FAIL: lint"
  echo "$output"
  exit 1
fi
