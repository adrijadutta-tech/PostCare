/**
 * PostCare Triage Unit Tests
 * Tests all triage rules (R1 to R12) with explicit boundary cases:
 * - Temperature: 37.9°C vs 38.0°C
 * - EPDS Scores: 9, 10, 12, 13
 * - EPDS Item 10: 0 vs 1, 2, 3 (Self-harm trigger)
 * - Trend Rule: Mild symptom worsening from previous check-in
 * - Severity Priority: RED over AMBER over GREEN
 * - Clinical disclaimer check
 */

const { evaluateTriage, CLINICAL_DISCLAIMER } = require("../js/triageRules");

const testCases = [
  // 1. Boundary: Temperature (37.9 C vs 38.0 C)
  {
    name: "Boundary Temp 37.9 C -> GREEN (under 38.0 C threshold)",
    input: {
      bleeding: "no",
      fever: "no",
      temperature: 37.9,
      headache_vision: "no",
      breathing_chest: "no",
      wound_pain: "no",
      baby_feeding: "feeding_well",
      general_mood: "mood_good"
    },
    prev: null,
    expectedLevel: "GREEN",
    expectedRule: "R12"
  },
  {
    name: "Boundary Temp 38.0 C -> AMBER [R6] (exact fever threshold)",
    input: {
      bleeding: "no",
      fever: "yes",
      temperature: 38.0,
      headache_vision: "no",
      breathing_chest: "no",
      wound_pain: "no"
    },
    prev: null,
    expectedLevel: "AMBER",
    expectedRule: "R6"
  },
  {
    name: "High fever 38.5 C -> AMBER [R6]",
    input: {
      bleeding: "no",
      fever: "yes",
      temperature: 38.5,
      headache_vision: "no",
      breathing_chest: "no",
      wound_pain: "no"
    },
    prev: null,
    expectedLevel: "AMBER",
    expectedRule: "R6"
  },

  // 2. Boundary: EPDS Total Score (9, 10, 12, 13)
  {
    name: "Boundary EPDS score = 9 -> GREEN (normal range, below 10)",
    input: {
      epds_total: 9,
      epds_item_10: 0,
      bleeding: "no",
      fever: "no",
      headache_vision: "no",
      breathing_chest: "no",
      wound_pain: "no"
    },
    prev: null,
    expectedLevel: "GREEN",
    expectedRule: "R12"
  },
  {
    name: "Boundary EPDS score = 10 -> AMBER [R11] (lower cutoff for mild distress)",
    input: {
      epds_total: 10,
      epds_item_10: 0,
      bleeding: "no",
      fever: "no"
    },
    prev: null,
    expectedLevel: "AMBER",
    expectedRule: "R11"
  },
  {
    name: "Boundary EPDS score = 12 -> AMBER [R11] (upper cutoff for mild distress)",
    input: {
      epds_total: 12,
      epds_item_10: 0,
      bleeding: "no",
      fever: "no"
    },
    prev: null,
    expectedLevel: "AMBER",
    expectedRule: "R11"
  },
  {
    name: "Boundary EPDS score = 13 -> RED [R5] (probable depression cutoff)",
    input: {
      epds_total: 13,
      epds_item_10: 0,
      bleeding: "no",
      fever: "no"
    },
    prev: null,
    expectedLevel: "RED",
    expectedRule: "R5"
  },
  {
    name: "High EPDS score = 18 -> RED [R5]",
    input: {
      epds_total: 18,
      epds_item_10: 0
    },
    prev: null,
    expectedLevel: "RED",
    expectedRule: "R5"
  },

  // 3. Boundary: EPDS Item 10 (Self-harm thoughts)
  {
    name: "EPDS Item 10 = 0 with score 4 -> GREEN [R12]",
    input: {
      epds_total: 4,
      epds_item_10: 0
    },
    prev: null,
    expectedLevel: "GREEN",
    expectedRule: "R12"
  },
  {
    name: "EPDS Item 10 = 1 (Hardly ever) -> IMMEDIATE RED [R4] regardless of total score",
    input: {
      epds_total: 4,
      epds_item_10: 1
    },
    prev: null,
    expectedLevel: "RED",
    expectedRule: "R4"
  },
  {
    name: "EPDS Item 10 = 3 (Quite often) -> IMMEDIATE RED [R4]",
    input: {
      epds_total: 15,
      epds_item_10: 3
    },
    prev: null,
    expectedLevel: "RED",
    expectedRule: "R4"
  },

  // 4. Red Emergency Symptoms (R1, R2, R3)
  {
    name: "Rule R1: Chest pain & severe trouble breathing -> RED [R1]",
    input: {
      breathing_chest: "yes",
      breathing_details: "chest_pain_severe_dyspnea"
    },
    prev: null,
    expectedLevel: "RED",
    expectedRule: "R1"
  },
  {
    name: "Rule R2: Soaking pad in an hour -> RED [R2]",
    input: {
      bleeding: "yes",
      bleeding_pad_rate: "soaking_hour"
    },
    prev: null,
    expectedLevel: "RED",
    expectedRule: "R2"
  },
  {
    name: "Rule R2: Passing large clots (> coin/lemon size) -> RED [R2]",
    input: {
      bleeding: "yes",
      bleeding_clots: "yes_large_clots"
    },
    prev: null,
    expectedLevel: "RED",
    expectedRule: "R2"
  },
  {
    name: "Rule R3: Severe headache with vision changes -> RED [R3]",
    input: {
      headache_vision: "yes",
      headache_type: "severe_with_vision"
    },
    prev: null,
    expectedLevel: "RED",
    expectedRule: "R3"
  },

  // 5. Amber Warning Symptoms (R7, R8, R9)
  {
    name: "Rule R7: Heavier bleeding than normal period -> AMBER [R7]",
    input: {
      bleeding: "yes",
      bleeding_pad_rate: "heavier_than_period"
    },
    prev: null,
    expectedLevel: "AMBER",
    expectedRule: "R7"
  },
  {
    name: "Rule R7: Foul-smelling vaginal discharge -> AMBER [R7]",
    input: {
      bleeding: "yes",
      bleeding_odor: "foul_smell"
    },
    prev: null,
    expectedLevel: "AMBER",
    expectedRule: "R7"
  },
  {
    name: "Rule R8: Persistent headache -> AMBER [R8]",
    input: {
      headache_vision: "yes",
      headache_type: "persistent_dull_headache"
    },
    prev: null,
    expectedLevel: "AMBER",
    expectedRule: "R8"
  },
  {
    name: "Rule R8: One-sided leg swelling/pain -> AMBER [R8]",
    input: {
      wound_pain: "yes",
      wound_signs: "leg_dvt_signs"
    },
    prev: null,
    expectedLevel: "AMBER",
    expectedRule: "R8"
  },
  {
    name: "Rule R9: Wound redness and pus discharge -> AMBER [R9]",
    input: {
      wound_pain: "yes",
      wound_signs: "infection_signs"
    },
    prev: null,
    expectedLevel: "AMBER",
    expectedRule: "R9"
  },

  // 6. Trend Rule: R10 (Mild symptom worse than last check-in)
  {
    name: "Rule R10: Wound pain reported as worse than last check-in -> AMBER [R10]",
    input: {
      wound_pain: "yes",
      wound_signs: "healing_tenderness",
      wound_pain_trend: "worse_than_last_week"
    },
    prev: {
      answers: {
        wound_pain: "yes",
        wound_signs: "healing_tenderness",
        wound_pain_trend: "same_as_last_week"
      }
    },
    expectedLevel: "AMBER",
    expectedRule: "R10"
  },
  {
    name: "Rule R10: Pain score escalated from 2 to 6 -> AMBER [R10]",
    input: {
      wound_pain: "yes",
      pain_score: 6
    },
    prev: {
      answers: {
        wound_pain: "yes",
        pain_score: 2
      }
    },
    expectedLevel: "AMBER",
    expectedRule: "R10"
  },

  // 7. Highest Severity Wins (Priority resolution)
  {
    name: "Priority check: Fever 38.5 C (AMBER) + Soaking Pad in hour (RED) -> RED [R2] wins",
    input: {
      fever: "yes",
      temperature: 38.5,
      bleeding: "yes",
      bleeding_pad_rate: "soaking_hour"
    },
    prev: null,
    expectedLevel: "RED",
    expectedRule: "R2"
  },
  {
    name: "Priority check: EPDS total 11 (AMBER) + Item 10 = 2 (RED) -> RED [R4] wins",
    input: {
      epds_total: 11,
      epds_item_10: 2
    },
    prev: null,
    expectedLevel: "RED",
    expectedRule: "R4"
  },

  // 8. Routine Green Case & Disclaimer Check
  {
    name: "Rule R12: All healthy responses -> GREEN [R12]",
    input: {
      bleeding: "no",
      fever: "no",
      headache_vision: "no",
      breathing_chest: "no",
      wound_pain: "no",
      baby_feeding: "feeding_well",
      general_mood: "mood_good"
    },
    prev: null,
    expectedLevel: "GREEN",
    expectedRule: "R12"
  }
];

function runTests() {
  console.log("==================================================");
  console.log("     POSTCARE TRIAGE RULE ENGINE UNIT TESTS       ");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    const result = evaluateTriage(tc.input, tc.prev);
    const levelMatch = result.level === tc.expectedLevel;
    const ruleMatch = result.ruleId === tc.expectedRule;
    const hasDisclaimer = typeof result.disclaimer === "string" && result.disclaimer.length > 10;
    const hasWhyLine = typeof result.whyLine === "string" && result.whyLine.length > 5;

    if (levelMatch && ruleMatch && hasDisclaimer && hasWhyLine) {
      console.log(`PASS: ${tc.name}`);
      passed++;
    } else {
      console.error(`FAIL: ${tc.name}`);
      console.error(`  Expected: Level=${tc.expectedLevel}, Rule=${tc.expectedRule}`);
      console.error(`  Got:      Level=${result.level}, Rule=${result.ruleId}`);
      console.error(`  Why-line: ${result.whyLine}`);
      failed++;
    }
  }

  console.log("--------------------------------------------------");
  console.log(`Results: ${passed} passed, ${failed} failed (Total: ${testCases.length})`);
  console.log(`Clinical Disclaimer Verified: "${CLINICAL_DISCLAIMER}"`);
  console.log("==================================================");

  return { passed, failed, total: testCases.length };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { testCases, runTests };
}
