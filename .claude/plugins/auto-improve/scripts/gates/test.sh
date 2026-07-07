#!/usr/bin/env bash
# Test gate. Same pattern as typescript.sh but uses test_command.
set -uo pipefail

out_path="${1:-/dev/null}"

cmd=$(node -e "
const yaml = require('js-yaml');
const fs = require('fs');
const cfg = yaml.load(fs.readFileSync('auto-improve.config.yaml', 'utf8'));
process.stdout.write(cfg.project.test_command);
")

if [[ -z "$cmd" ]]; then
  echo '{"gate":"test","status":"error","message":"no test_command"}' > "$out_path"
  exit 1
fi

output=$(eval "$cmd" 2>&1)
exit_code=$?

if [[ $exit_code -eq 0 ]]; then
  cat > "$out_path" <<EOF
{"gate":"test","status":"pass","output":$(echo "$output" | jq -Rs .)}
EOF
  echo "PASS: test"
  exit 0
else
  cat > "$out_path" <<EOF
{"gate":"test","status":"fail","output":$(echo "$output" | jq -Rs .)}
EOF
  echo "FAIL: test"
  echo "$output"
  exit 1
fi
