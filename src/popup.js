// YouTube Shorts Limiter - Popup Script

class PopupManager {
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
    const result = await browser.storage.local.get([today, 'maxShorts', 'enabled']);
    
    this.shortsCount = result[today] || 0;
    this.maxShorts = result.maxShorts || 5;
    this.enabled = result.enabled !== false; // По умолчанию включено
  }

  async saveData() {
    await browser.storage.local.set({
      maxShorts: this.maxShorts,
      enabled: this.enabled
    });
  }

  getTodayKey() {
    const today = new Date();
    return `shorts_${today.getFullYear()}_${today.getMonth()}_${today.getDate()}`;
  }

  setupEventListeners() {
    // Кнопка сброса счетчика
    document.getElementById('reset-btn').addEventListener('click', () => {
      this.resetShortsCount();
    });

    // Кнопка включения/выключения
    document.getElementById('toggle-btn').addEventListener('click', () => {
      this.toggleExtension();
    });

    // Поле ввода лимита
    document.getElementById('max-shorts-input').addEventListener('change', (e) => {
      this.maxShorts = parseInt(e.target.value);
      this.saveData();
      this.updateUI();
    });
  }

  async resetShortsCount() {
    const today = this.getTodayKey();
    await browser.storage.local.remove(today);
    this.shortsCount = 0;
    this.updateUI();
    
    // Обновляем счетчик в активной вкладке YouTube
    const tabs = await browser.tabs.query({ url: '*://*.youtube.com/*' });
    for (const tab of tabs) {
      try {
        await browser.tabs.sendMessage(tab.id, { type: 'RESET_COUNT' });
      } catch (e) {
        // Игнорируем ошибки, если content script не загружен
      }
    }
  }

  async toggleExtension() {
    this.enabled = !this.enabled;
    await this.saveData();
    this.updateUI();
    
    // Обновляем статус в активных вкладках YouTube
    const tabs = await browser.tabs.query({ url: '*://*.youtube.com/*' });
    for (const tab of tabs) {
      try {
        await browser.tabs.sendMessage(tab.id, { 
          type: 'TOGGLE_EXTENSION', 
          enabled: this.enabled 
        });
      } catch (e) {
        // Игнорируем ошибки, если content script не загружен
      }
    }
  }

  updateUI() {
    // Обновляем счетчики
    document.getElementById('shorts-count').textContent = this.shortsCount;
    document.getElementById('max-shorts').textContent = this.maxShorts;
    document.getElementById('max-shorts-input').value = this.maxShorts;

    // Обновляем прогресс-бар
    const progressFill = document.getElementById('progress-fill');
    const percentage = Math.min((this.shortsCount / this.maxShorts) * 100, 100);
    progressFill.style.width = percentage + '%';

    // Обновляем цвет прогресс-бара
    progressFill.className = 'progress-fill';
    if (percentage >= 80) {
      progressFill.classList.add('danger');
    } else if (percentage >= 60) {
      progressFill.classList.add('warning');
    }

    // Обновляем статус
    const statusText = document.getElementById('status-text');
    if (this.shortsCount >= this.maxShorts) {
      statusText.textContent = 'Limit reached!';
      statusText.style.color = '#f44336';
    } else if (this.shortsCount >= this.maxShorts * 0.8) {
      statusText.textContent = 'Almost at limit';
      statusText.style.color = '#FF9800';
    } else {
      statusText.textContent = 'You can watch Shorts';
      statusText.style.color = '#4CAF50';
    }

    // Обновляем статус расширения
    const extensionStatus = document.getElementById('extension-status');
    if (this.enabled) {
      extensionStatus.textContent = 'Extension is active';
      extensionStatus.className = 'status enabled';
    } else {
      extensionStatus.textContent = 'Extension is disabled';
      extensionStatus.className = 'status disabled';
    }

    // Обновляем кнопку toggle
    const toggleBtn = document.getElementById('toggle-btn');
    toggleBtn.textContent = this.enabled ? 'Disable' : 'Enable';
    toggleBtn.className = this.enabled ? '' : 'danger';
  }
}

// Инициализируем popup при загрузке
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
}); 