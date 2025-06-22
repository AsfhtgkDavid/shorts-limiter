// YouTube Shorts Limiter - Content Script
class ShortsLimiter {
  constructor() {
    this.shortsCount = 0;
    this.maxShorts = 5;
    this.isBlocked = false;
    this.enabled = true;
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
    const result = await browser.storage.local.get(today);
    this.shortsCount = result[today] || 0;
    console.log(`Shorts viewed today: ${this.shortsCount}`);
  }

  async loadSettings() {
    const result = await browser.storage.local.get(['maxShorts', 'enabled']);
    this.maxShorts = result.maxShorts || 5;
    this.enabled = result.enabled !== false;
    console.log(`Settings loaded: maxShorts=${this.maxShorts}, enabled=${this.enabled}`);
  }

  async saveShortsCount() {
    const today = this.getTodayKey();
    await browser.storage.local.set({ [today]: this.shortsCount });
  }

  getTodayKey() {
    const today = new Date();
    return `shorts_${today.getFullYear()}_${today.getMonth()}_${today.getDate()}`;
  }

  isShortsPage() {
    return window.location.pathname.includes('/shorts/') || 
           window.location.pathname.includes('/watch') && 
           document.querySelector('meta[property="og:video:width"][content="1080"]') &&
           document.querySelector('meta[property="og:video:height"][content="1920"]');
  }

  async incrementShortsCount() {
    if (!this.enabled) return;
    
    this.shortsCount++;
    await this.saveShortsCount();
    console.log(`Shorts count increased to: ${this.shortsCount}`);
    
    if (this.shortsCount >= this.maxShorts) {
      this.blockShorts();
    }
  }

  blockShorts() {
    if (this.isBlocked || !this.enabled) return;
    
    this.isBlocked = true;
    console.log('Blocking YouTube Shorts - limit reached!');
    
    // Создаем блокирующий экран
    const blocker = document.createElement('div');
    blocker.id = 'shorts-limiter-blocker';
    blocker.innerHTML = `
      <div style="
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
        text-align: center;
      ">
        <div style="font-size: 48px; margin-bottom: 20px;">🚫</div>
        <h1 style="font-size: 32px; margin-bottom: 20px;">Shorts Limit Reached!</h1>
        <p style="font-size: 18px; margin-bottom: 30px;">
          You've watched ${this.shortsCount} YouTube Shorts today.<br>
          Limit: ${this.maxShorts} videos per day.
        </p>
        <p style="font-size: 16px; color: #ccc; margin-bottom: 30px;">
          The limit will reset tomorrow. Try watching regular videos on YouTube!
        </p>
        <button id="shorts-limiter-home" style="
          margin: 10px;
          padding: 12px 24px;
          background: #ff0000;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.3s;
        ">Go to YouTube Home</button>
        <button id="shorts-limiter-close" style="
          margin: 10px;
          padding: 12px 24px;
          background: #333;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.3s;
        ">Close</button>
      </div>
    `;
    
    document.body.appendChild(blocker);
    
    // Обработчик кнопки перехода на главную
    document.getElementById('shorts-limiter-home').addEventListener('click', () => {
      window.location.href = 'https://www.youtube.com/';
    });
    
    // Обработчик кнопки закрытия
    document.getElementById('shorts-limiter-close').addEventListener('click', () => {
      const blocker = document.getElementById('shorts-limiter-blocker');
      if (blocker) {
        blocker.remove();
        this.isBlocked = false;
      }
    });
    
    // Добавляем hover эффекты
    document.getElementById('shorts-limiter-home').addEventListener('mouseenter', function() {
      this.style.background = '#cc0000';
    });
    document.getElementById('shorts-limiter-home').addEventListener('mouseleave', function() {
      this.style.background = '#ff0000';
    });
    
    document.getElementById('shorts-limiter-close').addEventListener('mouseenter', function() {
      this.style.background = '#555';
    });
    document.getElementById('shorts-limiter-close').addEventListener('mouseleave', function() {
      this.style.background = '#333';
    });
  }

  async resetShortsCount() {
    this.shortsCount = 0;
    this.isBlocked = false;
    await this.saveShortsCount();
    const blocker = document.getElementById('shorts-limiter-blocker');
    if (blocker) {
      blocker.remove();
    }
    console.log('Shorts counter reset');
  }

  setupMessageListener() {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'RESET_COUNT') {
        this.resetShortsCount();
        sendResponse({ success: true });
      }
      
      if (message.type === 'TOGGLE_EXTENSION') {
        this.enabled = message.enabled;
        if (!this.enabled) {
          // Убираем блокировку если расширение отключено
          const blocker = document.getElementById('shorts-limiter-blocker');
          if (blocker) {
            blocker.remove();
            this.isBlocked = false;
          }
        }
        sendResponse({ success: true });
      }
    });
  }

  checkCurrentPage() {
    if (this.isShortsPage()) {
      console.log('Detected YouTube Shorts page');
      
      if (this.shortsCount >= this.maxShorts && this.enabled) {
        this.blockShorts();
        return;
      }
      
      // Отслеживаем время просмотра
      let startTime = Date.now();
      let hasIncremented = false;
      
      const checkViewTime = () => {
        const viewTime = Date.now() - startTime;
        // Увеличиваем счетчик после 10 секунд просмотра
        if (viewTime > 10000 && !hasIncremented && this.enabled) {
          hasIncremented = true;
          this.incrementShortsCount();
        }
      };
      
      // Проверяем каждую секунду
      const interval = setInterval(checkViewTime, 1000);
      
      // Останавливаем отслеживание при уходе со страницы
      const stopTracking = () => {
        clearInterval(interval);
        window.removeEventListener('beforeunload', stopTracking);
      };
      
      window.addEventListener('beforeunload', stopTracking);
    }
  }

  observePageChanges() {
    // Отслеживаем изменения URL для SPA
    let currentUrl = window.location.href;
    
    const observer = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        setTimeout(() => this.checkCurrentPage(), 1000);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Также слушаем события popstate для навигации
    window.addEventListener('popstate', () => {
      setTimeout(() => this.checkCurrentPage(), 1000);
    });
  }
}

// Запускаем лимитер
const shortsLimiter = new ShortsLimiter(); 