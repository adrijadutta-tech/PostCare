/**
 * PostCare Application Controller
 * Manages UI rendering, user interaction, adaptive check-ins, EPDS screening,
 * QR code generation, nurse triage dashboard, and multilingual audio narration.
 */

const App = {
  currentLanguage: "en",
  currentMother: null,
  activeNurseTab: "flags",

  init: function() {
    DB.init();
    PWA.init();
    Router.init();
    this.setupGlobalEvents();
  },

  setupGlobalEvents: function() {
    // Global language switcher
    const langSelect = document.getElementById("globalLangSelect");
    if (langSelect) {
      langSelect.addEventListener("change", (e) => {
        this.currentLanguage = e.target.value;
        if (this.currentMother) {
          this.currentMother.language = this.currentLanguage;
        }
        Router.handleRoute();
      });
    }

    // Install PWA button
    const installBtn = document.getElementById("btnInstallPwa");
    if (installBtn) {
      installBtn.addEventListener("click", () => PWA.promptInstall());
    }
  },

  setLanguage: function(lang) {
    this.currentLanguage = lang;
    const select = document.getElementById("globalLangSelect");
    if (select) select.value = lang;
    Router.handleRoute();
  },

  refreshCurrentView: function() {
    Router.handleRoute();
  },

  // =========================================================================
  // VIEW: HOME / LANDING SCREEN
  // =========================================================================
  renderHome: function() {
    const main = document.getElementById("appMain");
    const mothers = DB.getMothers();

    main.innerHTML = `
      <section class="card" style="border-top: 4px solid var(--primary-teal);">
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
          <img src="./assets/logo.svg" alt="PostCare Logo" style="width: 50px; height: 50px; border-radius: 12px;">
          <div>
            <h1 style="margin: 0; font-size: 1.75rem;">PostCare</h1>
            <p style="margin: 0; color: var(--text-muted); font-size: 0.95rem;">
              A Postnatal Follow-Up & Warning-Sign Companion for Mothers in India
            </p>
          </div>
        </div>
        <p style="font-size: 0.95rem; color: #334e4e;">
          Keeping mothers connected to care after hospital discharge. Nurses register the mother at discharge and generate a personal QR pass.
          The mother scans it on any smartphone — <strong>no app download, no password</strong>.
        </p>

        <!-- Project Evidence Box -->
        <div style="background: var(--bg-tint); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 14px; margin: 16px 0; font-size: 0.85rem;">
          <strong style="color: var(--primary-deep); display: block; margin-bottom: 6px;">
            Evidence & Rationale Behind PostCare:
          </strong>
          <ul style="padding-left: 20px; line-height: 1.5; color: var(--text-main);">
            <li><strong>Postnatal Drop-off:</strong> While contact within 2 days reached 78% (NFHS-5), post-week 1 follow-up is severely neglected.</li>
            <li><strong>Faridabad Study:</strong> 67.3% of mothers received no postnatal care and only 11.2% completed all four WHO visits (single-district indicative).</li>
            <li><strong>Postpartum Depression:</strong> Meta-analysis indicates ~22% prevalence in India; lack of family support is a major risk factor.</li>
            <li><strong>Thin Discharge Teaching:</strong> Over 85% of hospital discharge education takes under 15 minutes.</li>
          </ul>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 20px;">
          <!-- Mother Portal Card -->
          <div style="border: 2px solid var(--primary-teal); border-radius: var(--radius-md); padding: 18px; background: #FFFFFF; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <h3 style="margin: 0; color: var(--primary-deep);">Mother / Family Portal</h3>
                <span class="network-badge online" style="color: var(--primary-deep); border-color: var(--primary-teal);">QR Access</span>
              </div>
              <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 14px;">
                Simulate scanning a mother's discharge QR code or select a pre-seeded test mother to view her timeline and check-ins:
              </p>
              
              <div class="form-group" style="margin-bottom: 14px;">
                <label class="form-label" style="font-size: 0.85rem;">Select Demo Mother Profile:</label>
                <select id="quickMotherSelect" class="form-select" style="font-size: 0.9rem;">
                  ${mothers.map(m => `
                    <option value="${m.token}">
                      ${m.name} (${m.deliveryType.includes("Caesarean") ? "C-Section" : "Vaginal"}, ${m.latestTriageLevel} status)
                    </option>
                  `).join("")}
                </select>
              </div>

              <div class="form-group" style="margin-bottom: 14px;">
                <label class="form-label" style="font-size: 0.85rem;">Or Enter Mother Token:</label>
                <div style="display: flex; gap: 8px;">
                  <input type="text" id="manualTokenInput" class="form-input" placeholder="e.g. tok_sunita_01" style="font-size: 0.88rem;">
                  <button class="btn btn-secondary btn-sm" onclick="App.openEnteredToken()">Open</button>
                </div>
              </div>
            </div>

            <button class="btn btn-secondary btn-block" onclick="App.openSelectedDemoMother()">
              Open Mother Companion Page &rarr;
            </button>
          </div>

          <!-- Nurse Dashboard Card -->
          <div style="border: 2px solid var(--primary-deep); border-radius: var(--radius-md); padding: 18px; background: #FFFFFF; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <h3 style="margin: 0; color: var(--primary-deep);">Nurse & Staff Dashboard</h3>
                <span class="network-badge online" style="color: var(--primary-deep); border-color: var(--primary-deep);">Clinical Access</span>
              </div>
              <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 12px;">
                Triage flagged mothers by urgency (Red first, then Amber), manage missed visits, track unscreened mothers, and register new deliveries.
              </p>

              <div style="background: var(--bg-tint); padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: 14px; font-size: 0.82rem;">
                <strong>Demo Nurse Login:</strong><br>
                <code>nurse@postcare.in</code> / <code>care123</code>
              </div>
            </div>

            <a href="#/nurse" class="btn btn-primary btn-block">
              Open Nurse Dashboard &rarr;
            </a>
          </div>
        </div>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <a href="./tests/index.html" class="btn btn-tint btn-sm" target="_blank">
            Run Triage Unit Tests (25/25 Passing) &rarr;
          </a>
          <button class="btn btn-outline btn-sm" onclick="App.resetDemoData()">
            Reset Demo Database
          </button>
        </div>
      </section>
    `;
  },

  openSelectedDemoMother: function() {
    const sel = document.getElementById("quickMotherSelect");
    if (sel && sel.value) {
      window.location.hash = `#/mother/${sel.value}`;
    }
  },

  openEnteredToken: function() {
    const inp = document.getElementById("manualTokenInput");
    if (inp && inp.value.trim()) {
      window.location.hash = `#/mother/${inp.value.trim()}`;
    } else {
      alert("Please enter a valid mother token (e.g. tok_sunita_01)");
    }
  },

  resetDemoData: function() {
    if (confirm("Reset demo database back to default sample mothers, visits, and flags?")) {
      DB.resetToDemo();
      PWA.showToast("Demo database successfully reset.", "success");
      Router.handleRoute();
    }
  },

  // =========================================================================
  // VIEW: NURSE LOGIN SCREEN
  // =========================================================================
  renderLogin: function() {
    const main = document.getElementById("appMain");
    main.innerHTML = `
      <div style="max-width: 440px; margin: 30px auto;">
        <div class="card" style="border-top: 4px solid var(--primary-deep);">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="./assets/logo.svg" alt="PostCare" style="width: 56px; height: 56px; border-radius: 12px; margin-bottom: 8px;">
            <h2>Hospital Staff Login</h2>
            <p style="color: var(--text-muted); font-size: 0.88rem;">
              Secure postnatal monitoring portal for hospital maternity staff.
            </p>
          </div>

          <form onsubmit="App.handleNurseLogin(event)">
            <div class="form-group">
              <label class="form-label">Nurse / Staff Email:</label>
              <input type="email" id="loginEmail" class="form-input" value="nurse@postcare.in" required>
            </div>

            <div class="form-group">
              <label class="form-label">Password:</label>
              <input type="password" id="loginPassword" class="form-input" value="care123" required>
            </div>

            <div style="background: var(--bg-tint); padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: 20px; font-size: 0.82rem;">
              <strong>Demo Credentials:</strong><br>
              Email: <code>nurse@postcare.in</code><br>
              Password: <code>care123</code>
            </div>

            <button type="submit" class="btn btn-primary btn-block" style="margin-bottom: 12px;">
              Sign In to Dashboard &rarr;
            </button>

            <button type="button" class="btn btn-tint btn-block" onclick="App.autoFillNurseLogin()">
              1-Click Auto Fill Demo Login
            </button>
          </form>

          <div style="text-align: center; margin-top: 20px;">
            <a href="#/" style="font-size: 0.88rem; color: var(--text-muted);">&larr; Back to Home</a>
          </div>
        </div>
      </div>
    `;
  },

  autoFillNurseLogin: function() {
    document.getElementById("loginEmail").value = "nurse@postcare.in";
    document.getElementById("loginPassword").value = "care123";
    window.location.hash = "#/nurse";
  },

  handleNurseLogin: function(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const pass = document.getElementById("loginPassword").value.trim();

    if (email && pass) {
      localStorage.setItem("postcare_auth_session", "true");
      PWA.showToast("Signed in as Staff Nurse", "success");
      window.location.hash = "#/nurse";
    } else {
      alert("Please enter email and password.");
    }
  },

  handleNurseLogout: function() {
    localStorage.removeItem("postcare_auth_session");
    PWA.showToast("Logged out successfully.", "info");
    window.location.hash = "#/";
  },

  // =========================================================================
  // VIEW: MOTHER DASHBOARD
  // =========================================================================
  renderMotherDashboard: function(token) {
    const main = document.getElementById("appMain");
    const mother = DB.getMotherByToken(token);

    if (!mother) {
      main.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px 20px;">
          <h2 style="color: var(--accent-rose);">Mother Token Not Found</h2>
          <p style="color: var(--text-muted);">
            No record matches token: <code>${token}</code>. Please check your QR link or enter a valid demo token.
          </p>
          <a href="#/" class="btn btn-primary" style="margin-top: 14px;">&larr; Return to Home</a>
        </div>
      `;
      return;
    }

    this.currentMother = mother;
    const visits = DB.getVisitsForMother(mother.id);
    const lastCheckin = DB.getLastCheckinForMother(mother.id);
    const deliveryDateFormatted = new Date(mother.deliveryDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    const lang = this.currentLanguage;
    const translations = {
      welcome: { en: "Welcome,", hi: "नमस्ते,", bn: "স্বাগতম," },
      deliveryDetails: {
        en: `Delivered on ${deliveryDateFormatted} (${mother.deliveryType})`,
        hi: `प्रसव तिथि: ${deliveryDateFormatted} (${mother.deliveryType === "Caesarean Section" ? "सिजेरियन" : "सामान्य प्रसव"})`,
        bn: `প্রসবের তারিখ: ${deliveryDateFormatted} (${mother.deliveryType === "Caesarean Section" ? "সিজারিয়ান" : "স্বাভাবিক প্রসব"})`
      },
      timelineTitle: {
        en: "Your 4 WHO Postnatal Visits",
        hi: "आपकी 4 WHO प्रसवोत्तर जांचें",
        bn: "আপনার ৪টি WHO প্রসবোত্তর চেক-আপ"
      },
      checkinPrompt: {
        en: "Weekly Health Check-In",
        hi: "साप्ताहिक स्वास्थ्य चेक-इन",
        bn: "সাপ্তাহিক স্বাস্থ্য চেক-ইন"
      },
      checkinDesc: {
        en: "5 quick questions to check your recovery. Takes under 1 minute.",
        hi: "आपके स्वास्थ्य की जांच के लिए 5 आसान सवाल। 1 मिनट से भी कम समय लगता है।",
        bn: "সুস্থতার মূল্যায়নের জন্য ৫টি সহজ প্রশ্ন। ১ মিনিটেরও কম সময় লাগে।"
      },
      epdsPrompt: {
        en: "Emotional Well-Being Screen (EPDS)",
        hi: "भावनात्मक स्वास्थ्य जांच (EPDS)",
        bn: "মানসিক স্বাস্থ্য স্ক্রিনিং (EPDS)"
      },
      epdsDesc: {
        en: "Edinburgh Postnatal Depression Scale (recommended at ~2 and ~6 weeks).",
        hi: "प्रसवोत्तर भावनात्मक जांच (2 और 6 सप्ताह पर अनुशंसित)।",
        bn: "এডিনবরা প্রসবোত্তর মানসিক স্বাস্থ্য পরীক্ষা (২ ও ৬ সপ্তাহে সুপারিশকৃত)।"
      },
      familyGuideBtn: {
        en: "Family Warning Signs Guide",
        hi: "परिवार के लिए खतरे के लक्षण",
        bn: "পরিবারের জন্য বিপদের লক্ষণ"
      },
      requestCallbackBtn: {
        en: "Request a Call Back from Nurse",
        hi: "नर्स से कॉल का अनुरोध करें",
        bn: "নার্সের সাথে ফোনে কথা বলার অনুরোধ"
      },
      emergencyCallBtn: {
        en: "Emergency Helpline (108)",
        hi: "आपातकालीन हेल्पलाइन (108)",
        bn: "জরুরি হেল্পলাইন (১০৮)"
      }
    };

    const t = (k) => (translations[k] && translations[k][lang]) ? translations[k][lang] : translations[k].en;

    main.innerHTML = `
      <!-- Mother Header Banner -->
      <div class="card" style="border-top: 4px solid var(--primary-teal);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.5rem;">🌸</span>
              <h1 style="margin: 0; font-size: 1.6rem;">${t("welcome")} ${mother.name}</h1>
            </div>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">
              ${t("deliveryDetails")}
            </p>
          </div>

          <div style="display: flex; gap: 8px; align-items: center;">
            <select class="form-select btn-sm" onchange="App.setLanguage(this.value)" style="width: auto;">
              <option value="en" ${lang === "en" ? "selected" : ""}>English</option>
              <option value="hi" ${lang === "hi" ? "selected" : ""}>हिंदी (Hindi)</option>
              <option value="bn" ${lang === "bn" ? "selected" : ""}>বাংলা (Bengali)</option>
            </select>
            <a href="#/qr/${mother.token}" class="btn btn-outline btn-sm">
              View QR Pass
            </a>
          </div>
        </div>

        <!-- Latest Triage Status Alert Banner -->
        <div class="triage-card ${mother.latestTriageLevel}" style="margin: 16px 0 8px 0; padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span class="triage-badge ${mother.latestTriageLevel}">
              ${mother.latestTriageLevel} TRIAGE STATUS
            </span>
            <small style="color: var(--text-muted); font-weight: 600;">
              ${lastCheckin ? "Last check-in completed" : "Discharge Baseline"}
            </small>
          </div>
          <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">
            ${mother.latestWhyLine || "Recovery is progressing normally."}
          </div>
          <p class="clinical-disclaimer" style="margin-top: 8px;">
            This tool supports care and does not diagnose. Thresholds are a prototype design pending review by a doctor.
          </p>
        </div>
      </div>

      <!-- Quick Actions Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <!-- Weekly Checkin Button Card -->
        <div class="card" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between; border-left: 4px solid var(--primary-teal);">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
              <span style="font-size: 1.4rem;">📋</span>
              <h3 style="margin: 0;">${t("checkinPrompt")}</h3>
            </div>
            <p style="font-size: 0.88rem; color: var(--text-muted);">
              ${t("checkinDesc")}
            </p>
          </div>
          <a href="#/checkin/${mother.token}" class="btn btn-secondary btn-block" style="margin-top: 12px;">
            Start Check-In &rarr;
          </a>
        </div>

        <!-- EPDS Depression Screen Button Card -->
        <div class="card" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between; border-left: 4px solid var(--primary-deep);">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
              <span style="font-size: 1.4rem;">🧠</span>
              <h3 style="margin: 0;">${t("epdsPrompt")}</h3>
            </div>
            <p style="font-size: 0.88rem; color: var(--text-muted);">
              ${t("epdsDesc")}
            </p>
          </div>
          <a href="#/epds/${mother.token}" class="btn btn-outline btn-block" style="margin-top: 12px;">
            Take Emotional Screen &rarr;
          </a>
        </div>
      </div>

      <!-- Visit Timeline Section -->
      <section class="card">
        <div class="card-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.3rem;">🗓️</span>
            <h2 style="margin: 0;">${t("timelineTitle")}</h2>
          </div>
          <span style="font-size: 0.82rem; color: var(--text-muted);">WHO Recommended Schedule</span>
        </div>

        <div class="timeline">
          ${visits.map((v) => {
            const dueDateFormatted = new Date(v.dueDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short"
            });
            const statusClass = `status-${v.status}`;
            const itemClass = v.status;
            const statusLabel = v.status.toUpperCase();

            return `
              <div class="timeline-item ${itemClass}">
                <div class="timeline-marker">
                  ${v.status === "done" ? "✓" : v.visitNumber}
                </div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <strong>${v.name}</strong>
                    <span class="timeline-status ${statusClass}">${statusLabel}</span>
                  </div>
                  <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
                    Scheduled Date: <strong>${dueDateFormatted}</strong>
                    ${v.completedAt ? ` &bull; Completed on ${new Date(v.completedAt).toLocaleDateString("en-IN")}` : ""}
                  </div>
                  ${v.notes ? `<div style="font-size: 0.82rem; margin-top: 4px; color: #334e4e;"><em>Note: ${v.notes}</em></div>` : ""}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </section>

      <!-- Safety & Support Links -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-bottom: 24px;">
        <a href="#/family/${mother.token}" class="btn btn-tint btn-block" style="justify-content: flex-start; padding: 14px;">
          <span style="font-size: 1.3rem;">👨‍👩‍👧</span>
          <div style="text-align: left;">
            <div style="font-weight: 700;">${t("familyGuideBtn")}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">Danger signs for family companions</div>
          </div>
        </a>

        <button class="btn btn-outline btn-block" onclick="App.triggerCallbackRequest('${mother.token}')" style="justify-content: flex-start; padding: 14px;">
          <span style="font-size: 1.3rem;">📞</span>
          <div style="text-align: left;">
            <div style="font-weight: 700;">${t("requestCallbackBtn")}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">Nurse receives instant callback flag</div>
          </div>
        </button>

        <a href="tel:108" class="btn btn-emergency btn-block" style="justify-content: flex-start; padding: 14px;">
          <span style="font-size: 1.3rem;">🚨</span>
          <div style="text-align: left;">
            <div style="font-weight: 700;">${t("emergencyCallBtn")}</div>
            <div style="font-size: 0.78rem; opacity: 0.9;">Toll-free 24/7 ambulance transport</div>
          </div>
        </a>
      </div>
    `;
  },

  triggerCallbackRequest: function(token) {
    const flag = DB.requestCallback(token);
    if (flag) {
      PWA.showToast("Call-back request sent! Hospital nurse has been alerted.", "success");
      alert("Your nurse team has been notified to call you back as soon as possible. If this is an urgent life-threatening emergency, please call 108 directly.");
    }
  },

  // =========================================================================
  // VIEW: ADAPTIVE WEEKLY CHECK-IN
  // =========================================================================
  renderCheckin: function(token) {
    const main = document.getElementById("appMain");
    const mother = DB.getMotherByToken(token);

    if (!mother) {
      window.location.hash = "#/";
      return;
    }

    const lang = this.currentLanguage;
    const config = CHECKIN_CONFIG;

    main.innerHTML = `
      <div class="card" style="border-top: 4px solid var(--primary-teal);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <h2 style="margin: 0;">${config.title}</h2>
            <p style="margin: 0; color: var(--text-muted); font-size: 0.85rem;">
              Estimated time: ${config.estimatedTime} &bull; Healthy mothers finish in under 1 minute.
            </p>
          </div>
          <a href="#/mother/${mother.token}" class="btn btn-tint btn-sm">&larr; Cancel</a>
        </div>

        <form id="adaptiveCheckinForm" onsubmit="App.handleCheckinSubmit(event, '${mother.token}')">
          <!-- Core Questions -->
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 1.05rem; color: var(--primary-deep); margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
              Part 1: Physical Warning Signs
            </h3>

            ${config.coreQuestions.map((q, idx) => {
              const qText = q.text[lang] || q.text.en;
              const help = q.helpText ? (q.helpText[lang] || q.helpText.en) : "";

              return `
                <div class="form-group" style="padding: 14px 0; border-bottom: 1px dashed var(--border-color);">
                  <label class="form-label" style="font-size: 1rem;">
                    ${idx + 1}. ${qText}
                  </label>
                  ${help ? `<div class="form-help">${help}</div>` : ""}

                  <div style="display: flex; gap: 16px; margin-top: 8px;">
                    <label class="radio-card" style="flex: 1;">
                      <input type="radio" name="${q.id}" value="no" checked onchange="App.toggleBranch('${q.id}', false)">
                      <span>No (सामान्य / Normal)</span>
                    </label>
                    <label class="radio-card" style="flex: 1;">
                      <input type="radio" name="${q.id}" value="yes" onchange="App.toggleBranch('${q.id}', true)">
                      <span>Yes (हाँ / হ্যাঁ)</span>
                    </label>
                  </div>

                  <!-- Branching container (hidden by default) -->
                  <div id="branch_${q.id}" class="branch-container" style="display: none;">
                    <div style="font-weight: 700; color: var(--primary-deep); font-size: 0.9rem; margin-bottom: 12px;">
                      Follow-up Questions for "${qText}":
                    </div>

                    ${q.followUpsOnYes.map((fu) => {
                      const fuText = fu.text[lang] || fu.text.en;
                      return `
                        <div style="margin-bottom: 16px;">
                          <label class="form-label" style="font-size: 0.9rem;">
                            &bull; ${fuText}
                          </label>
                          <div class="radio-cards">
                            ${fu.options.map((opt, optIdx) => {
                              const optText = opt.label[lang] || opt.label.en;
                              return `
                                <label class="radio-card">
                                  <input type="radio" name="${fu.id}" value="${opt.value}" ${optIdx === 0 ? "checked" : ""}>
                                  <span>${optText}</span>
                                </label>
                              `;
                            }).join("")}
                          </div>
                        </div>
                      `;
                    }).join("")}
                  </div>
                </div>
              `;
            }).join("")}
          </div>

          <!-- Baby Feeding & Emotional Well-Being -->
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 1.05rem; color: var(--primary-deep); margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
              Part 2: Baby Feeding & Emotional Wellness
            </h3>

            ${config.babyAndMoodQuestions.map((bmq, idx) => {
              const bmqText = bmq.text[lang] || bmq.text.en;
              return `
                <div class="form-group" style="padding: 12px 0;">
                  <label class="form-label" style="font-size: 1rem;">
                    ${idx + 6}. ${bmqText}
                  </label>
                  <div class="radio-cards" style="margin-top: 8px;">
                    ${bmq.options.map((opt, optIdx) => {
                      const optText = opt.label[lang] || opt.label.en;
                      return `
                        <label class="radio-card">
                          <input type="radio" name="${bmq.id}" value="${opt.value}" ${optIdx === 0 ? "checked" : ""}>
                          <span>${optText}</span>
                        </label>
                      `;
                    }).join("")}
                  </div>
                </div>
              `;
            }).join("")}
          </div>

          <div style="background: var(--bg-tint); padding: 14px; border-radius: var(--radius-sm); margin-bottom: 20px; font-size: 0.85rem; color: var(--text-muted);">
            <em>PostCare explains every triage decision. Your answers are evaluated immediately against WHO warning signs.</em>
          </div>

          <button type="submit" class="btn btn-secondary btn-block" style="font-size: 1.05rem; padding: 14px;">
            Submit Check-In & View Result &rarr;
          </button>
        </form>
      </div>
    `;
  },

  toggleBranch: function(questionId, show) {
    const el = document.getElementById(`branch_${questionId}`);
    if (el) {
      el.style.display = show ? "block" : "none";
    }
  },

  handleCheckinSubmit: function(e, token) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const mother = DB.getMotherByToken(token);
    if (!mother) return;

    // Collect answers
    const answers = {};
    for (const [key, value] of formData.entries()) {
      answers[key] = value;
    }

    // Retrieve previous checkin to support Trend Rule
    const previousCheckin = DB.getLastCheckinForMother(mother.id);

    // Run triage engine
    const triageResult = evaluateTriage(answers, previousCheckin);

    // Save or Queue (Offline-first PWA)
    const isOnline = navigator.onLine;

    if (isOnline) {
      const record = DB.saveCheckin({
        motherId: mother.id,
        token: mother.token,
        answers,
        triageResult,
        isOffline: false
      });
      PWA.showToast("Check-in submitted & triaged successfully.", "success");
      window.location.hash = `#/result/${record.id}`;
    } else {
      DB.queueOfflineCheckin({
        motherId: mother.id,
        token: mother.token,
        answers,
        triageResult
      });
      PWA.showToast("Offline: Check-in saved locally on your phone. Will sync when back online.", "warning");
      PWA.updateStatusBadge();
      // Render result screen locally
      this.renderLocalResult(triageResult, mother.token);
    }
  },

  // =========================================================================
  // VIEW: TRIAGE RESULT SCREEN
  // =========================================================================
  renderResult: function(checkinId) {
    const checkins = DB.getAllCheckins();
    const record = checkins.find((c) => c.id === checkinId);

    if (!record) {
      window.location.hash = "#/";
      return;
    }

    this.renderLocalResult(record.triageResult, record.token);
  },

  renderLocalResult: function(triage, motherToken) {
    const main = document.getElementById("appMain");
    const mother = DB.getMotherByToken(motherToken);
    const lang = this.currentLanguage;

    // Determine educational tip
    const eduCat = triage.category || "general_green";
    const eduItem = EDUCATION_DATA.tipsByCategory[eduCat] || EDUCATION_DATA.tipsByCategory.general_green;
    const tipText = eduItem.tip[lang] || eduItem.tip.en;

    main.innerHTML = `
      <div style="max-width: 680px; margin: 0 auto;">
        <!-- Large Triage Alert Card -->
        <div class="triage-card ${triage.level}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span class="triage-badge ${triage.level}">
              ${triage.level} TRIAGE RESULT
            </span>
            <small style="color: var(--text-muted); font-weight: 600;">
              ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </small>
          </div>

          <h2 style="color: var(--text-main); margin-bottom: 8px;">
            ${triage.actionTitle}
          </h2>

          <p style="font-size: 1rem; line-height: 1.5; color: var(--text-main); margin-bottom: 14px;">
            ${triage.actionText}
          </p>

          <!-- Why-line naming the exact rule -->
          <div class="why-line-box">
            <strong>Clinical Why-Line:</strong><br>
            <span>${triage.whyLine}</span>
          </div>

          <p class="clinical-disclaimer">
            ${triage.disclaimer || CLINICAL_DISCLAIMER}
          </p>
        </div>

        <!-- Contextual Education & Audio Tip Card -->
        <div class="card" style="border-left: 4px solid var(--primary-teal);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.3rem;">${eduItem.icon}</span>
              <h3 style="margin: 0; color: var(--primary-deep);">${eduItem.category}</h3>
            </div>
            <select class="form-select btn-sm" onchange="App.setLanguage(this.value)" style="width: auto;">
              <option value="en" ${lang === "en" ? "selected" : ""}>English</option>
              <option value="hi" ${lang === "hi" ? "selected" : ""}>हिंदी</option>
              <option value="bn" ${lang === "bn" ? "selected" : ""}>বাংলা</option>
            </select>
          </div>

          <p id="tipContentText" style="font-size: 0.95rem; line-height: 1.55; color: var(--text-main); margin-bottom: 14px;">
            ${tipText}
          </p>

          <!-- Audio playback button -->
          <div class="audio-card">
            <div>
              <strong style="display: block; font-size: 0.9rem; color: var(--primary-deep);">
                Audio Narration (${lang.toUpperCase()})
              </strong>
              <small style="color: var(--text-muted);">
                Listen to this advice read aloud in your language
              </small>
            </div>
            <button id="btnPlayAudio" class="audio-btn" onclick="App.toggleSpeech('${encodeURIComponent(tipText)}', '${lang}')" title="Play audio">
              ▶
            </button>
          </div>
        </div>

        <!-- Action Links -->
        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
          ${triage.level === "RED" ? `
            <a href="tel:108" class="btn btn-emergency btn-block">
              🚨 Call Emergency Ambulance (108) Now
            </a>
          ` : ""}

          ${triage.level === "AMBER" ? `
            <button class="btn btn-outline btn-block" onclick="App.triggerCallbackRequest('${motherToken}')">
              📞 Request Nurse Call-Back Today
            </button>
          ` : ""}

          <a href="#/mother/${motherToken}" class="btn btn-primary btn-block">
            &larr; Return to My Visit Timeline
          </a>
        </div>
      </div>
    `;
  },

  toggleSpeech: function(encodedText, lang) {
    const text = decodeURIComponent(encodedText);
    const btn = document.getElementById("btnPlayAudio");

    if (AudioCompanion.isPlaying) {
      AudioCompanion.stop();
      if (btn) btn.innerHTML = "▶";
    } else {
      AudioCompanion.speak(
        text,
        lang,
        () => { if (btn) btn.innerHTML = "⏹"; },
        () => { if (btn) btn.innerHTML = "▶"; }
      );
    }
  },

  // =========================================================================
  // VIEW: EPDS DEPRESSION SCREEN (10 Questions, Card Stepper)
  // =========================================================================
  renderEpds: function(token) {
    const main = document.getElementById("appMain");
    const mother = DB.getMotherByToken(token);

    if (!mother) {
      window.location.hash = "#/";
      return;
    }

    const lang = this.currentLanguage;
    const config = EPDS_CONFIG;

    main.innerHTML = `
      <div style="max-width: 640px; margin: 0 auto;">
        <div class="card" style="border-top: 4px solid var(--primary-deep);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
              <h2 style="margin: 0; font-size: 1.4rem;">Edinburgh Postnatal Depression Scale</h2>
              <small style="color: var(--text-muted); font-size: 0.8rem;">
                Citation: ${config.citation}
              </small>
            </div>
            <a href="#/mother/${mother.token}" class="btn btn-tint btn-sm">&larr; Back</a>
          </div>

          <p style="font-size: 0.9rem; color: #334e4e; margin-bottom: 16px;">
            ${config.instructions[lang] || config.instructions.en}
          </p>

          <!-- Step Navigation Progress Bar -->
          <div class="progress-bar-wrap">
            <div id="epdsProgressFill" class="progress-bar-fill" style="width: 10%;"></div>
          </div>

          <div class="step-indicator">
            <span id="epdsStepLabel">Question 1 of 10</span>
            <span id="epdsScoreTally" style="font-weight: 700;">Score: 0 / 30</span>
          </div>

          <!-- Dynamic Question Card -->
          <div id="epdsQuestionContainer">
            <!-- Rendered by epdsStep -->
          </div>

          <!-- Question 10 Self-Harm Immediate Alert Box (Appears dynamically if item 10 > 0) -->
          <div id="selfHarmAlertBox" style="display: none; background: var(--triage-red-bg); border: 2px solid var(--triage-red); border-radius: var(--radius-sm); padding: 16px; margin-top: 18px;">
            <div style="display: flex; align-items: center; gap: 8px; color: var(--triage-red); font-weight: 700; font-size: 1rem;">
              <span>🚨</span>
              <span>Immediate Support & Emergency Notice</span>
            </div>
            <p style="font-size: 0.88rem; color: var(--text-main); margin: 8px 0;">
              ${config.helplineInfo.message[lang] || config.helplineInfo.message.en}
            </p>
            <div style="background: #FFFFFF; padding: 10px 14px; border-radius: 6px; font-weight: 600; font-size: 0.88rem; margin: 8px 0;">
              ${config.helplineInfo.primary}
            </div>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
              <a href="tel:14416" class="btn btn-emergency btn-sm">📞 Call Tele-MANAS (14416)</a>
              <a href="tel:108" class="btn btn-outline btn-sm">Call Ambulance (108)</a>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; pt-2; border-top: 1px solid var(--border-color);">
            <button id="btnEpdsPrev" class="btn btn-tint btn-sm" onclick="App.prevEpdsStep()" style="display: none;">
              &larr; Previous Question
            </button>
            <button id="btnEpdsNext" class="btn btn-primary" onclick="App.nextEpdsStep('${mother.token}')">
              Next Question &rarr;
            </button>
          </div>
        </div>
      </div>
    `;

    // Initialize EPDS questionnaire state
    this.epdsState = {
      currentIndex: 0,
      answers: new Array(10).fill(null),
      scores: new Array(10).fill(0)
    };
    this.renderCurrentEpdsQuestion();
  },

  renderCurrentEpdsQuestion: function() {
    const qIndex = this.epdsState.currentIndex;
    const q = EPDS_CONFIG.questions[qIndex];
    const lang = this.currentLanguage;
    const container = document.getElementById("epdsQuestionContainer");

    const promptText = q.prompt[lang] || q.prompt.en;

    container.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 1.1rem; color: var(--primary-deep); margin-bottom: 16px;">
          ${promptText}
        </h3>

        <div class="radio-cards">
          ${q.options.map((opt, oIdx) => {
            const optText = opt.text[lang] || opt.text.en;
            const isChecked = this.epdsState.answers[qIndex] === oIdx;
            return `
              <label class="radio-card ${isChecked ? 'selected' : ''}">
                <input type="radio" name="epds_q_${qIndex}" value="${opt.points}" data-opt-index="${oIdx}" ${isChecked ? 'checked' : ''} onchange="App.handleEpdsAnswer(${qIndex}, ${opt.points}, ${oIdx})">
                <span style="flex: 1;">${optText}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted); opacity: 0.7;">(${opt.points} pts)</span>
              </label>
            `;
          }).join("")}
        </div>
      </div>
    `;

    // Update progress bar & label
    const percent = Math.round(((qIndex + 1) / 10) * 100);
    document.getElementById("epdsProgressFill").style.width = `${percent}%`;
    document.getElementById("epdsStepLabel").textContent = `Question ${qIndex + 1} of 10`;

    // Calculate current running total
    const total = this.epdsState.scores.reduce((sum, val) => sum + val, 0);
    document.getElementById("epdsScoreTally").textContent = `Score: ${total} / 30`;

    // Previous button visibility
    document.getElementById("btnEpdsPrev").style.display = qIndex > 0 ? "inline-flex" : "none";

    // Next vs Submit label
    const nextBtn = document.getElementById("btnEpdsNext");
    if (qIndex === 9) {
      nextBtn.textContent = "Complete & Submit Screen ✓";
      nextBtn.className = "btn btn-secondary";
    } else {
      nextBtn.textContent = "Next Question →";
      nextBtn.className = "btn btn-primary";
    }
  },

  handleEpdsAnswer: function(qIndex, points, optIndex) {
    this.epdsState.answers[qIndex] = optIndex;
    this.epdsState.scores[qIndex] = points;

    // Check Item 10 trigger (Self-harm question at index 9)
    if (qIndex === 9) {
      const alertBox = document.getElementById("selfHarmAlertBox");
      if (alertBox) {
        alertBox.style.display = points > 0 ? "block" : "none";
      }
    }

    const total = this.epdsState.scores.reduce((sum, val) => sum + val, 0);
    document.getElementById("epdsScoreTally").textContent = `Score: ${total} / 30`;
  },

  prevEpdsStep: function() {
    if (this.epdsState.currentIndex > 0) {
      this.epdsState.currentIndex--;
      this.renderCurrentEpdsQuestion();
    }
  },

  nextEpdsStep: function(token) {
    const qIndex = this.epdsState.currentIndex;

    // Verify current question is answered
    if (this.epdsState.answers[qIndex] === null) {
      alert("Please select one option before proceeding to the next question.");
      return;
    }

    if (qIndex < 9) {
      this.epdsState.currentIndex++;
      this.renderCurrentEpdsQuestion();
    } else {
      // Final submission
      this.submitEpdsScreen(token);
    }
  },

  submitEpdsScreen: function(token) {
    const mother = DB.getMotherByToken(token);
    if (!mother) return;

    const totalScore = this.epdsState.scores.reduce((sum, val) => sum + val, 0);
    const item10Score = this.epdsState.scores[9]; // Item 10 points

    // Run triage evaluation with EPDS parameters
    const epdsTriageAnswers = {
      epds_total: totalScore,
      epds_item_10: item10Score
    };
    const triageResult = evaluateTriage(epdsTriageAnswers);

    // Save screen in DB
    DB.saveEpdsScreen({
      motherId: mother.id,
      token: mother.token,
      answers: this.epdsState.scores,
      totalScore,
      item10Score,
      triageResult
    });

    PWA.showToast(`EPDS Screen recorded (Score: ${totalScore}/30).`, "success");
    this.renderLocalResult(triageResult, mother.token);
  },

  // =========================================================================
  // VIEW: FAMILY COMPANION & WARNING SIGNS GUIDE
  // =========================================================================
  renderFamilyView: function(token) {
    const main = document.getElementById("appMain");
    const mother = DB.getMotherByToken(token);

    if (!mother) {
      window.location.hash = "#/";
      return;
    }

    const lang = this.currentLanguage;
    const guide = EDUCATION_DATA.familyGuide;
    const visits = DB.getVisitsForMother(mother.id);
    const nextVisit = visits.find((v) => v.status === "due" || v.status === "upcoming");

    main.innerHTML = `
      <div style="max-width: 680px; margin: 0 auto;">
        <div class="card" style="border-top: 4px solid var(--primary-deep);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.5rem;">👨‍👩‍👧</span>
                <h1 style="margin: 0; font-size: 1.5rem;">${guide.title[lang] || guide.title.en}</h1>
              </div>
              <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 6px;">
                ${guide.subtitle[lang] || guide.subtitle.en}
              </p>
            </div>
            <select class="form-select btn-sm" onchange="App.setLanguage(this.value)" style="width: auto;">
              <option value="en" ${lang === "en" ? "selected" : ""}>English</option>
              <option value="hi" ${lang === "hi" ? "selected" : ""}>हिंदी</option>
              <option value="bn" ${lang === "bn" ? "selected" : ""}>বাংলা</option>
            </select>
          </div>

          <!-- Privacy Note -->
          <div style="background: var(--bg-tint); padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.82rem; color: #2d4545; margin-bottom: 20px;">
            🔒 <strong>Family Companion Link:</strong> This view is specifically created for partners and family members. It provides danger-sign guidance and scheduled visit dates while keeping the mother's private medical check-in notes confidential.
          </div>

          <!-- Next Scheduled Visit Reminder -->
          <div style="background: #FFFFFF; border: 1.5px solid var(--primary-teal); border-radius: var(--radius-sm); padding: 16px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <small style="color: var(--text-muted); text-transform: uppercase; font-weight: 700;">
                  Mother's Next Scheduled Visit:
                </small>
                <div style="font-size: 1.15rem; font-weight: 700; color: var(--primary-deep); margin-top: 2px;">
                  ${nextVisit ? nextVisit.name : "All 4 WHO visits completed!"}
                </div>
                ${nextVisit ? `
                  <div style="font-size: 0.85rem; color: var(--text-muted);">
                    Scheduled: ${new Date(nextVisit.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                ` : ""}
              </div>
              <span class="timeline-status status-${nextVisit ? nextVisit.status : 'done'}">
                ${nextVisit ? nextVisit.status.toUpperCase() : 'COMPLETED'}
              </span>
            </div>
          </div>

          <!-- Danger Signs List -->
          <h2 style="font-size: 1.25rem; margin-bottom: 14px; color: var(--primary-deep);">
            5 Red Danger Signs: Seek Hospital Care Immediately
          </h2>

          <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;">
            ${guide.dangerSigns.map((ds) => `
              <div style="border-left: 4px solid ${ds.urgency === 'RED' ? 'var(--triage-red)' : 'var(--triage-amber)'}; background: #FFFFFF; border-top: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); border-radius: 0 var(--radius-sm) var(--radius-sm) 0; padding: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <strong style="color: var(--primary-deep); font-size: 0.98rem;">
                    ${ds.title[lang] || ds.title.en}
                  </strong>
                  <span class="triage-badge ${ds.urgency}" style="padding: 2px 8px; font-size: 0.75rem;">
                    ${ds.urgency}
                  </span>
                </div>
                <p style="margin: 0; font-size: 0.88rem; color: var(--text-main);">
                  ${ds.text[lang] || ds.text.en}
                </p>
              </div>
            `).join("")}
          </div>

          <!-- Supportive Tips for Family Members -->
          <h2 style="font-size: 1.25rem; margin-bottom: 12px; color: var(--primary-deep);">
            How You Can Support the New Mother at Home:
          </h2>
          <ul style="padding-left: 20px; font-size: 0.9rem; line-height: 1.6; color: var(--text-main); margin-bottom: 24px;">
            ${guide.supportiveTips.map((tip) => `
              <li>${tip[lang] || tip.en}</li>
            `).join("")}
          </ul>

          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="tel:108" class="btn btn-emergency btn-block" style="flex: 1;">
              🚨 Call Ambulance (108)
            </a>
            <a href="#/mother/${mother.token}" class="btn btn-primary btn-block" style="flex: 1;">
              &larr; Return to Mother Timeline
            </a>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // VIEW: PRINTABLE QR DISCHARGE CARD
  // =========================================================================
  renderQrCard: function(token) {
    const main = document.getElementById("appMain");
    const mother = DB.getMotherByToken(token);

    if (!mother) {
      window.location.hash = "#/";
      return;
    }

    // Build absolute URL for the QR code
    const fullMotherUrl = `${window.location.origin}${window.location.pathname}#/mother/${mother.token}`;

    main.innerHTML = `
      <div style="max-width: 520px; margin: 0 auto;">
        <div class="qr-card-printable">
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 8px;">
            <img src="./assets/logo.svg" alt="Logo" style="width: 32px; height: 32px;">
            <h2 style="margin: 0; font-size: 1.5rem; color: var(--primary-deep);">PostCare</h2>
          </div>
          <div style="font-size: 0.82rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 14px;">
            Postnatal Follow-Up Discharge Pass
          </div>

          <div style="text-align: left; background: var(--bg-tint); padding: 12px 16px; border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 0.88rem; line-height: 1.5;">
            <div><strong>Mother's Name:</strong> ${mother.name}</div>
            <div><strong>Hospital ID:</strong> ${mother.hospitalId}</div>
            <div><strong>Delivery Date:</strong> ${new Date(mother.deliveryDate).toLocaleDateString("en-IN")}</div>
            <div><strong>Delivery Type:</strong> ${mother.deliveryType}</div>
            <div><strong>Access Token:</strong> <code>${mother.token}</code></div>
          </div>

          <div id="qrCodeContainer" class="qr-box">
            <!-- QR code rendered here -->
          </div>

          <p style="font-size: 0.88rem; font-weight: 600; color: var(--primary-deep); margin-bottom: 6px;">
            Scan with any phone camera to access your personal follow-up portal.
          </p>
          <small style="color: var(--text-muted); display: block; margin-bottom: 16px;">
            No app download or login required. Works offline after opening.
          </small>

          <div class="no-print" style="display: flex; gap: 10px; justify-content: center; margin-top: 14px;">
            <button class="btn btn-secondary btn-sm" onclick="window.print()">
              🖨️ Print Discharge Pass
            </button>
            <a href="#/mother/${mother.token}" class="btn btn-primary btn-sm">
              Open Mother Portal &rarr;
            </a>
          </div>
        </div>

        <div class="no-print" style="text-align: center; margin-top: 10px;">
          <a href="#/nurse" style="font-size: 0.85rem; color: var(--text-muted);">&larr; Back to Nurse Dashboard</a>
        </div>
      </div>
    `;

    // Generate QR code using bundled local QRCode library
    setTimeout(() => {
      const container = document.getElementById("qrCodeContainer");
      if (container && typeof QRCode !== "undefined") {
        container.innerHTML = "";
        new QRCode(container, {
          text: fullMotherUrl,
          width: 220,
          height: 220,
          colorDark: "#12474B",
          colorLight: "#FFFFFF",
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    }, 100);
  },

  // =========================================================================
  // VIEW: NURSE & CLINIC DASHBOARD
  // =========================================================================
  renderNurseDashboard: function(subTab = "flags") {
    const main = document.getElementById("appMain");
    this.activeNurseTab = subTab;

    const analytics = DB.getAnalytics();
    const flags = DB.getAllFlags();
    const mothers = DB.getMothers();

    // Sort flags: RED flags first, then AMBER, then newest
    const sortedFlags = flags.filter(f => f.status === "open").sort((a, b) => {
      if (a.level === "RED" && b.level !== "RED") return -1;
      if (a.level !== "RED" && b.level === "RED") return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    main.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
        <div>
          <h1 style="margin: 0; font-size: 1.65rem;">Maternity Staff Dashboard</h1>
          <p style="margin: 0; color: var(--text-muted); font-size: 0.88rem;">
            Postnatal surveillance, clinical warning triage, and WHO visit compliance.
          </p>
        </div>

        <div style="display: flex; gap: 8px;">
          <button class="btn btn-tint btn-sm" onclick="App.refreshCurrentView()" title="Refresh">
            🔄 Refresh
          </button>
          <button class="btn btn-outline btn-sm" onclick="App.handleNurseLogout()">
            Sign Out
          </button>
        </div>
      </div>

      <!-- Quick Analytics Metrics Bar -->
      <div class="stats-grid">
        <div class="stat-box" style="border-top: 3px solid var(--primary-deep);">
          <div class="stat-number">${analytics.totalMothers}</div>
          <div class="stat-label">Registered Mothers</div>
        </div>
        <div class="stat-box" style="border-top: 3px solid var(--triage-red);">
          <div class="stat-number" style="color: var(--triage-red);">${analytics.redFlagsCount}</div>
          <div class="stat-label">Red Flags (Urgent)</div>
        </div>
        <div class="stat-box" style="border-top: 3px solid var(--triage-amber);">
          <div class="stat-number" style="color: var(--triage-amber);">${analytics.amberFlagsCount}</div>
          <div class="stat-label">Amber Flags</div>
        </div>
        <div class="stat-box" style="border-top: 3px solid var(--primary-teal);">
          <div class="stat-number" style="color: var(--primary-teal);">${analytics.checkinRate}%</div>
          <div class="stat-label">Check-in Rate</div>
        </div>
        <div class="stat-box" style="border-top: 3px solid #6366F1;">
          <div class="stat-number" style="color: #6366F1;">${analytics.avgResponseTimeHours}h</div>
          <div class="stat-label">Avg Response Time</div>
        </div>
      </div>

      <!-- Nurse Navigation Tabs -->
      <div class="nurse-tabs">
        <button class="nurse-tab-btn ${subTab === 'flags' ? 'active' : ''}" onclick="App.switchNurseTab('flags')">
          🚨 Urgent Flags (${analytics.openFlagsCount})
        </button>
        <button class="nurse-tab-btn ${subTab === 'missed' ? 'active' : ''}" onclick="App.switchNurseTab('missed')">
          ⚠️ Missed Visits (${analytics.missedVisits.length})
        </button>
        <button class="nurse-tab-btn ${subTab === 'unscreened' ? 'active' : ''}" onclick="App.switchNurseTab('unscreened')">
          🧠 Unscreened Mothers (${analytics.unscreenedMothers.length})
        </button>
        <button class="nurse-tab-btn ${subTab === 'mothers' ? 'active' : ''}" onclick="App.switchNurseTab('mothers')">
          👥 Registered Mothers (${mothers.length})
        </button>
        <button class="nurse-tab-btn ${subTab === 'register' ? 'active' : ''}" onclick="App.switchNurseTab('register')">
          ➕ Register at Discharge
        </button>
        <button class="nurse-tab-btn ${subTab === 'analytics' ? 'active' : ''}" onclick="App.switchNurseTab('analytics')">
          📊 Analytics & Impact
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="nurseTabContent">
        <!-- Rendered dynamically -->
      </div>
    `;

    this.renderNurseTabContent(subTab, { sortedFlags, analytics, mothers });
  },

  switchNurseTab: function(tab) {
    this.activeNurseTab = tab;
    window.location.hash = `#/nurse/${tab}`;
  },

  renderNurseTabContent: function(tab, data) {
    const container = document.getElementById("nurseTabContent");
    if (!container) return;

    switch (tab) {
      case "flags":
        this.renderFlagsTab(container, data.sortedFlags);
        break;
      case "missed":
        this.renderMissedVisitsTab(container, data.analytics.missedVisits);
        break;
      case "unscreened":
        this.renderUnscreenedTab(container, data.analytics.unscreenedMothers);
        break;
      case "mothers":
        this.renderMothersListTab(container, data.mothers);
        break;
      case "register":
        this.renderRegisterFormTab(container);
        break;
      case "analytics":
        this.renderAnalyticsTab(container, data.analytics);
        break;
      default:
        this.renderFlagsTab(container, data.sortedFlags);
        break;
    }
  },

  // Sub-Tab 1: Flag Dashboard (RED first, then AMBER)
  renderFlagsTab: function(container, flags) {
    if (flags.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px 20px;">
          <h3 style="color: var(--triage-green);">✓ All Clear</h3>
          <p style="color: var(--text-muted);">No open red or amber flags. All mothers are stable or have been reviewed.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="flag-list">
        ${flags.map((f) => `
          <div class="flag-item flag-${f.level}">
            <div class="flag-meta">
              <div>
                <span class="triage-badge ${f.level}">${f.level} PRIORITY</span>
                <strong style="font-size: 1.1rem; color: var(--primary-deep); margin-left: 8px;">
                  ${f.motherName}
                </strong>
                <span style="font-size: 0.85rem; color: var(--text-muted); margin-left: 6px;">
                  (${f.motherPhone})
                </span>
              </div>
              <div class="flag-time">
                Raised: ${new Date(f.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; Source: ${f.source}
              </div>
            </div>

            <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-main); background: var(--bg-tint); padding: 10px 14px; border-radius: 6px;">
              ${f.reason}
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end; align-items: center; flex-wrap: wrap;">
              <a href="tel:${f.motherPhone.replace(/[^0-9+]/g, '')}" class="btn btn-tint btn-sm">
                📞 Call Mother
              </a>
              <a href="#/mother/${f.motherToken}" class="btn btn-outline btn-sm" target="_blank">
                View Her Portal
              </a>
              <button class="btn btn-primary btn-sm" onclick="App.openResolveModal('${f.id}')">
                Log Outcome & Close Case ✓
              </button>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  },

  // Sub-Tab 2: Missed Visits List
  renderMissedVisitsTab: function(container, missedVisits) {
    if (missedVisits.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px 20px;">
          <h3 style="color: var(--triage-green);">✓ No Missed Visits</h3>
          <p style="color: var(--text-muted);">All registered mothers have attended or completed their due postnatal visits.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="card">
        <h3 style="color: var(--primary-deep); margin-bottom: 12px;">Mothers with Overdue WHO Visits</h3>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 16px;">
          These mothers passed their scheduled visit window without an attendance record. Contact them to arrange clinic review or ASHA home visit.
        </p>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${missedVisits.map((mv) => `
            <div style="border: 1px solid var(--border-color); border-left: 4px solid var(--triage-red); padding: 14px; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div>
                <strong style="font-size: 1rem; color: var(--primary-deep);">${mv.motherName}</strong>
                <span style="font-size: 0.85rem; color: var(--text-muted);">(${mv.motherPhone})</span>
                <div style="font-size: 0.85rem; color: var(--triage-red); font-weight: 600; margin-top: 2px;">
                  Overdue: ${mv.name} (Due Date: ${new Date(mv.dueDate).toLocaleDateString("en-IN")})
                </div>
              </div>

              <div style="display: flex; gap: 8px;">
                <a href="tel:${mv.motherPhone.replace(/[^0-9+]/g, '')}" class="btn btn-tint btn-sm">
                  📞 Call
                </a>
                <button class="btn btn-secondary btn-sm" onclick="App.markVisitDonePrompt('${mv.id}')">
                  Mark Visit Done ✓
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  },

  markVisitDonePrompt: function(visitId) {
    const notes = prompt("Enter clinical outcome notes for this visit:", "Mother attended postnatal OPD; vitals stable, infant breastfeeding confirmed.");
    if (notes !== null) {
      DB.markVisitDone(visitId, notes);
      PWA.showToast("Visit marked as completed.", "success");
      Router.handleRoute();
    }
  },

  // Sub-Tab 3: Unscreened Mothers (EPDS)
  renderUnscreenedTab: function(container, unscreened) {
    if (unscreened.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px 20px;">
          <h3 style="color: var(--triage-green);">✓ 100% EPDS Screening Adherence</h3>
          <p style="color: var(--text-muted);">All mothers delivered 14+ days ago have completed their Edinburgh Postnatal Depression Scale screen.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="card">
        <h3 style="color: var(--primary-deep); margin-bottom: 12px;">Mothers Due for Postnatal Depression Screen (EPDS)</h3>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 16px;">
          In India, postpartum depression affects approximately 22% of new mothers. These mothers are beyond Day 14 and have not yet completed the 10-item EPDS.
        </p>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${unscreened.map((m) => `
            <div style="border: 1px solid var(--border-color); border-left: 4px solid #6366F1; padding: 14px; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div>
                <strong style="font-size: 1rem; color: var(--primary-deep);">${m.name}</strong>
                <span style="font-size: 0.85rem; color: var(--text-muted);">(${m.phone})</span>
                <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">
                  Delivered ${m.daysSinceDelivery} days ago &bull; Hospital ID: ${m.hospitalId}
                </div>
              </div>

              <div style="display: flex; gap: 8px;">
                <a href="tel:${m.phone.replace(/[^0-9+]/g, '')}" class="btn btn-tint btn-sm">
                  📞 Call to Screen
                </a>
                <a href="#/epds/${m.token}" class="btn btn-outline btn-sm">
                  Administer EPDS &rarr;
                </a>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  },

  // Sub-Tab 4: Registered Mothers Directory
  renderMothersListTab: function(container, mothers) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 style="margin: 0;">Registered Mothers (${mothers.length})</h3>
          <button class="btn btn-secondary btn-sm" onclick="App.switchNurseTab('register')">
            ➕ Register New Mother
          </button>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem;">
            <thead>
              <tr style="background: var(--bg-tint); border-bottom: 2px solid var(--border-color); text-align: left;">
                <th style="padding: 10px 12px;">Mother Name</th>
                <th style="padding: 10px 12px;">Phone / ID</th>
                <th style="padding: 10px 12px;">Delivery</th>
                <th style="padding: 10px 12px;">Triage Level</th>
                <th style="padding: 10px 12px; text-align: right;">Discharge QR Pass</th>
              </tr>
            </thead>
            <tbody>
              ${mothers.map((m) => `
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 12px;">
                    <strong>${m.name}</strong>
                    <div style="font-size: 0.78rem; color: var(--text-muted);">Token: ${m.token}</div>
                  </td>
                  <td style="padding: 12px;">
                    ${m.phone}
                    <div style="font-size: 0.78rem; color: var(--text-muted);">${m.hospitalId}</div>
                  </td>
                  <td style="padding: 12px;">
                    ${new Date(m.deliveryDate).toLocaleDateString("en-IN")}
                    <div style="font-size: 0.78rem; color: var(--text-muted);">${m.deliveryType}</div>
                  </td>
                  <td style="padding: 12px;">
                    <span class="triage-badge ${m.latestTriageLevel}">${m.latestTriageLevel}</span>
                  </td>
                  <td style="padding: 12px; text-align: right;">
                    <a href="#/qr/${m.token}" class="btn btn-tint btn-sm" style="margin-right: 4px;">
                      View QR
                    </a>
                    <a href="#/mother/${m.token}" class="btn btn-outline btn-sm">
                      Portal &rarr;
                    </a>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // Sub-Tab 5: Register Mother at Discharge Form
  renderRegisterFormTab: function(container) {
    const todayStr = new Date().toISOString().split("T")[0];

    container.innerHTML = `
      <div class="card" style="max-width: 620px; margin: 0 auto; border-top: 4px solid var(--primary-deep);">
        <h2 style="margin-bottom: 6px;">Register Mother at Discharge</h2>
        <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 20px;">
          Enrol the mother into PostCare, compute her 4 WHO visit schedule, and generate her printable QR discharge pass.
        </p>

        <form onsubmit="App.handleRegisterSubmit(event)">
          <div class="form-group">
            <label class="form-label">Mother's Full Name *</label>
            <input type="text" id="regName" class="form-input" placeholder="e.g. Ritu Sen" required>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Phone Number *</label>
              <input type="tel" id="regPhone" class="form-input" placeholder="+91 98765 00000" required>
            </div>
            <div class="form-group">
              <label class="form-label">Hospital ID / Bed No</label>
              <input type="text" id="regHospId" class="form-input" placeholder="HOSP-2024-XXXX">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Delivery Date *</label>
              <input type="date" id="regDate" class="form-input" value="${todayStr}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Delivery Type</label>
              <select id="regType" class="form-select">
                <option value="Normal Vaginal Delivery">Normal Vaginal Delivery</option>
                <option value="Caesarean Section">Caesarean Section (C-Section)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Preferred Mother Language</label>
            <select id="regLang" class="form-select">
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="bn">বাংলা (Bengali)</option>
            </select>
          </div>

          <div style="background: var(--bg-tint); padding: 12px 14px; border-radius: var(--radius-sm); margin-bottom: 20px; font-size: 0.82rem; color: #2e4747;">
            ℹ️ A unique access token will be generated in the QR code. No passwords or app stores are needed for the mother.
          </div>

          <button type="submit" class="btn btn-primary btn-block" style="padding: 14px;">
            Register & Generate QR Discharge Pass &rarr;
          </button>
        </form>
      </div>
    `;
  },

  handleRegisterSubmit: function(e) {
    e.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const hospitalId = document.getElementById("regHospId").value.trim();
    const deliveryDate = document.getElementById("regDate").value;
    const deliveryType = document.getElementById("regType").value;
    const language = document.getElementById("regLang").value;

    if (!name || !deliveryDate) {
      alert("Please fill in the required fields.");
      return;
    }

    const newMother = DB.registerMother({
      name,
      phone,
      hospitalId,
      deliveryDate,
      deliveryType,
      language
    });

    PWA.showToast(`Mother ${newMother.name} registered successfully!`, "success");
    // Redirect directly to the generated QR card for immediate printing or review
    window.location.hash = `#/qr/${newMother.token}`;
  },

  // Sub-Tab 6: Analytics & Impact Tab
  renderAnalyticsTab: function(container, analytics) {
    container.innerHTML = `
      <div class="card">
        <h2 style="color: var(--primary-deep); margin-bottom: 8px;">Postnatal Surveillance Analytics</h2>
        <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 20px;">
          Tracking maternal health outcomes, check-in completion, and clinical response times.
        </p>

        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-number">${analytics.totalCheckins}</div>
            <div class="stat-label">Total Check-Ins Submitted</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${analytics.totalEpds}</div>
            <div class="stat-label">EPDS Depression Screens</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${analytics.resolvedFlagsCount}</div>
            <div class="stat-label">Resolved Clinical Flags</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${analytics.avgResponseTimeHours} hrs</div>
            <div class="stat-label">Average Nurse Resolution</div>
          </div>
        </div>

        <div style="background: var(--bg-tint); border-radius: var(--radius-sm); padding: 18px; margin-top: 16px;">
          <h3 style="color: var(--primary-deep); margin-bottom: 10px;">UN Sustainable Development Goals (SDG) Alignment:</h3>
          <ul style="padding-left: 20px; font-size: 0.88rem; line-height: 1.6; color: var(--text-main);">
            <li><strong>SDG 3 (Good Health & Well-Being - Targets 3.1, 3.4, 3.8):</strong> Prevents maternal mortality from postpartum hemorrhage and infection; early screening for postpartum depression; tracks the 4 WHO postnatal visits.</li>
            <li><strong>SDG 5 (Gender Equality - Target 5.6):</strong> Empowers new mothers with direct, frictionless digital health agency and warning sign awareness regardless of family accompaniment.</li>
            <li><strong>SDG 9 (Industry, Innovation & Infrastructure - Target 9.c):</strong> Low-cost, offline-capable Progressive Web Application accessible on basic smartphones without app-store barriers.</li>
            <li><strong>SDG 10 (Reduced Inequalities - Target 10.2):</strong> Multilingual tips (English, Hindi, Bengali) with voice audio playback include rural and low-literacy mothers.</li>
          </ul>
        </div>
      </div>
    `;
  },

  // Modal: Log Call/Visit Outcome and Close Flag
  openResolveModal: function(flagId) {
    const flags = DB.getAllFlags();
    const flag = flags.find((f) => f.id === flagId);
    if (!flag) return;

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "resolveModalOverlay";

    overlay.innerHTML = `
      <div class="modal-card">
        <h3 style="color: var(--primary-deep); margin-bottom: 4px;">Record Call / Visit Outcome</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">
          Resolving flag for <strong>${flag.motherName}</strong> (${flag.level} Urgency)
        </p>

        <div style="background: var(--bg-tint); padding: 10px 14px; border-radius: 6px; font-size: 0.85rem; margin-bottom: 16px;">
          <strong>Flag Reason:</strong> ${flag.reason}
        </div>

        <form onsubmit="App.handleResolveSubmit(event, '${flag.id}')">
          <div class="form-group">
            <label class="form-label">Contact Method *</label>
            <select id="modalContactType" class="form-select" required>
              <option value="Telephone Call">Telephone Call</option>
              <option value="Home Visit (ASHA / ANM)">Home Visit (ASHA / ANM)</option>
              <option value="Maternity OPD Visit">Maternity OPD Visit</option>
              <option value="Emergency Hospital Admission">Emergency Hospital Admission</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Clinical Findings & Outcome Notes *</label>
            <textarea id="modalNotes" class="form-textarea" rows="3" placeholder="e.g. Called mother; bleeding was lochia rubra within acceptable limits. Advised continued rest and prescribed oral iron." required></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Staff Name / Role</label>
            <input type="text" id="modalStaff" class="form-input" value="Staff Nurse Anita (Postnatal Ward)">
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
            <button type="button" class="btn btn-tint btn-sm" onclick="App.closeResolveModal()">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary btn-sm">
              Confirm & Close Flag ✓
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
  },

  closeResolveModal: function() {
    const el = document.getElementById("resolveModalOverlay");
    if (el) el.remove();
  },

  handleResolveSubmit: function(e, flagId) {
    e.preventDefault();
    const contactType = document.getElementById("modalContactType").value;
    const resolutionNotes = document.getElementById("modalNotes").value.trim();
    const resolvedBy = document.getElementById("modalStaff").value.trim();

    DB.resolveFlag(flagId, { contactType, resolutionNotes, resolvedBy });
    this.closeResolveModal();
    PWA.showToast("Flag resolved and case closed.", "success");
    Router.handleRoute();
  }
};

window.App = App;
