#!/usr/bin/env node

/**
 * Lightweight TS runner that compiles modules to CommonJS via ts-node.
 * Avoids the IPC requirement of `tsx`, so it works inside restricted sandboxes.
 */

const path = require("path");

const target = process.argv[2];

if (!target) {
  console.error("Usage: node scripts/run-ts.cjs <path-to-ts-file>");
  process.exit(1);
}

// Force compiler options compatible with ts-node/register + CommonJS runtime.
process.env.TS_NODE_COMPILER_OPTIONS =
  process.env.TS_NODE_COMPILER_OPTIONS ??
  JSON.stringify({
    module: "CommonJS",
    moduleResolution: "node",
  });

// Skip type-checking for faster startup and to avoid tsconfig conflicts.
if (!process.env.TS_NODE_TRANSPILE_ONLY) {
  process.env.TS_NODE_TRANSPILE_ONLY = "true";
}

require("ts-node/register");

const resolved = path.resolve(process.cwd(), target);

// Align argv with the target script so it behaves as if run directly.
process.argv = [process.argv[0], resolved, ...process.argv.slice(3)];

require(resolved);
