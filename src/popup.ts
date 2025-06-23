/// <reference types="chrome"/>
// // YouTube Shorts Limiter - Popup Script

import browser from "webextension-polyfill";
import type { GenericSettings, Settings } from "./types.ts";

const ext =
  (typeof chrome !== "undefined" ? chrome : browser) as typeof browser;

class PopupManager {
  shortsCount = 0;
  maxShorts = 5;
  enabled = false;
  constructor() {
    this.init();
  }

  async init() {
    await this.loadData();
    this.setupEventListeners();
    this.updateUI();
  }

  async loadData() {
    const today = this.getTodayKey();
    const result = await ext.storage.local.get([
      today,
      "maxShorts",
      "enabled",
    ]) as unknown as Settings & GenericSettings;

    this.shortsCount = Number(result[today]) || 0;
    this.maxShorts = result.maxShorts || 5;
    this.enabled = result.enabled !== false; // По умолчанию включено
  }

  async saveData() {
    await ext.storage.local.set({
      maxShorts: this.maxShorts,
      enabled: this.enabled,
    });
  }

  getTodayKey() {
    const today = new Date();
    return `shorts_${today.getFullYear()}_${today.getMonth()}_${today.getDate()}`;
  }

  setupEventListeners() {
    // Кнопка сброса счетчика
    document.getElementById("reset-btn")?.addEventListener("click", () => {
      this.resetShortsCount();
    });

    // Кнопка включения/выключения
    document.getElementById("toggle-btn")?.addEventListener("click", () => {
      this.toggleExtension();
    });

    // Поле ввода лимита
    document.getElementById("max-shorts-input")?.addEventListener(
      "change",
      (event) => {
        const target = event.target as HTMLInputElement;
        this.maxShorts = parseInt(target.value);
        this.saveData();
        this.updateUI();
      },
    );
  }

  async resetShortsCount() {
    const today = this.getTodayKey();
    await ext.storage.local.remove(today);
    this.shortsCount = 0;
    this.updateUI();

    // Обновляем счетчик в активной вкладке YouTube
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

    // Обновляем статус в активных вкладках YouTube
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

    // Обновляем счетчики
    shortsCountElement.textContent = this.shortsCount.toString();
    maxShortsElement.textContent = this.maxShorts.toString();
    maxShortsInputElement.value = this.maxShorts.toString();

    // Обновляем прогресс-бар
    const progressFill = document.getElementById(
      "progress-fill",
    ) as HTMLDivElement;
    const percentage = Math.min((this.shortsCount / this.maxShorts) * 100, 100);
    progressFill.style.width = percentage + "%";

    // Обновляем цвет прогресс-бара
    progressFill.className = "progress-fill";
    if (percentage >= 80) {
      progressFill.classList.add("danger");
    } else if (percentage >= 60) {
      progressFill.classList.add("warning");
    }

    // Обновляем статус
    const statusText = document.getElementById("status-text") as HTMLDivElement;
    if (this.shortsCount >= this.maxShorts) {
      statusText.textContent = "Limit reached!";
      statusText.style.color = "#f44336";
    } else if (this.shortsCount >= this.maxShorts * 0.8) {
      statusText.textContent = "Almost at limit";
      statusText.style.color = "#FF9800";
    } else {
      statusText.textContent = "You can watch Shorts";
      statusText.style.color = "#4CAF50";
    }

    // Обновляем статус расширения
    const extensionStatus = document.getElementById(
      "extension-status",
    ) as HTMLDivElement;
    if (this.enabled) {
      extensionStatus.textContent = "Extension is active";
      extensionStatus.className = "status enabled";
    } else {
      extensionStatus.textContent = "Extension is disabled";
      extensionStatus.className = "status disabled";
    }

    // Обновляем кнопку toggle
    const toggleBtn = document.getElementById(
      "toggle-btn",
    ) as HTMLButtonElement;
    toggleBtn.textContent = this.enabled ? "Disable" : "Enable";
    toggleBtn.className = this.enabled ? "" : "danger";
  }
}

// Инициализируем popup при загрузке
document.addEventListener("DOMContentLoaded", () => {
  new PopupManager();
});
