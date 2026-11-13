/**
 * PostCare PWA Controller
 * Handles Service Worker lifecycle, offline status detection,
 * automatic queue synchronization, and "Add to Home Screen" install prompt.
 */

const PWA = {
  deferredPrompt: null,
  isOnline: navigator.onLine,

  init: function() {
    this.registerServiceWorker();
    this.setupNetworkListeners();
    this.setupInstallPrompt();
    this.updateStatusBadge();
  },

  registerServiceWorker: function() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("./sw.js")
          .then((reg) => {
            console.log("[PWA] Service Worker registered successfully, scope:", reg.scope);
          })
          .catch((err) => {
            console.warn("[PWA] Service Worker registration failed:", err);
          });
      });
    }
  },

  setupNetworkListeners: function() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.updateStatusBadge();
      this.syncPendingData();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.updateStatusBadge();
    });
  },

  updateStatusBadge: function() {
    const badge = document.getElementById("networkStatusBadge");
    if (!badge) return;

    const queue = typeof DB !== "undefined" ? DB.getOfflineQueue() : [];

    if (this.isOnline) {
      if (queue.length > 0) {
        badge.className = "network-badge syncing";
        badge.innerHTML = `<span class="dot"></span> Syncing (${queue.length} queued)...`;
      } else {
        badge.className = "network-badge online";
        badge.innerHTML = `<span class="dot"></span> Online`;
      }
    } else {
      badge.className = "network-badge offline";
      badge.innerHTML = `<span class="dot"></span> Offline Mode ${queue.length > 0 ? `(${queue.length} saved locally)` : ""}`;
    }
  },

  syncPendingData: function() {
    if (typeof DB === "undefined") return;

    const count = DB.syncOfflineQueue();
    if (count > 0) {
      this.showToast(`✓ Reconnected! ${count} check-in(s) synced to care team.`, "success");
      this.updateStatusBadge();
      // If nurse or mother view is active, refresh current view
      if (typeof App !== "undefined" && App.refreshCurrentView) {
        App.refreshCurrentView();
      }
    } else {
      this.updateStatusBadge();
    }
  },

  setupInstallPrompt: function() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      const installBtn = document.getElementById("btnInstallPwa");
      if (installBtn) {
        installBtn.style.display = "inline-flex";
      }
    });

    window.addEventListener("appinstalled", () => {
      this.deferredPrompt = null;
      const installBtn = document.getElementById("btnInstallPwa");
      if (installBtn) installBtn.style.display = "none";
      console.log("[PWA] PostCare installed successfully.");
    });
  },

  promptInstall: function() {
    if (!this.deferredPrompt) {
      alert("To install PostCare on your phone:\n\n1. Open your browser menu (three dots in Chrome or Share icon in Safari)\n2. Tap 'Add to Home Screen'");
      return;
    }
    this.deferredPrompt.prompt();
    this.deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("[PWA] User accepted installation prompt");
      }
      this.deferredPrompt = null;
    });
  },

  showToast: function(message, type = "info") {
    const existing = document.getElementById("postcareToast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "postcareToast";
    toast.className = `pwa-toast ${type}`;
    toast.innerHTML = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("visible");
    }, 50);

    setTimeout(() => {
      toast.classList.remove("visible");
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }
};

window.PWA = PWA;
