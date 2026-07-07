#!/usr/bin/env node
// Checks all stop conditions. Exits 0 = continue, exits 1 = stop (with reason on stdout).
// Usage: check-stop-conditions.mjs <run-start-iso> <wall-clock-hours> <backlog-empty-flag>

import { existsSync } from "node:fs";
import { resolve } from "node:path";

const [, , startIso, hoursStr, backlogEmpty] = process.argv;
if (!startIso || !hoursStr) {
  console.error("Usage: check-stop-conditions.mjs <start-iso> <wall-clock-hours> <backlog-empty>");
  process.exit(2);
}

const start = new Date(startIso);
const hours = Number(hoursStr);
const elapsedHours = (Date.now() - start.getTime()) / (1000 * 60 * 60);

if (elapsedHours >= hours) {
  console.log(`STOP: wall_clock (${elapsedHours.toFixed(2)}h elapsed >= ${hours}h budget)`);
  process.exit(1);
}

if (existsSync(resolve("STOP"))) {
  console.log("STOP: STOP file present");
  process.exit(1);
}

if (backlogEmpty === "true") {
  console.log("STOP: backlog empty");
  process.exit(1);
}

console.log("CONTINUE");
process.exit(0);
