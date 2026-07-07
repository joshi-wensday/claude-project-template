#!/usr/bin/env node
// Reads a YAML config file and prints the value at a dotted path.
// Usage: read-config.mjs <path-to-config.yaml> <dotted.path> [default]
// Exits 0 with the value on stdout. If the path is missing and no default
// is provided, exits 1 silently (so callers can `|| echo fallback`).

import { readFileSync } from "node:fs";
import yaml from "js-yaml";

const [, , configPath, dottedPath, defaultValue] = process.argv;

if (!configPath || !dottedPath) {
  console.error("Usage: read-config.mjs <config.yaml> <dotted.path> [default]");
  process.exit(2);
}

const config = yaml.load(readFileSync(configPath, "utf8"));
const value = dottedPath
  .split(".")
  .reduce((acc, key) => (acc == null ? undefined : acc[key]), config);

if (value === undefined || value === null) {
  if (defaultValue !== undefined) {
    console.log(defaultValue);
    process.exit(0);
  }
  process.exit(1);
}

console.log(value);
