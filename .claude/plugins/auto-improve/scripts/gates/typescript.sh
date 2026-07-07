#!/usr/bin/env bash
# TypeScript gate. Reads typescript_command from auto-improve.config.yaml.
# Usage: typescript.sh <out-json-path>
# Writes JSON report to out-json-path. Exits 0 on pass, 1 on fail.

set -uo pipefail

out_path="${1:-/dev/null}"

# Get the command from config
ts_cmd=$(node -e "
const yaml = require('js-yaml');
const fs = require('fs');
const cfg = yaml.load(fs.readFileSync('auto-improve.config.yaml', 'utf8'));
process.stdout.write(cfg.project.typescript_command);
")

if [[ -z "$ts_cmd" ]]; then
  echo '{"gate":"typescript","status":"error","message":"no typescript_command"}' > "$out_path"
  exit 1
fi

output=$(eval "$ts_cmd" 2>&1)
exit_code=$?

if [[ $exit_code -eq 0 ]]; then
  cat > "$out_path" <<EOF
{"gate":"typescript","status":"pass","output":$(echo "$output" | jq -Rs .)}
EOF
  echo "PASS: typescript"
  exit 0
else
  cat > "$out_path" <<EOF
{"gate":"typescript","status":"fail","output":$(echo "$output" | jq -Rs .)}
EOF
  echo "FAIL: typescript"
  echo "$output"
  exit 1
fi
