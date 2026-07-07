#!/usr/bin/env node
// Determines whether a scope should be advanced based on the last N accepted-pass scores.
// Usage: scope-advance-check.mjs <threshold> <window> <comma-separated-scores>
// Exits 0 with "ADVANCE" or "STAY".

const [, , thresholdStr, windowStr, scoresStr] = process.argv;
if (!thresholdStr || !windowStr || scoresStr === undefined) {
  console.error("Usage: scope-advance-check.mjs <threshold> <window> <comma-separated-scores>");
  process.exit(2);
}

const threshold = Number(thresholdStr);
const window = Number(windowStr);
const scores = scoresStr ? scoresStr.split(",").map(Number) : [];

if (scores.length < window) {
  console.log("STAY");
  process.exit(0);
}

const recent = scores.slice(-window);
const delta = recent[recent.length - 1] - recent[0];

if (delta < threshold) {
  console.log(`ADVANCE (delta=${delta.toFixed(2)} < threshold=${threshold})`);
} else {
  console.log(`STAY (delta=${delta.toFixed(2)} >= threshold=${threshold})`);
}
process.exit(0);
