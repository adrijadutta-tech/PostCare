/**
 * Node.js CLI test runner for PostCare triage tests
 * Run via: node tests/run-tests.js
 */
const { runTests } = require("./triage.test.js");

const results = runTests();

if (results.failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
