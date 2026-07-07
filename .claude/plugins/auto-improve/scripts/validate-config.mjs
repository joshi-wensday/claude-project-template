#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, "..", "schemas", "config.schema.json");

const configPath = process.argv[2];
if (!configPath) {
  console.error("Usage: validate-config.mjs <path-to-config.yaml>");
  process.exit(2);
}

const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
const config = yaml.load(readFileSync(configPath, "utf8"));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

if (!validate(config)) {
  console.error("Config validation failed:");
  for (const err of validate.errors) {
    console.error(`  ${err.instancePath || "<root>"}: ${err.message}`);
  }
  process.exit(1);
}

console.log("Config valid.");
process.exit(0);
