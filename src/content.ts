// deno-lint-ignore-file require-await
// YouTube Shorts Limiter - Content Script

import type Browser from "webextension-polyfill";
import type { Message, Settings } from "./types.ts";

declare const browser: typeof Browser;

const ext = (typeof chrome !== "undefined" ? chrome : browser) as typeof chrome;
const getMessage = ext.i18n.getMessage;

class ShortsLimiter {
  shortsCount = 0;
  maxShorts = 5;
  isBlocked = false;
  enabled = true;

  constructor() {
    this.init();
  }

  async init() {
    await this.loadShortsCount();
    await this.loadSettings();
    this.setupMessageListener();
    this.observePageChanges();
    this.checkCurrentPage();
  }

  async loadShortsCount() {
    const today = this.getTodayKey();
    const result: Record<string, number> = await ext.storage.local.get(today);
    this.shortsCount = result[today] || 0;
    console.log(`Shorts viewed today: ${this.shortsCount}`);
  }

  async loadSettings() {
    const result: Settings = await ext.storage.local.get([
      "maxShorts",
      "enabled",
      "badgeEnabled",
    ]);
    this.maxShorts = result.maxShorts || 5;
    this.enabled = result.enabled !== false;
    if (result.badgeEnabled) {
      await ext.runtime.sendMessage({ type: "UPDATE_BADGE" });
    }
    console.log(
      `Settings loaded: maxShorts=${this.maxShorts}, enabled=${this.enabled}`,
    );
  }

  async saveShortsCount() {
    const today = this.getTodayKey();
    return new Promise<void>((resolve) => {
      ext.storage.local.set({ [today]: this.shortsCount }, () => resolve());
    });
  }

  getTodayKey() {
    const today = new Date();
    return `shorts_${today.getFullYear()}_${today.getMonth()}_${today.getDate()}`;
  }

  isShortsPage() {
    return globalThis.location.pathname.includes("/shorts/") ||
      globalThis.location.pathname.includes("/watch") &&
        document.querySelector(
          'meta[property="og:video:width"][content="1080"]',
        ) &&
        document.querySelector(
          'meta[property="og:video:height"][content="1920"]',
        );
  }

  async incrementShortsCount() {
    if (!this.enabled) return;

    this.shortsCount++;
    await this.saveShortsCount();
    console.log(`Shorts count increased to: ${this.shortsCount}`);
    await ext.runtime.sendMessage({
      type: "UPDATE_BADGE",
      maxShorts: this.maxShorts,
    });

    if (this.shortsCount >= this.maxShorts) {
      this.blockShorts();
    }
  }

  blockShorts() {
    if (this.isBlocked || !this.enabled) return;

    this.isBlocked = true;
    console.log("Blocking YouTube Shorts - limit reached!");

    // creating a blocking screen
    const blocker = document.createElement("div");
    blocker.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: white;
      font-family: Arial, sans-serif;
      text-align: center;`;
    blocker.id = "shorts-limiter-blocker";

    const blockEmoji = document.createElement("div");
    blockEmoji.innerText = "🚫";
    blockEmoji.style.cssText = `
      font-size: 48px;
      margin-bottom: 20px;`;

    const limitReachedText = document.createElement("h1");
    limitReachedText.dataset.i18n = "statusLimitReached";
    limitReachedText.style.cssText = `
      font-size: 32px;
      margin-bottom: 20px;`;

    const shortsCount = document.createElement("p");
    const youWatchedShorts = getMessage(
      "youWatchedShortsCount",
      this.shortsCount.toString(),
    );
    const shortsLimit = getMessage("limitCount", this.maxShorts.toString());
    shortsCount.innerText = `${youWatchedShorts}\n${shortsLimit}`;
    shortsCount.style.cssText = `
      font-size: 18px;
      margin-bottom: 30px;`;

    const limitWillResetTomorrow = document.createElement("p");
    limitWillResetTomorrow.dataset.i18n = "limitWillResetTomorrow";
    limitWillResetTomorrow.style.cssText = `
      font-size: 16px;
      color: #ccc;
      margin-bottom: 30px;`;

    const youtubeHomeButton = document.createElement("button");
    youtubeHomeButton.id = "shorts-limiter-home";
    youtubeHomeButton.dataset.i18n = "goToYoutubeHome";
    youtubeHomeButton.style.cssText = `
      margin: 10px;
      padding: 12px 24px;
      background: #ff0000;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.3s;`;

    const closePopupButton = document.createElement("button");
    closePopupButton.id = "shorts-limiter-close";
    closePopupButton.dataset.i18n = "close";
    closePopupButton.style.cssText = `
      margin: 10px;
      padding: 12px 24px;
      background: #333;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.3s;`;

    blocker.append(
      blockEmoji,
      limitReachedText,
      shortsCount,
      limitWillResetTomorrow,
      youtubeHomeButton,
      closePopupButton,
    );

    blocker.querySelectorAll("[data-i18n]").forEach((elem) => {
      const element = elem as HTMLElement;
      const i18n = element.dataset.i18n;
      if (!i18n) return;
      const text = getMessage(i18n);
      element.innerText = text;
    });

    document.body.appendChild(blocker);

    // youtube home button handler
    document.getElementById("shorts-limiter-home")?.addEventListener(
      "click",
      () => {
        globalThis.location.href = "https://www.youtube.com/";
      },
    );

    // close button handler
    document.getElementById("shorts-limiter-close")?.addEventListener(
      "click",
      () => {
        const blocker = document.getElementById("shorts-limiter-blocker");
        if (blocker) {
          blocker.remove();
          this.isBlocked = false;
        }
      },
    );

    // adding hover effects
    document.getElementById("shorts-limiter-home")?.addEventListener(
      "mouseenter",
      function () {
        this.style.background = "#cc0000";
      },
    );
    document.getElementById("shorts-limiter-home")?.addEventListener(
      "mouseleave",
      function () {
        this.style.background = "#ff0000";
      },
    );

    document.getElementById("shorts-limiter-close")?.addEventListener(
      "mouseenter",
      function () {
        this.style.background = "#555";
      },
    );
    document.getElementById("shorts-limiter-close")?.addEventListener(
      "mouseleave",
      function () {
        this.style.background = "#333";
      },
    );
  }

  async resetShortsCount() {
    this.shortsCount = 0;
    this.isBlocked = false;
    await this.saveShortsCount();
    const blocker = document.getElementById("shorts-limiter-blocker");
    if (blocker) {
      blocker.remove();
    }
    console.log("Shorts counter reset");
  }

  setupMessageListener() {
    ext.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      const message = msg as Message;
      if (message.type === "RESET_COUNT") {
        this.resetShortsCount();
        sendResponse({ success: true });
      }

      if (message.type === "TOGGLE_EXTENSION") {
        this.enabled = message.enabled || true;
        if (!this.enabled) {
          // removing block screen when extension is disabled
          const blocker = document.getElementById("shorts-limiter-blocker");
          if (blocker) {
            blocker.remove();
            this.isBlocked = false;
          }
        }
        sendResponse({ success: true });
      }
      return true;
    });
  }

  checkCurrentPage() {
    if (this.isShortsPage()) {
      console.log("Detected YouTube Shorts page");

      if (this.shortsCount >= this.maxShorts && this.enabled) {
        this.blockShorts();
        return;
      }

      const startTime = Date.now();
      let hasIncremented = false;

      const checkViewTime = () => {
        const viewTime = Date.now() - startTime;
        // incrementing counter after 5 seconds of watching
        if (viewTime > 5000 && !hasIncremented && this.enabled) {
          hasIncremented = true;
          this.incrementShortsCount();
        }
      };

      // tracking view time every second
      const interval = setInterval(checkViewTime, 1000);

      // stopping tracking when user left the page
      const stopTracking = () => {
        clearInterval(interval);
        globalThis.removeEventListener("beforeunload", stopTracking);
      };

      globalThis.addEventListener("beforeunload", stopTracking);
    }
  }

  observePageChanges() {
    // tracking URL changes for SPA support
    let currentUrl = globalThis.location.href;

    const observer = new MutationObserver(() => {
      if (globalThis.location.href !== currentUrl) {
        currentUrl = globalThis.location.href;
        setTimeout(() => this.checkCurrentPage(), 1000);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // listening popstate events for navigation
    globalThis.addEventListener("popstate", () => {
      setTimeout(() => this.checkCurrentPage(), 1000);
    });
  }
}

// starting main limiter class
const _shortsLimiter = new ShortsLimiter();
