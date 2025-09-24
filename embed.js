(() => {
  'use strict';

  const scripts = Array.from(document.querySelectorAll('script[src*="embed.js"]'));
  if (!scripts.length) return;

  const defaultConfig = {
    endDate: "2025-12-31T23:59:59",
    labels: {
      days: "DAYS",
      hours: "HOURS", 
      minutes: "MINUTES",
      seconds: "SECONDS"
    }
  };

  scripts.forEach(async (script) => {
    // Защита от повторного выполнения - ТОЧНО КАК В BUSINESS-HOURS
    if (script.dataset.ctwMounted === '1') return;
    script.dataset.ctwMounted = '1';

    const id = normalizeId(script.dataset.id);
    const basePath = getBasePath(script.src);

    console.log(`Инициализация виджета "${id}"`);
    console.log(`Базовый путь: ${basePath}`);
    console.log(`URL конфига: ${basePath}configs/${id}.json`);

    try {
      const config = await loadConfig(id, basePath);
      mountWidget(script, config);
      console.log(`✅ Виджет "${id}" успешно создан`);
    } catch (error) {
      console.warn(`⚠️ Используем дефолтный конфиг для "${id}":`, error.message);
      mountWidget(script, defaultConfig);
    }
  });

  function mountWidget(host, cfg) {
    const config = {
      ...defaultConfig,
      ...cfg,
      labels: { ...defaultConfig.labels, ...(cfg?.labels || {}) }
    };

    const configId = normalizeId(host.dataset.id || 'demo');
    const uniqueClass = `ctw-${configId}-${Date.now()}`;
    const wrap = document.createElement('div');
    wrap.className = `ctw-container ${uniqueClass}`;

    wrap.innerHTML = `
      <style>
        .${uniqueClass} {
          font-family: 'Inter', system-ui, sans-serif;
          max-width: 380px;
          margin: 20px auto;
          width: 100%;
        }
        
        .${uniqueClass} .ctw-widget {
          background: 
            radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #C44536 0%, #D07C47 100%);
          border-radius: 16px;
          padding: 28px;
          color: white;
          box-shadow: 0 16px 48px rgba(0,0,0,0.25);
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: center;
        }
        
        .${uniqueClass} .ctw-widget::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.18) 0%, transparent 55%);
          pointer-events: none;
        }
        
        .${uniqueClass} .ctw-widget:hover {
          transform: translateY(-3px);
          box-shadow: 0 24px 64px rgba(0,0,0,0.35);
        }
        
        .${uniqueClass} .ctw-countdown {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin: 20px 0;
          position: relative;
          z-index: 1;
        }
        
        .${uniqueClass} .ctw-time-block {
          background: rgba(255, 255, 255, 0.22);
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-radius: 12px;
          padding: 16px 8px;
          backdrop-filter: blur(12px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .${uniqueClass} .ctw-time-block:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.55);
          transform: translateY(-2px) scale(1.02);
        }
        
        .${uniqueClass} .ctw-time-value {
          font-size: 1.8em;
          font-weight: 700;
          font-family: 'JetBrains Mono', 'SF Mono', monospace;
          letter-spacing: 0.6px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.3);
          margin-bottom: 4px;
        }
        
        .${uniqueClass} .ctw-time-label {
          font-size: 0.7em;
          font-weight: 600;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        @media (max-width: 480px) {
          .${uniqueClass} {
            max-width: calc(100vw - 32px);
            margin: 16px auto;
          }
          
          .${uniqueClass} .ctw-widget {
            padding: 22px;
          }
          
          .${uniqueClass} .ctw-countdown {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          
          .${uniqueClass} .ctw-time-value {
            font-size: 1.5em;
          }
          
          .${uniqueClass} .ctw-time-label {
            font-size: 0.65em;
          }
        }
      </style>
      <div class="ctw-widget">
        <div class="ctw-countdown">
          <div class="ctw-time-block">
            <div class="ctw-time-value" data-unit="days">00</div>
            <div class="ctw-time-label">${escapeHtml(config.labels.days)}</div>
          </div>
          <div class="ctw-time-block">
            <div class="ctw-time-value" data-unit="hours">00</div>
            <div class="ctw-time-label">${escapeHtml(config.labels.hours)}</div>
          </div>
          <div class="ctw-time-block">
            <div class="ctw-time-value" data-unit="minutes">00</div>
            <div class="ctw-time-label">${escapeHtml(config.labels.minutes)}</div>
          </div>
          <div class="ctw-time-block">
            <div class="ctw-time-value" data-unit="seconds">00</div>
            <div class="ctw-time-label">${escapeHtml(config.labels.seconds)}</div>
          </div>
        </div>
      </div>
    `;

    host.parentNode.insertBefore(wrap, host);

    // Запускаем обратный отсчет
    const endTime = new Date(config.endDate).getTime();
    
    function updateCountdown() {
      const now = new Date().getTime();
      const timeLeft = endTime - now;

      if (timeLeft <= 0) {
        // Обнуляем все значения когда время истекло
        wrap.querySelector('[data-unit="days"]').textContent = '00';
        wrap.querySelector('[data-unit="hours"]').textContent = '00';
        wrap.querySelector('[data-unit="minutes"]').textContent = '00';
        wrap.querySelector('[data-unit="seconds"]').textContent = '00';
        return;
      }

      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      wrap.querySelector('[data-unit="days"]').textContent = String(days).padStart(2, '0');
      wrap.querySelector('[data-unit="hours"]').textContent = String(hours).padStart(2, '0');
      wrap.querySelector('[data-unit="minutes"]').textContent = String(minutes).padStart(2, '0');
      wrap.querySelector('[data-unit="seconds"]').textContent = String(seconds).padStart(2, '0');
    }

    // Обновляем сразу и затем каждую секунду
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    // Сохраняем ссылку на интервал для возможной очистки
    wrap._countdownInterval = interval;
  }

  // Вспомогательные функции - ТОЧНО КАК В BUSINESS-HOURS
  function normalizeId(id) {
    return (id || 'demo').replace(/\.(json|js)$/i, '');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  function getBasePath(src) {
    try {
      const url = new URL(src, location.href);
      return url.origin + url.pathname.replace(/\/[^\/]*$/, '/');
    } catch (error) {
      console.warn('Ошибка определения базового пути:', error);
      return './';
    }
  }

  // Загрузка конфигурации - ТОЧНО КАК В BUSINESS-HOURS
  async function loadConfig(clientId, baseUrl) {
    // Проверяем локальную конфигурацию - ТОЧНО КАК В BUSINESS-HOURS
    if (clientId === 'local') {
      const localScript = document.querySelector('#ctw-local-config');
      if (localScript && localScript.textContent.trim()) {
        try {
          const localConfig = JSON.parse(localScript.textContent.trim());
          console.log('✅ Используем локальную конфигурацию:', localConfig);
          return localConfig;
        } catch (error) {
          console.warn('⚠️ Ошибка парсинга локальной конфигурации:', error);
        }
      }
    }

    // Загружаем с сервера - ТОЧНО КАК В BUSINESS-HOURS
    const configName = normalizeId(clientId);
    const url = `${baseUrl}configs/${configName}.json?v=${Date.now()}`;
    
    console.log(`Загружаем конфиг: ${url}`);
    
    try {
      const response = await fetch(url, { 
        cache: 'no-store',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const config = await response.json();
      console.log(`✅ Конфиг загружен:`, config);
      return config;
      
    } catch (error) {
      console.warn(`⚠️ Ошибка загрузки конфига:`, error.message);
      throw error;
    }
  }
})();