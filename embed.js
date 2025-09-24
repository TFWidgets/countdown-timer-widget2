(() => {
  'use strict';

  const scripts = Array.from(document.querySelectorAll('script[src*="embed.js"]'));
  if (!scripts.length) return;

  // Минимальный fallback конфиг
  const defaultConfig = {
    endDate: "2025-12-31T23:59:59",
    labels: {
      days: "DAYS",
      hours: "HOURS", 
      minutes: "MINUTES",
      seconds: "SECONDS"
    },
    style: {
      fontFamily: "'Inter', system-ui, sans-serif",
      colors: {
        background: "linear-gradient(135deg, #C44536 0%, #D07C47 100%)",
        text: "#ffffff",
        blockBackground: "rgba(255, 255, 255, 0.22)",
        blockBorder: "rgba(255, 255, 255, 0.35)",
        blockHover: "rgba(255, 255, 255, 0.3)",
        borderHover: "rgba(255, 255, 255, 0.55)"
      },
      borderRadius: { widget: 16, blocks: 12 },
      sizes: { fontSize: 1, padding: 28, blockPadding: 16, gap: 15 },
      shadow: {
        widget: "0 16px 48px rgba(0,0,0,0.25)",
        widgetHover: "0 24px 64px rgba(0,0,0,0.35)",
        text: "0 2px 8px rgba(0,0,0,0.3)"
      }
    }
  };

  scripts.forEach(async (script) => {
    // Защита от повторного выполнения
    if (script.dataset.ctwMounted === '1') return;
    script.dataset.ctwMounted = '1';

    const id = normalizeId(script.dataset.id);
    const basePath = getBasePath(script.src);

    console.log(`Инициализация виджета "${id}"`);

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
    // Глубокое слияние конфигов
    const config = mergeDeep(defaultConfig, cfg);
    const configId = normalizeId(host.dataset.id || 'demo');
    const uniqueClass = `ctw-${configId}-${Date.now()}`;
    
    const wrap = document.createElement('div');
    wrap.className = `ctw-container ${uniqueClass}`;

    // Вставляем стили из конфига
    injectStyles(uniqueClass, config.style, host);

    // Чистый HTML без стилей
    wrap.innerHTML = `
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

    // Запуск таймера
    startCountdown(wrap, config.endDate);
  }

  // Функция для генерации CSS из конфига
  function injectStyles(uniqueClass, style, host) {
    const s = style;
    const fs = s.sizes.fontSize;
    
    const styleTag = document.createElement('style');
    styleTag.setAttribute('data-ctw-style', uniqueClass);
    
    styleTag.textContent = `
      .${uniqueClass} {
        font-family: ${s.fontFamily};
        max-width: ${380 * fs}px;
        margin: 20px auto;
        width: 100%;
      }
      
      .${uniqueClass} .ctw-widget {
        background: 
          radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          ${s.colors.background};
        border-radius: ${s.borderRadius.widget}px;
        padding: ${s.sizes.padding}px;
        color: ${s.colors.text};
        box-shadow: ${s.shadow.widget};
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
        box-shadow: ${s.shadow.widgetHover};
      }
      
      .${uniqueClass} .ctw-countdown {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: ${s.sizes.gap}px;
        margin: ${20 * fs}px 0;
        position: relative;
        z-index: 1;
      }
      
      .${uniqueClass} .ctw-time-block {
        background: ${s.colors.blockBackground};
        border: 2px solid ${s.colors.blockBorder};
        border-radius: ${s.borderRadius.blocks}px;
        padding: ${s.sizes.blockPadding}px ${s.sizes.blockPadding * 0.5}px;
        backdrop-filter: blur(12px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .${uniqueClass} .ctw-time-block:hover {
        background: ${s.colors.blockHover};
        border-color: ${s.colors.borderHover};
        transform: translateY(-2px) scale(1.02);
      }
      
      .${uniqueClass} .ctw-time-value {
        font-size: ${1.8 * fs}em;
        font-weight: 700;
        font-family: 'JetBrains Mono', 'SF Mono', monospace;
        letter-spacing: 0.6px;
        text-shadow: ${s.shadow.text};
        margin-bottom: 4px;
        color: ${s.colors.text};
      }
      
      .${uniqueClass} .ctw-time-label {
        font-size: ${0.7 * fs}em;
        font-weight: 600;
        opacity: 0.9;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: ${s.colors.text};
      }
      
      @media (max-width: 480px) {
        .${uniqueClass} { max-width: calc(100vw - 32px); margin: 16px auto; }
        .${uniqueClass} .ctw-widget { padding: ${s.sizes.padding * 0.8}px; }
        .${uniqueClass} .ctw-countdown { grid-template-columns: repeat(2, 1fr); gap: ${s.sizes.gap * 0.8}px; }
        .${uniqueClass} .ctw-time-value { font-size: ${1.5 * fs}em; }
        .${uniqueClass} .ctw-time-label { font-size: ${0.65 * fs}em; }
      }
    `;
    
    host.parentNode.insertBefore(styleTag, host);
  }

  function startCountdown(wrap, endDate) {
    const endTime = new Date(endDate).getTime();
    
    function updateCountdown() {
      const now = Date.now();
      const timeLeft = endTime - now;

      if (timeLeft <= 0) {
        ['days', 'hours', 'minutes', 'seconds'].forEach(unit => {
          wrap.querySelector(`[data-unit="${unit}"]`).textContent = '00';
        });
        clearInterval(wrap._countdownInterval);
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

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    wrap._countdownInterval = interval;
  }

  // Вспомогательные функции
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

  function mergeDeep(base, override) {
    const result = { ...base, ...override };
    result.labels = { ...(base.labels || {}), ...(override.labels || {}) };
    result.style = { ...(base.style || {}), ...(override.style || {}) };
    
    if (result.style) {
      result.style.colors = { ...(base.style?.colors || {}), ...(override.style?.colors || {}) };
      result.style.borderRadius = { ...(base.style?.borderRadius || {}), ...(override.style?.borderRadius || {}) };
      result.style.sizes = { ...(base.style?.sizes || {}), ...(override.style?.sizes || {}) };
      result.style.shadow = { ...(base.style?.shadow || {}), ...(override.style?.shadow || {}) };
    }
    
    return result;
  }

  async function loadConfig(clientId, baseUrl) {
    // Локальный конфиг (для разработки)
    if (clientId === 'local') {
      const localScript = document.querySelector('#ctw-local-config');
      if (localScript && localScript.textContent.trim()) {
        try {
          return JSON.parse(localScript.textContent.trim());
        } catch (error) {
          console.warn('⚠️ Ошибка парсинга локального конфига:', error);
        }
      }
    }

    // Загрузка с сервера
    const configName = normalizeId(clientId);
    const url = `${baseUrl}configs/${configName}.json?v=${Date.now()}`;
    
    console.log(`Загружаем конфиг: ${url}`);
    
    const response = await fetch(url, { 
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const config = await response.json();
    console.log(`✅ Конфиг загружен:`, config);
    return config;
  }
})();
