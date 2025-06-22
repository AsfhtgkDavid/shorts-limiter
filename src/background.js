// YouTube Shorts Limiter - Background Script

// Обработчик установки расширения
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('YouTube Shorts Limiter installed');
    
    // Инициализируем настройки по умолчанию
    browser.storage.local.set({
      maxShorts: 5,
      enabled: true
    });
  }
});

// Обработчик сообщений от content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SHORTS_COUNT') {
    const today = getTodayKey();
    browser.storage.local.get(today).then((result) => {
      sendResponse({ count: result[today] || 0 });
    });
    return true; // Асинхронный ответ
  }
  
  if (message.type === 'RESET_SHORTS_COUNT') {
    const today = getTodayKey();
    browser.storage.local.remove(today).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

function getTodayKey() {
  const today = new Date();
  return `shorts_${today.getFullYear()}_${today.getMonth()}_${today.getDate()}`;
}

// Очистка старых данных (старше 7 дней)
setInterval(() => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  browser.storage.local.get().then((data) => {
    const keysToRemove = [];
    
    for (const key in data) {
      if (key.startsWith('shorts_')) {
        const dateParts = key.split('_');
        if (dateParts.length === 4) {
          const year = parseInt(dateParts[1]);
          const month = parseInt(dateParts[2]);
          const day = parseInt(dateParts[3]);
          const keyDate = new Date(year, month, day);
          
          if (keyDate < weekAgo) {
            keysToRemove.push(key);
          }
        }
      }
    }
    
    if (keysToRemove.length > 0) {
      browser.storage.local.remove(keysToRemove);
      console.log(`Cleaned up ${keysToRemove.length} old records`);
    }
  });
}, 24 * 60 * 60 * 1000); // Проверяем раз в день 