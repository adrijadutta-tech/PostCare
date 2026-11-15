/**
 * PostCare Data Access Layer (DAL)
 * Backed by localStorage with an API abstraction so a REST/GraphQL backend
 * can drop in seamlessly later without altering frontend controllers.
 * 
 * NOTE: Demo data is stored locally per browser.
 */

const DB_KEYS = {
  MOTHERS: "postcare_mothers",
  VISITS: "postcare_visits",
  CHECKINS: "postcare_checkins",
  EPDS: "postcare_epds",
  FLAGS: "postcare_flags",
  OFFLINE_QUEUE: "postcare_offline_queue",
  AUTH: "postcare_auth_session",
  SEEDED: "postcare_seeded_v1"
};

const DB = {
  // ----------------------------------------------------
  // INITIALIZATION & DUMMY DATA SEEDING
  // ----------------------------------------------------
  init: function() {
    if (!localStorage.getItem(DB_KEYS.SEEDED)) {
      this.seedDummyData();
    }
  },

  seedDummyData: function() {
    const now = new Date();
    const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();
    const daysAhead = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString();

    const mothers = [
      {
        id: "m_sunita",
        token: "tok_sunita_01",
        name: "Sunita Sharma",
        phone: "+91 98765 43210",
        hospitalId: "HOSP-2024-0101",
        deliveryDate: daysAgo(3),
        deliveryType: "Caesarean Section",
        language: "en",
        registeredAt: daysAgo(3),
        latestTriageLevel: "GREEN",
        latestWhyLine: "Green [R12]: Healthy normal lochia, mild expected soreness.",
        lastCheckinAt: daysAgo(1)
      },
      {
        id: "m_priyanka",
        token: "tok_priyanka_02",
        name: "Priyanka Das",
        phone: "+91 98111 22334",
        hospitalId: "HOSP-2024-0142",
        deliveryDate: daysAgo(9),
        deliveryType: "Normal Vaginal Delivery",
        language: "bn",
        registeredAt: daysAgo(9),
        latestTriageLevel: "AMBER",
        latestWhyLine: "Amber [R6]: Fever 38.2°C reported with foul-smelling discharge",
        lastCheckinAt: daysAgo(0.5)
      },
      {
        id: "m_anjali",
        token: "tok_anjali_03",
        name: "Anjali Verma",
        phone: "+91 97234 56789",
        hospitalId: "HOSP-2024-0098",
        deliveryDate: daysAgo(16),
        deliveryType: "Normal Vaginal Delivery",
        language: "hi",
        registeredAt: daysAgo(16),
        latestTriageLevel: "RED",
        latestWhyLine: "Red [R4]: EPDS item 10 above 0 (Thoughts of self-harm reported) + score 15",
        lastCheckinAt: daysAgo(1)
      },
      {
        id: "m_meena",
        token: "tok_meena_04",
        name: "Meena Devi",
        phone: "+91 99345 67890",
        hospitalId: "HOSP-2024-0065",
        deliveryDate: daysAgo(39),
        deliveryType: "Caesarean Section",
        language: "hi",
        registeredAt: daysAgo(39),
        latestTriageLevel: "GREEN",
        latestWhyLine: "Green [R12]: Normal recovery, due for 6-week postnatal checkup",
        lastCheckinAt: daysAgo(5)
      }
    ];

    // Seed 4 WHO visits for each mother
    const visits = [];
    mothers.forEach((m) => {
      const deliv = new Date(m.deliveryDate);
      const addDays = (d) => new Date(deliv.getTime() + d * 24 * 60 * 60 * 1000).toISOString();

      visits.push(
        {
          id: `v_${m.id}_1`,
          motherId: m.id,
          visitNumber: 1,
          name: "Visit 1: Within 24h",
          dueDayOffset: 1,
          dueDate: addDays(1),
          completedAt: daysAgo(new Date().getDate() - deliv.getDate() + 0.5),
          status: "done",
          notes: "Discharge check complete at hospital."
        },
        {
          id: `v_${m.id}_2`,
          motherId: m.id,
          visitNumber: 2,
          name: "Visit 2: 48–72 Hours",
          dueDayOffset: 3,
          dueDate: addDays(3),
          completedAt: m.id === "m_sunita" ? null : daysAgo(new Date().getDate() - deliv.getDate() + 2),
          status: m.id === "m_sunita" ? "due" : "done",
          notes: m.id === "m_sunita" ? null : "Baby feeding checked, vitals stable."
        },
        {
          id: `v_${m.id}_3`,
          motherId: m.id,
          visitNumber: 3,
          name: "Visit 3: Day 7 (Week 1)",
          dueDayOffset: 7,
          dueDate: addDays(7),
          completedAt: m.id === "m_meena" ? addDays(7) : null,
          status: m.id === "m_priyanka" ? "missed" : m.id === "m_anjali" ? "done" : m.id === "m_meena" ? "done" : "upcoming",
          notes: m.id === "m_priyanka" ? "Mother did not report to clinic on Day 7" : null
        },
        {
          id: `v_${m.id}_4`,
          motherId: m.id,
          visitNumber: 4,
          name: "Visit 4: Week 6 (Day 42)",
          dueDayOffset: 42,
          dueDate: addDays(42),
          completedAt: null,
          status: m.id === "m_meena" ? "due" : "upcoming",
          notes: null
        }
      );
    });

    // Seed initial check-ins
    const checkins = [
      {
        id: "chk_001",
        motherId: "m_sunita",
        token: "tok_sunita_01",
        submittedAt: daysAgo(1),
        answers: {
          bleeding: "no",
          fever: "no",
          headache_vision: "no",
          breathing_chest: "no",
          wound_pain: "yes",
          wound_signs: "healing_tenderness",
          wound_pain_trend: "better_healing",
          pain_score: 2,
          baby_feeding: "feeding_well",
          general_mood: "mood_good"
        },
        triageResult: {
          level: "GREEN",
          ruleId: "R12",
          ruleName: "Normal Postnatal Progress",
          whyLine: "Green [R12]: No danger signs. Stitches are healing normally.",
          actionTitle: "Continue Care & Rest",
          actionText: "Rest frequently, stay hydrated, and follow infant feeding schedule.",
          category: "general_green"
        },
        synced: true
      },
      {
        id: "chk_002",
        motherId: "m_priyanka",
        token: "tok_priyanka_02",
        submittedAt: daysAgo(0.5),
        answers: {
          bleeding: "yes",
          bleeding_pad_rate: "heavier_than_period",
          bleeding_odor: "foul_smell",
          fever: "yes",
          fever_temperature: "high_fever",
          temperature: 38.2,
          headache_vision: "no",
          breathing_chest: "no",
          wound_pain: "no",
          baby_feeding: "feeding_well",
          general_mood: "mood_anxious_tearful"
        },
        triageResult: {
          level: "AMBER",
          ruleId: "R6",
          ruleName: "Postnatal Fever / Suspected Infection",
          whyLine: "Amber [R6]: Fever 38.2°C reported + foul lochia odor",
          actionTitle: "Contact Hospital or Nurse Today",
          actionText: "Fever and foul-smelling discharge indicate possible uterine or pelvic infection. Nurse review recommended today.",
          category: "infection_amber"
        },
        synced: true
      }
    ];

    // Seed initial EPDS screen
    const epds = [
      {
        id: "epds_001",
        motherId: "m_anjali",
        token: "tok_anjali_03",
        submittedAt: daysAgo(1),
        totalScore: 15,
        item10Score: 2,
        triageResult: {
          level: "RED",
          ruleId: "R4",
          ruleName: "Urgent Mental Health Alert (EPDS Item 10 > 0)",
          whyLine: "Red [R4]: EPDS item 10 score of 2 (Thoughts of self-harm reported) + Total Score 15",
          actionTitle: "Immediate Emotional Support & Nurse Alert",
          actionText: "Tele-MANAS (14416) support line displayed. High urgency nurse outreach scheduled.",
          category: "mental_health_support"
        }
      }
    ];

    // Seed flags for Nurse Dashboard
    const flags = [
      {
        id: "flg_001",
        motherId: "m_anjali",
        motherName: "Anjali Verma",
        motherPhone: "+91 97234 56789",
        motherToken: "tok_anjali_03",
        level: "RED",
        source: "EPDS Screen (Week 2)",
        reason: "Red [R4]: EPDS Item 10 positive (Score 2) + High Depression Score 15/30",
        ruleId: "R4",
        createdAt: daysAgo(1),
        status: "open",
        resolvedAt: null,
        resolutionNotes: null,
        contactType: null,
        resolvedBy: null
      },
      {
        id: "flg_002",
        motherId: "m_priyanka",
        motherName: "Priyanka Das",
        motherPhone: "+91 98111 22334",
        motherToken: "tok_priyanka_02",
        level: "AMBER",
        source: "Weekly Check-in",
        reason: "Amber [R6]: Fever 38.2°C with foul discharge + Missed Day 7 Visit",
        ruleId: "R6",
        createdAt: daysAgo(0.5),
        status: "open",
        resolvedAt: null,
        resolutionNotes: null,
        contactType: null,
        resolvedBy: null
      }
    ];

    localStorage.setItem(DB_KEYS.MOTHERS, JSON.stringify(mothers));
    localStorage.setItem(DB_KEYS.VISITS, JSON.stringify(visits));
    localStorage.setItem(DB_KEYS.CHECKINS, JSON.stringify(checkins));
    localStorage.setItem(DB_KEYS.EPDS, JSON.stringify(epds));
    localStorage.setItem(DB_KEYS.FLAGS, JSON.stringify(flags));
    localStorage.setItem(DB_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
    localStorage.setItem(DB_KEYS.SEEDED, "true");
  },

  resetToDemo: function() {
    localStorage.removeItem(DB_KEYS.MOTHERS);
    localStorage.removeItem(DB_KEYS.VISITS);
    localStorage.removeItem(DB_KEYS.CHECKINS);
    localStorage.removeItem(DB_KEYS.EPDS);
    localStorage.removeItem(DB_KEYS.FLAGS);
    localStorage.removeItem(DB_KEYS.OFFLINE_QUEUE);
    localStorage.removeItem(DB_KEYS.SEEDED);
    this.seedDummyData();
  },

  // ----------------------------------------------------
  // MOTHERS
  // ----------------------------------------------------
  getMothers: function() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.MOTHERS)) || [];
    } catch {
      return [];
    }
  },

  getMotherByToken: function(token) {
    if (!token) return null;
    const cleanToken = token.trim();
    const list = this.getMothers();
    return list.find((m) => m.token === cleanToken) || null;
  },

  getMotherById: function(id) {
    const list = this.getMothers();
    return list.find((m) => m.id === id) || null;
  },

  registerMother: function({ name, phone, hospitalId, deliveryDate, deliveryType, language }) {
    const mothers = this.getMothers();
    const id = "m_" + Date.now();
    const randPart = Math.random().toString(36).substring(2, 8);
    const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 8);
    const token = `tok_${safeName}_${randPart}`;

    const newMother = {
      id,
      token,
      name,
      phone: phone || "Not Provided",
      hospitalId: hospitalId || `HOSP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      deliveryDate: new Date(deliveryDate).toISOString(),
      deliveryType: deliveryType || "Normal Vaginal Delivery",
      language: language || "en",
      registeredAt: new Date().toISOString(),
      latestTriageLevel: "GREEN",
      latestWhyLine: "Registered at discharge. First check-in pending.",
      lastCheckinAt: null
    };

    mothers.unshift(newMother);
    localStorage.setItem(DB_KEYS.MOTHERS, JSON.stringify(mothers));

    // Automatically create 4 WHO visit records
    this.createWhoVisitsForMother(newMother);

    return newMother;
  },

  importMotherFromPayload: function(token, data) {
    if (!token || !data) return null;
    const mothers = this.getMothers();
    const existing = mothers.find((m) => m.token === token);
    if (existing) return existing;

    const newMother = {
      id: "m_" + Date.now(),
      token: token,
      name: data.n || data.name || "Mother",
      phone: data.p || data.phone || "Not Provided",
      hospitalId: data.h || data.hospitalId || `HOSP-${new Date().getFullYear()}-0001`,
      deliveryDate: new Date(data.d || data.deliveryDate || Date.now()).toISOString(),
      deliveryType: data.t || data.deliveryType || "Normal Vaginal Delivery",
      language: data.l || data.language || "en",
      registeredAt: new Date().toISOString(),
      latestTriageLevel: "GREEN",
      latestWhyLine: "Discharge QR Pass imported. First check-in pending.",
      lastCheckinAt: null
    };

    mothers.unshift(newMother);
    localStorage.setItem(DB_KEYS.MOTHERS, JSON.stringify(mothers));
    this.createWhoVisitsForMother(newMother);
    return newMother;
  },

  updateMotherTriageStatus: function(motherId, level, whyLine) {
    const mothers = this.getMothers();
    const idx = mothers.findIndex((m) => m.id === motherId);
    if (idx !== -1) {
      mothers[idx].latestTriageLevel = level;
      mothers[idx].latestWhyLine = whyLine;
      mothers[idx].lastCheckinAt = new Date().toISOString();
      localStorage.setItem(DB_KEYS.MOTHERS, JSON.stringify(mothers));
    }
  },

  // ----------------------------------------------------
  // WHO VISITS (4 Standard Visits)
  // ----------------------------------------------------
  createWhoVisitsForMother: function(mother) {
    const visits = this.getAllVisits();
    const deliv = new Date(mother.deliveryDate);
    const addDays = (d) => new Date(deliv.getTime() + d * 24 * 60 * 60 * 1000).toISOString();

    const newVisits = [
      {
        id: `v_${mother.id}_1`,
        motherId: mother.id,
        visitNumber: 1,
        name: "Visit 1: Within 24h",
        dueDayOffset: 1,
        dueDate: addDays(1),
        completedAt: null,
        status: "upcoming",
        notes: null
      },
      {
        id: `v_${mother.id}_2`,
        motherId: mother.id,
        visitNumber: 2,
        name: "Visit 2: 48–72 Hours",
        dueDayOffset: 3,
        dueDate: addDays(3),
        completedAt: null,
        status: "upcoming",
        notes: null
      },
      {
        id: `v_${mother.id}_3`,
        motherId: mother.id,
        visitNumber: 3,
        name: "Visit 3: Day 7 (Week 1)",
        dueDayOffset: 7,
        dueDate: addDays(7),
        completedAt: null,
        status: "upcoming",
        notes: null
      },
      {
        id: `v_${mother.id}_4`,
        motherId: mother.id,
        visitNumber: 4,
        name: "Visit 4: Week 6 (Day 42)",
        dueDayOffset: 42,
        dueDate: addDays(42),
        completedAt: null,
        status: "upcoming",
        notes: null
      }
    ];

    const updated = visits.concat(newVisits);
    localStorage.setItem(DB_KEYS.VISITS, JSON.stringify(updated));
  },

  getAllVisits: function() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.VISITS)) || [];
    } catch {
      return [];
    }
  },

  getVisitsForMother: function(motherId) {
    const all = this.getAllVisits();
    const now = new Date().getTime();

    // Dynamically calculate status if not completed
    return all
      .filter((v) => v.motherId === motherId)
      .map((v) => {
        if (v.completedAt) {
          return { ...v, status: "done" };
        }
        const dueTime = new Date(v.dueDate).getTime();
        const diffDays = (now - dueTime) / (1000 * 60 * 60 * 24);

        let status = "upcoming";
        if (diffDays >= -1 && diffDays <= 1) {
          status = "due";
        } else if (diffDays > 1) {
          status = "missed";
        }
        return { ...v, status };
      })
      .sort((a, b) => a.visitNumber - b.visitNumber);
  },

  markVisitDone: function(visitId, outcomeNotes = "Visit completed successfully.") {
    const visits = this.getAllVisits();
    const idx = visits.findIndex((v) => v.id === visitId);
    if (idx !== -1) {
      visits[idx].completedAt = new Date().toISOString();
      visits[idx].status = "done";
      visits[idx].notes = outcomeNotes;
      localStorage.setItem(DB_KEYS.VISITS, JSON.stringify(visits));
      return visits[idx];
    }
    return null;
  },

  // ----------------------------------------------------
  // CHECK-INS & ADAPTIVE TRIAGE
  // ----------------------------------------------------
  getAllCheckins: function() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.CHECKINS)) || [];
    } catch {
      return [];
    }
  },

  getCheckinsForMother: function(motherId) {
    const list = this.getAllCheckins();
    return list.filter((c) => c.motherId === motherId).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  },

  getLastCheckinForMother: function(motherId) {
    const motherCheckins = this.getCheckinsForMother(motherId);
    return motherCheckins.length > 0 ? motherCheckins[0] : null;
  },

  saveCheckin: function({ motherId, token, answers, triageResult, isOffline = false }) {
    const checkins = this.getAllCheckins();
    const id = "chk_" + Date.now();
    const record = {
      id,
      motherId,
      token,
      submittedAt: new Date().toISOString(),
      answers,
      triageResult,
      synced: !isOffline
    };

    checkins.unshift(record);
    localStorage.setItem(DB_KEYS.CHECKINS, JSON.stringify(checkins));

    // Update mother summary
    this.updateMotherTriageStatus(motherId, triageResult.level, triageResult.whyLine);

    // If AMBER or RED, automatically raise a flag for the nurse dashboard
    if (triageResult.level === "AMBER" || triageResult.level === "RED") {
      const mother = this.getMotherById(motherId);
      this.createFlag({
        motherId,
        motherName: mother ? mother.name : "Registered Mother",
        motherPhone: mother ? mother.phone : "N/A",
        motherToken: token,
        level: triageResult.level,
        source: "Weekly Symptom Check-in",
        reason: triageResult.whyLine,
        ruleId: triageResult.ruleId
      });
    }

    return record;
  },

  // ----------------------------------------------------
  // EPDS SCREENS
  // ----------------------------------------------------
  getAllEpdsScreens: function() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.EPDS)) || [];
    } catch {
      return [];
    }
  },

  getEpdsForMother: function(motherId) {
    const list = this.getAllEpdsScreens();
    return list.filter((e) => e.motherId === motherId).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  },

  saveEpdsScreen: function({ motherId, token, answers, totalScore, item10Score, triageResult }) {
    const epdsList = this.getAllEpdsScreens();
    const id = "epds_" + Date.now();
    const record = {
      id,
      motherId,
      token,
      submittedAt: new Date().toISOString(),
      answers,
      totalScore,
      item10Score,
      triageResult
    };

    epdsList.unshift(record);
    localStorage.setItem(DB_KEYS.EPDS, JSON.stringify(epdsList));

    // Update mother triage
    if (triageResult.level === "RED" || triageResult.level === "AMBER") {
      this.updateMotherTriageStatus(motherId, triageResult.level, triageResult.whyLine);

      const mother = this.getMotherById(motherId);
      this.createFlag({
        motherId,
        motherName: mother ? mother.name : "Registered Mother",
        motherPhone: mother ? mother.phone : "N/A",
        motherToken: token,
        level: triageResult.level,
        source: "EPDS Depression Screen",
        reason: triageResult.whyLine,
        ruleId: triageResult.ruleId
      });
    }

    return record;
  },

  // ----------------------------------------------------
  // NURSE DASHBOARD FLAGS & FOLLOW-UPS
  // ----------------------------------------------------
  getAllFlags: function() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.FLAGS)) || [];
    } catch {
      return [];
    }
  },

  createFlag: function({ motherId, motherName, motherPhone, motherToken, level, source, reason, ruleId }) {
    const flags = this.getAllFlags();
    const newFlag = {
      id: "flg_" + Date.now() + "_" + Math.floor(Math.random() * 100),
      motherId,
      motherName,
      motherPhone,
      motherToken,
      level, // RED or AMBER
      source,
      reason,
      ruleId: ruleId || "R_GEN",
      createdAt: new Date().toISOString(),
      status: "open",
      resolvedAt: null,
      resolutionNotes: null,
      contactType: null,
      resolvedBy: null
    };

    flags.unshift(newFlag);
    localStorage.setItem(DB_KEYS.FLAGS, JSON.stringify(flags));
    return newFlag;
  },

  requestCallback: function(motherToken) {
    const mother = this.getMotherByToken(motherToken);
    if (!mother) return null;

    return this.createFlag({
      motherId: mother.id,
      motherName: mother.name,
      motherPhone: mother.phone,
      motherToken: mother.token,
      level: "RED",
      source: "Mother Direct Call-Back Request",
      reason: "Mother tapped 'Request a Call Back' on her portal. Needs immediate nurse check-in.",
      ruleId: "CALLBACK"
    });
  },

  resolveFlag: function(flagId, { contactType, resolutionNotes, resolvedBy = "Staff Nurse" }) {
    const flags = this.getAllFlags();
    const idx = flags.findIndex((f) => f.id === flagId);
    if (idx !== -1) {
      flags[idx].status = "resolved";
      flags[idx].resolvedAt = new Date().toISOString();
      flags[idx].contactType = contactType || "Phone Call";
      flags[idx].resolutionNotes = resolutionNotes || "Reviewed with mother; condition stabilized.";
      flags[idx].resolvedBy = resolvedBy;
      localStorage.setItem(DB_KEYS.FLAGS, JSON.stringify(flags));
      return flags[idx];
    }
    return null;
  },

  // ----------------------------------------------------
  // OFFLINE QUEUE (PWA Synchronization)
  // ----------------------------------------------------
  getOfflineQueue: function() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.OFFLINE_QUEUE)) || [];
    } catch {
      return [];
    }
  },

  queueOfflineCheckin: function(checkinPayload) {
    const queue = this.getOfflineQueue();
    queue.push({
      ...checkinPayload,
      queuedAt: new Date().toISOString()
    });
    localStorage.setItem(DB_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    return queue.length;
  },

  syncOfflineQueue: function() {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return 0;

    let syncedCount = 0;
    queue.forEach((item) => {
      this.saveCheckin({
        motherId: item.motherId,
        token: item.token,
        answers: item.answers,
        triageResult: item.triageResult,
        isOffline: false
      });
      syncedCount++;
    });

    localStorage.setItem(DB_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
    return syncedCount;
  },

  // ----------------------------------------------------
  // ANALYTICS & REPORTING
  // ----------------------------------------------------
  getAnalytics: function() {
    const mothers = this.getMothers();
    const flags = this.getAllFlags();
    const visits = this.getAllVisits();
    const checkins = this.getAllCheckins();
    const epds = this.getAllEpdsScreens();

    const openFlags = flags.filter((f) => f.status === "open");
    const redFlags = openFlags.filter((f) => f.level === "RED");
    const amberFlags = openFlags.filter((f) => f.level === "AMBER");
    const resolvedFlags = flags.filter((f) => f.status === "resolved");

    // Missed visits
    const missedVisits = [];
    const now = new Date().getTime();
    visits.forEach((v) => {
      if (!v.completedAt) {
        const dueTime = new Date(v.dueDate).getTime();
        const diffDays = (now - dueTime) / (1000 * 60 * 60 * 24);
        if (diffDays > 1) {
          const mother = mothers.find((m) => m.id === v.motherId);
          missedVisits.push({
            ...v,
            motherName: mother ? mother.name : "Mother",
            motherPhone: mother ? mother.phone : "N/A",
            motherToken: mother ? mother.token : ""
          });
        }
      }
    });

    // Unscreened for EPDS (mothers delivered >= 14 days ago who have not taken EPDS)
    const unscreenedMothers = [];
    mothers.forEach((m) => {
      const delivTime = new Date(m.deliveryDate).getTime();
      const daysSinceDeliv = (now - delivTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDeliv >= 14) {
        const screens = epds.filter((e) => e.motherId === m.id);
        if (screens.length === 0) {
          unscreenedMothers.push({
            ...m,
            daysSinceDelivery: Math.floor(daysSinceDeliv)
          });
        }
      }
    });

    // Average resolution time (in hours)
    let totalResolutionHours = 0;
    let resolvedWithDuration = 0;
    resolvedFlags.forEach((rf) => {
      if (rf.createdAt && rf.resolvedAt) {
        const duration = (new Date(rf.resolvedAt).getTime() - new Date(rf.createdAt).getTime()) / (1000 * 60 * 60);
        if (duration >= 0) {
          totalResolutionHours += duration;
          resolvedWithDuration++;
        }
      }
    });
    const avgResponseTimeHours = resolvedWithDuration > 0
      ? (totalResolutionHours / resolvedWithDuration).toFixed(1)
      : "1.8";

    // Check-in adherence rate (dummy calculated metric ~ 82%)
    const checkinRate = mothers.length > 0
      ? Math.min(100, Math.round((checkins.length / (mothers.length * 2)) * 100))
      : 85;

    return {
      totalMothers: mothers.length,
      totalCheckins: checkins.length,
      totalEpds: epds.length,
      openFlagsCount: openFlags.length,
      redFlagsCount: redFlags.length,
      amberFlagsCount: amberFlags.length,
      resolvedFlagsCount: resolvedFlags.length,
      avgResponseTimeHours,
      checkinRate: checkinRate > 0 ? checkinRate : 82,
      missedVisits,
      unscreenedMothers
    };
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = DB;
} else {
  window.DB = DB;
}
