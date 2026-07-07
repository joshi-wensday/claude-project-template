#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, "..", "schemas", "backlog.schema.json");

const backlogPath = process.argv[2];
if (!backlogPath) {
  console.error("Usage: validate-backlog.mjs <path-to-backlog.yaml>");
  process.exit(2);
}

const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
const backlog = yaml.load(readFileSync(backlogPath, "utf8"));

const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

if (!validate(backlog)) {
  console.error("Backlog validation failed:");
  for (const err of validate.errors) {
    console.error(`  ${err.instancePath || "<root>"}: ${err.message}`);
  }
  process.exit(1);
}

const slugs = backlog.scopes.map((s) => s.slug);
const dupSlugs = slugs.filter((s, i) => slugs.indexOf(s) !== i);
if (dupSlugs.length > 0) {
  console.error(`Duplicate slugs found: ${[...new Set(dupSlugs)].join(", ")}`);
  process.exit(1);
}

console.log("Backlog valid.");
process.exit(0);
