/**
 * PostCare Clinical Triage Engine
 * Evaluates mother's check-in symptoms against evidence-based rules.
 * Priority: RED > AMBER > GREEN (highest severity always wins).
 *
 * Rules:
 * RED:
 *  - R1: Chest pain, trouble breathing, seizure or fainting
 *  - R2: Soaking a pad in an hour or passing large clots
 *  - R3: Severe headache with vision changes
 *  - R4: EPDS item 10 above 0 (thoughts of self-harm)
 *  - R5: EPDS total 13 or more (nurse call within 24h, referral)
 * AMBER:
 *  - R6: Fever 38.0 C or above
 *  - R7: Heavier bleeding than a normal period or foul-smelling discharge
 *  - R8: Persistent headache, leg swelling or pain in one leg
 *  - R9: Wound redness, discharge or worsening pain
 *  - R10: TREND RULE: A mild symptom reported at last check-in is worse now
 *  - R11: EPDS total 10-12
 * GREEN:
 *  - R12: None of the above; continue routine care
 */

const CLINICAL_DISCLAIMER = "This tool supports care and does not diagnose. Thresholds are a prototype design pending review by a doctor.";

function evaluateTriage(currentAnswers = {}, previousCheckin = null) {
  // Normalize fields
  const a = currentAnswers || {};
  const prevA = previousCheckin && previousCheckin.answers ? previousCheckin.answers : (previousCheckin || null);

  // ----------------------------------------------------
  // 1. RED RULES (Urgent Medical Emergency / Immediate Action)
  // ----------------------------------------------------

  // Rule R1: Chest pain, trouble breathing, seizure or fainting
  if (
    a.breathing_chest === "yes" &&
    (a.breathing_details === "chest_pain_severe_dyspnea" || a.fainting_seizure === "yes" || a.chest_pain === "yes" || a.trouble_breathing === "yes")
  ) {
    return {
      level: "RED",
      ruleId: "R1",
      ruleName: "Cardiorespiratory / Neurological Emergency",
      whyLine: "Red [R1]: Chest pain, trouble breathing, seizure, or fainting reported",
      actionTitle: "Go to Emergency Immediately",
      actionText: "Call emergency ambulance (108 / 112) or go to the nearest maternity hospital emergency room right now. Do not wait.",
      category: "cardiorespiratory",
      disclaimer: CLINICAL_DISCLAIMER
    };
  }

  // Rule R2: Soaking a pad in an hour or passing large clots
  if (
    a.bleeding === "yes" &&
    (a.bleeding_pad_rate === "soaking_hour" || a.bleeding_clots === "yes_large_clots" || a.soaking_pad_hour === true || a.large_clots === true)
  ) {
    const detail = a.bleeding_pad_rate === "soaking_hour" && a.bleeding_clots === "yes_large_clots"
      ? "Soaking 1+ pad per hour and passing large clots"
      : a.bleeding_pad_rate === "soaking_hour"
      ? "Soaking 1 or more pads completely in an hour"
      : "Passing blood clots larger than a coin/lemon";

    return {
      level: "RED",
      ruleId: "R2",
      ruleName: "Postpartum Hemorrhage Warning",
      whyLine: `Red [R2]: ${detail}`,
      actionTitle: "Urgent Hospital Evaluation Required",
      actionText: "This amount of bleeding indicates potential postpartum hemorrhage. Lie down, keep warm, call 108 or have someone drive you to the hospital immediately.",
      category: "bleeding_red",
      disclaimer: CLINICAL_DISCLAIMER
    };
  }

  // Rule R3: Severe headache with vision changes
  if (
    a.headache_vision === "yes" &&
    (a.headache_type === "severe_with_vision" || a.headache_vision_changes === true)
  ) {
    return {
      level: "RED",
      ruleId: "R3",
      ruleName: "Postpartum Pre-eclampsia Warning",
      whyLine: "Red [R3]: Severe headache accompanied by vision changes (blurred vision, spots, or flashes)",
      actionTitle: "Immediate Maternity Triage Required",
      actionText: "Severe headache with vision changes can be a sign of dangerously high blood pressure or postpartum pre-eclampsia. Go to emergency maternity triage immediately.",
      category: "hypertension_red",
      disclaimer: CLINICAL_DISCLAIMER
    };
  }

  // Rule R4: EPDS item 10 above 0 (Thoughts of self-harm)
  const item10Score = Number(a.epds_item_10 !== undefined ? a.epds_item_10 : -1);
  if (item10Score > 0) {
    return {
      level: "RED",
      ruleId: "R4",
      ruleName: "Urgent Mental Health Alert (EPDS Item 10 > 0)",
      whyLine: "Red [R4]: EPDS item 10 above 0 (Thoughts of self-harm reported)",
      actionTitle: "Immediate Emotional Support & Nurse Alert",
      actionText: "Immediate safety support: You are not alone. Please reach out to Tele-MANAS toll-free 24/7 (14416 or 1800-891-4416) or talk to your family right now. A hospital nurse has been alerted to call you promptly.",
      category: "mental_health_support",
      disclaimer: CLINICAL_DISCLAIMER
    };
  }

  // Rule R5: EPDS total 13 or more
  const epdsTotal = Number(a.epds_total !== undefined ? a.epds_total : -1);
  if (epdsTotal >= 13) {
    return {
      level: "RED",
      ruleId: "R5",
      ruleName: "Probable Postpartum Depression (EPDS >= 13)",
      whyLine: `Red [R5]: EPDS depression score of ${epdsTotal} (threshold >= 13)`,
      actionTitle: "Nurse Follow-Up within 24 Hours & Clinical Referral",
      actionText: "Your score suggests you are experiencing significant emotional distress or postpartum depression. Your care team will call within 24 hours to arrange counselling and clinical support.",
      category: "mental_health_support",
      disclaimer: CLINICAL_DISCLAIMER
    };
  }

  // ----------------------------------------------------
  // 2. AMBER RULES (Prompt Attention / Contact Hospital Today)
  // ----------------------------------------------------

  // Rule R6: Fever 38.0 C or above
  let isFeverHigh = false;
  let tempDisplay = "";
  if (a.fever === "yes") {
    if (a.fever_temperature === "high_fever" || a.fever_temperature === "hot_no_thermometer") {
      isFeverHigh = true;
      tempDisplay = "38.0°C or higher";
    }
  }
  if (a.temperature !== undefined && a.temperature !== null && a.temperature !== "") {
    const tempNum = parseFloat(a.temperature);
    if (!isNaN(tempNum)) {
      if (tempNum >= 38.0) {
        isFeverHigh = true;
        tempDisplay = `${tempNum.toFixed(1)}°C`;
      }
    }
  }
  if (isFeverHigh) {
    return {
      level: "AMBER",
      ruleId: "R6",
      ruleName: "Postnatal Fever / Suspected Infection",
      whyLine: `Amber [R6]: Fever ${tempDisplay || ">= 38.0°C"} reported`,
      actionTitle: "Contact Hospital or Nurse Today",
      actionText: "A fever of 38.0°C or above can be a sign of infection in the uterus, stitches, breast (mastitis), or urinary tract. Contact your hospital maternity unit today for an assessment.",
      category: "infection_amber",
      disclaimer: CLINICAL_DISCLAIMER
    };
  }

  // Rule R7: Heavier bleeding than a normal period or foul-smelling discharge
  if (
    a.bleeding === "yes" &&
    (a.bleeding_pad_rate === "heavier_than_period" || a.bleeding_odor === "foul_smell" || a.foul_discharge === true || a.heavier_than_period === true)
  ) {
    const reasonDetail = a.bleeding_odor === "foul_smell" && a.bleeding_pad_rate === "heavier_than_period"
      ? "Heavier bleeding than normal period and foul-smelling discharge"
      : a.bleeding_odor === "foul_smell"
      ? "Foul-smelling or offensive vaginal discharge"
      : "Bleeding heavier than a normal menstrual period";

    return {
      level: "AMBER",
      ruleId: "R7",
      ruleName: "Abnormal Bleeding / Lochia Changes",
      whyLine: `Amber [R7]: ${reasonDetail}`,
      actionTitle: "Contact Maternity Clinic Today",
      actionText: "Heavier bleeding or foul odor can indicate retained tissue or localized uterine infection. Call the hospital nurse today for examination.",
      category: "bleeding_red",
      disclaimer: CLINICAL_DISCLAIMER
    };
  }

  // Rule R8: Persistent headache, leg swelling or pain in one leg
  if (
    (a.headache_vision === "yes" && a.headache_type === "persistent_dull_headache") ||
    (a.wound_pain === "yes" && a.wound_signs === "leg_dvt_signs") ||
    a.persistent_headache === true ||
    a.one_leg_pain_swelling === true
  ) {
    const detail = (a.wound_pain === "yes" && a.wound_signs === "leg_dvt_signs") || a.one_leg_pain_swelling
      ? "Severe swelling or deep pain in one leg (potential DVT warning)"
      : "Persistent headache not relieved by rest or hydration";

    return {
      level: "AMBER",
      ruleId: "R8",
      ruleName: "Circulatory / Blood Pressure Symptoms",
      whyLine: `Amber [R8]: ${detail}`,
      actionTitle: "Contact Hospital Today for Evaluation",
      actionText: "Please contact your hospital or maternity team today. One-sided leg pain requires ultrasound evaluation for blood clots; persistent headache needs blood pressure check.",
      category: "hypertension_red",
      disclaimer: CLINICAL_DISCLAIMER
    };
  }

  // Rule R9: Wound redness, discharge or worsening pain
  if (
    a.wound_pain === "yes" &&
    (a.wound_signs === "infection_signs" || a.wound_infection === true)
  ) {
    return {
      level: "AMBER",
      ruleId: "R9",
      ruleName: "Surgical Wound Infection Signs",
      whyLine: "Amber [R9]: Wound redness, pus/discharge, or gaping incision edges",
      actionTitle: "Have Wound Inspected Today",
      actionText: "Signs of wound inflammation or infection need nurse inspection today. Keep the area clean and dry, avoid applying home pastes, and visit OPD for dressing.",
      category: "infection_amber",
      disclaimer: CLINICAL_DISCLAIMER
    };
  }

  // Rule R10: TREND RULE: A mild symptom reported at last check-in is worse now
  let trendFired = false;
  let trendReason = "";

  // 1) Explicit trend question answered "worse_than_last_week"
  if (a.wound_pain === "yes" && a.wound_pain_trend === "worse_than_last_week") {
    trendFired = true;
    trendReason = "Wound pain reported as worse than last check-in";
  }

  // 2) Comparative analysis against previousCheckin if available
  if (!trendFired && prevA) {
    // Check pain score trend (e.g. was mild 1-3, now moderate 5+)
    const currentPain = Number(a.pain_score || (a.wound_pain === "yes" ? 6 : 0));
    const prevPain = Number(prevA.pain_score || (prevA.wound_pain === "yes" ? 3 : 0));
    if (currentPain >= 5 && prevPain > 0 && currentPain >= prevPain + 2) {
      trendFired = true;
      trendReason = `Pain score escalated from ${prevPain}/10 to ${currentPain}/10 since last check-in`;
    }

    // Check symptom progression: mild headache previously -> persistent headache now
    if (
      prevA.headache_type === "mild_tiredness_headache" &&
      a.headache_type === "persistent_dull_headache"
    ) {
      trendFired = true;
      trendReason = "Mild headache at last check-in has progressed to persistent headache";
    }

    // Check wound progression: was healing previously, now reported as having pain
    if (
      (prevA.wound_signs === "healing_tenderness" || prevA.wound_pain === "no") &&
      a.wound_pain === "yes" &&
      a.wound_pain_trend === "worse_than_last_week"
    ) {
      trendFired = true;
      trendReason = "Wound pain was mild/healing at last check-in and is worse now";
    }
  }

  if (trendFired) {
    return {
      level: "AMBER",
      ruleId: "R10",
      ruleName: "Worsening Symptom Trend",
      whyLine: `Amber [R10]: Trend alert - ${trendReason}`,
      actionTitle: "Contact Care Team Today",
      actionText: "Normal postpartum recovery should gradually improve each week. A symptom that is worsening rather than improving requires prompt nurse review.",
      category: "trend_worse_amber",
      disclaimer: CLINICAL_DISCLAIMER
    };
  }

  // Rule R11: EPDS total 10-12
  if (epdsTotal >= 10 && epdsTotal <= 12) {
    return {
      level: "AMBER",
      ruleId: "R11",
      ruleName: "Mild to Moderate Postpartum Distress (EPDS 10-12)",
      whyLine: `Amber [R11]: EPDS depression score of ${epdsTotal} (borderline range 10-12)`,
      actionTitle: "Nurse Counselling Follow-Up",
      actionText: "Your score suggests mild emotional strain or 'baby blues' transitioning into postpartum distress. Your nurse will call you to offer supportive guidance and repeat screening in 2 weeks.",
      category: "mental_health_support",
      disclaimer: CLINICAL_DISCLAIMER
    };
  }

  // Optional baby feeding warning: if baby is struggling to feed
  if (a.baby_feeding === "struggling_feeding") {
    return {
      level: "AMBER",
      ruleId: "R7",
      ruleName: "Newborn Feeding Difficulty",
      whyLine: "Amber: Baby having trouble latching, refusing feeds, or lethargic",
      actionTitle: "Contact Lactation / Pediatric Clinic Today",
      actionText: "Newborn feeding difficulties can lead to dehydration or jaundice. Please speak with a nurse or pediatrician today for feeding assessment.",
      category: "general_green",
      disclaimer: CLINICAL_DISCLAIMER
    };
  }

  // ----------------------------------------------------
  // 3. GREEN RULE (Routine Recovery / Normal Care)
  // ----------------------------------------------------
  // Rule R12: None of the above
  return {
    level: "GREEN",
    ruleId: "R12",
    ruleName: "Normal Postnatal Progress",
    whyLine: "Green [R12]: No warning signs reported. Recovery is progressing normally.",
    actionTitle: "Continue Care & Rest",
    actionText: "Your check-in is complete and normal. Continue drinking plenty of fluids, rest whenever baby rests, and remember to attend your next scheduled WHO visit.",
    category: "general_green",
    disclaimer: CLINICAL_DISCLAIMER
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { evaluateTriage, CLINICAL_DISCLAIMER };
} else {
  window.evaluateTriage = evaluateTriage;
  window.CLINICAL_DISCLAIMER = CLINICAL_DISCLAIMER;
}
