/// <reference types="chrome"/>
// YouTube Shorts Limiter - Background Script

import type Browser from "webextension-polyfill";
import type { Message } from "./types.ts";

declare const browser: typeof Browser;

// Cross-browser extension API
const ext =
  (typeof chrome !== "undefined" ? chrome : browser) as typeof browser;

// extension install handler
ext.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    console.log("YouTube Shorts Limiter installed");
    // Инициализируем настройки по умолчанию
    ext.storage.local.set({
      maxShorts: 5,
      enabled: true,
      badgeEnabled: true,
    });
  } else if (details.reason === "update") {
    const { badgeEnabled } = await ext.storage.local.get([
      "badgeEnabled",
    ]) as Record<string, string>;
    if (badgeEnabled === undefined) {
      ext.storage.local.set({ badgeEnabled: true });
    }
  }
});

// content script message handler
ext.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  const message = msg as Message;

  if (message.type === "UPDATE_BADGE") {
    const today = getTodayKey();
    ext.storage.local.get([today, "maxShorts"]).then((value) => {
      const result = value as Record<string, string>;
      const maxShorts = Number(result.maxShorts) || 5;
      const watched = Number(result[today]) || 0;
      const count = maxShorts - watched;
      ext.action.setBadgeText({ text: count.toString() });
      sendResponse({ success: true });
    });
  }
  if (message.type === "CLEAR_BADGE") {
    ext.action.setBadgeText({ text: null });
    sendResponse({ success: true });
  }
  if (message.type === "GET_SHORTS_COUNT") {
    const today = getTodayKey();
    ext.storage.local.get(today).then((value) => {
      const result = value as Record<string, string>;
      sendResponse({ count: result[today] || 0 });
    });
  }
  if (message.type === "RESET_SHORTS_COUNT") {
    const today = getTodayKey();
    ext.storage.local.remove(today).then(() => {
      sendResponse({ success: true });
    });
  }
  return true;
});

function getTodayKey() {
  const today = new Date();
  return `shorts_${today.getFullYear()}_${today.getMonth()}_${today.getDate()}`;
}

// service worker for cleaning up old data
ext.alarms.create("cleanupOldData", { periodInMinutes: 60 });

ext.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "cleanupOldData") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const data = await ext.storage.local.get(null) as Record<string, string>; //, (data: Record<string, string>) => {
    const keysToRemove = [];
    for (const key in data) {
      if (key.startsWith("shorts_")) {
        const dateParts = key.split("_");
        if (dateParts.length === 4) {
          const y = +dateParts[1], m = +dateParts[2], d = +dateParts[3];
          const keyDate = new Date(y, m, d);
          if (keyDate < weekAgo) keysToRemove.push(key);
        }
      }
    }
    if (keysToRemove.length > 0) {
      await ext.storage.local.remove(keysToRemove);
    }
  }
});
