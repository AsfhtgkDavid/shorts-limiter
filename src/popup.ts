/// <reference types="chrome"/>
// YouTube Shorts Limiter - Popup Script

import type { GenericSettings, Settings } from "./types.ts";
import type Browser from "webextension-polyfill";

declare const browser: typeof Browser;

const ext =
  (typeof chrome !== "undefined" ? chrome : browser) as typeof Browser;

const getMessage = ext.i18n.getMessage;

class PopupManager {
  shortsCount = 0;
  maxShorts = 5;
  enabled = false;
  badgeEnabled = false;
  constructor() {
    this.init();
  }

  async init() {
    await this.loadData();
    this.loadTranslations();
    this.setupEventListeners();
    this.updateUI();
  }

  async loadData() {
    const today = this.getTodayKey();
    const result = await ext.storage.local.get([
      today,
      "maxShorts",
      "enabled",
      "badgeEnabled",
    ]) as unknown as Settings & GenericSettings;

    this.shortsCount = Number(result[today]) || 0;
    this.maxShorts = result.maxShorts || 5;
    this.enabled = result.enabled !== false; // by default enabled
    this.badgeEnabled = result.badgeEnabled;
  }

  async saveData() {
    await ext.storage.local.set({
      maxShorts: this.maxShorts,
      enabled: this.enabled,
      badgeEnabled: this.badgeEnabled,
    });
  }

  loadTranslations() {
    document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
      const i18n = element.dataset.i18n;
      if (!i18n) return;
      const text = getMessage(i18n);
      element.innerText = text;
    });
  }

  getTodayKey() {
    const today = new Date();
    return `shorts_${today.getFullYear()}_${today.getMonth()}_${today.getDate()}`;
  }

  setupEventListeners() {
    // button for resetting counter
    document.getElementById("reset-btn")?.addEventListener("click", () => {
      this.resetShortsCount();
    });

    // enable/disable button
    document.getElementById("toggle-btn")?.addEventListener("click", () => {
      this.toggleExtension();
    });

    document.getElementById("enable-badge")?.addEventListener(
      "click",
      async (event) => {
        const element = event.target as HTMLInputElement;
        this.badgeEnabled = element.checked;
        await this.saveData();
        const message = element.checked ? "UPDATE_BADGE" : "CLEAR_BADGE";
        await ext.runtime.sendMessage({ type: message });
      },
    );

    // number input for limit
    document.getElementById("max-shorts-input")?.addEventListener(
      "change",
      (event) => {
        const target = event.target as HTMLInputElement;
        this.maxShorts = parseInt(target.value);
        this.saveData();
        this.updateUI();
      },
    );

    setInterval(async () => {
      try {
        await this.loadData();
        this.updateUI();
        console.log("Refreshed data");
      } catch (err) {
        console.error(err);
        console.log("Failed to refresh data");
      }
    }, 2000);
  }

  async resetShortsCount() {
    const today = this.getTodayKey();
    await ext.storage.local.remove(today);
    this.shortsCount = 0;
    this.updateUI();

    // updating counter on opened YouTube tabs
    const tabs = await ext.tabs.query({ url: "*://*.youtube.com/*" });
    for (const tab of tabs) {
      if (!tab.id) continue;
      try {
        await ext.tabs.sendMessage(tab.id, { type: "RESET_COUNT" });
      } catch (err) {
        console.error(err);
      }
    }
  }

  async toggleExtension() {
    this.enabled = !this.enabled;
    await this.saveData();
    this.updateUI();

    // updating status on active YouTube tabs
    const tabs = await ext.tabs.query({ url: "*://*.youtube.com/*" });
    for (const tab of tabs) {
      if (!tab.id) continue;
      try {
        await ext.tabs.sendMessage(tab.id, {
          type: "TOGGLE_EXTENSION",
          enabled: this.enabled,
        });
      } catch (err) {
        console.error(err);
      }
    }
  }

  updateUI() {
    const shortsCountElement = document.getElementById(
      "shorts-count",
    ) as HTMLSpanElement;
    const maxShortsElement = document.getElementById(
      "max-shorts",
    ) as HTMLSpanElement;
    const maxShortsInputElement = document.getElementById(
      "max-shorts-input",
    ) as HTMLInputElement;
    const badgeEnableElement = document.getElementById(
      "enable-badge",
    ) as HTMLInputElement;

    // updating counters with saved data
    shortsCountElement.textContent = this.shortsCount.toString();
    maxShortsElement.textContent = this.maxShorts.toString();
    maxShortsInputElement.value = this.maxShorts.toString();
    badgeEnableElement.checked = this.badgeEnabled;

    // updating progress bar
    const progressFill = document.getElementById(
      "progress-fill",
    ) as HTMLDivElement;
    const percentage = Math.min((this.shortsCount / this.maxShorts) * 100, 100);
    progressFill.style.width = percentage + "%";

    // updating color of progress bar
    progressFill.className = "progress-fill";
    if (percentage >= 80) {
      progressFill.classList.add("danger");
    } else if (percentage >= 60) {
      progressFill.classList.add("warning");
    }

    // updating status text
    const statusText = document.getElementById("status-text") as HTMLDivElement;
    if (this.shortsCount >= this.maxShorts) {
      statusText.textContent = getMessage("statusLimitReached");
      statusText.style.color = "#f44336";
    } else if (this.shortsCount >= this.maxShorts * 0.8) {
      statusText.textContent = getMessage("statusAlmostAtLimit");
      statusText.style.color = "#FF9800";
    } else {
      statusText.textContent = getMessage("statusCanWatchShorts");
      statusText.style.color = "#4CAF50";
    }

    // updating extension status
    const extensionStatus = document.getElementById(
      "extension-status",
    ) as HTMLDivElement;
    if (this.enabled) {
      extensionStatus.textContent = getMessage("extensionEnabled");
      extensionStatus.className = "status enabled";
    } else {
      extensionStatus.textContent = getMessage("extensionDisabled");
      extensionStatus.className = "status disabled";
    }

    // updating toggle button status
    const toggleBtn = document.getElementById(
      "toggle-btn",
    ) as HTMLButtonElement;
    const disable = getMessage("disable");
    const enable = getMessage("enable");
    toggleBtn.textContent = this.enabled ? disable : enable;
    toggleBtn.className = this.enabled ? "" : "danger";
  }
}

// activating popup manager class on page load
document.addEventListener("DOMContentLoaded", () => {
  new PopupManager();
});
