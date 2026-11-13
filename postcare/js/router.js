/**
 * PostCare Client Hash Router
 * Parses location.hash and routes to corresponding view handler in App.
 * Safe for GitHub Pages subdirectory deployments (never requires server rewriting).
 */

const Router = {
  routes: {},

  init: function() {
    window.addEventListener("hashchange", () => this.handleRoute());
    window.addEventListener("load", () => this.handleRoute());
  },

  handleRoute: function() {
    const rawHash = window.location.hash || "#/";
    const cleanHash = rawHash.replace(/^#\/?/, "").split("?")[0];
    const parts = cleanHash.split("/").filter(Boolean);

    // Default route
    if (parts.length === 0) {
      if (typeof App !== "undefined") App.renderHome();
      return;
    }

    const routeName = parts[0].toLowerCase();
    const param = parts[1] || null;

    switch (routeName) {
      case "login":
        App.renderLogin();
        break;

      case "nurse":
        App.renderNurseDashboard(param); // optional sub-tab
        break;

      case "mother":
      case "m":
        if (param) {
          App.renderMotherDashboard(param);
        } else {
          window.location.hash = "#/";
        }
        break;

      case "checkin":
        if (param) {
          App.renderCheckin(param);
        } else {
          window.location.hash = "#/";
        }
        break;

      case "result":
        if (param) {
          App.renderResult(param);
        } else {
          window.location.hash = "#/";
        }
        break;

      case "epds":
        if (param) {
          App.renderEpds(param);
        } else {
          window.location.hash = "#/";
        }
        break;

      case "family":
        if (param) {
          App.renderFamilyView(param);
        } else {
          window.location.hash = "#/";
        }
        break;

      case "qr":
        if (param) {
          App.renderQrCard(param);
        } else {
          window.location.hash = "#/";
        }
        break;

      default:
        App.renderHome();
        break;
    }

    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  navigate: function(hash) {
    window.location.hash = hash;
  }
};

window.Router = Router;
