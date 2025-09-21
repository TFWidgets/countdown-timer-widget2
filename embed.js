(() => {
  'use strict';

  const scripts = Array.from(document.querySelectorAll('script[src*="embed.js"]'));
  if (!scripts.length) return;

  const defaultConfig = {
    phone: "+420123456789",
    displayPhone: "+420 123 456 789",
    icon: "🍕",
    title: "Order Pizza",
    subtitle: "Call now! Delivery in 30 minutes",
    infoText: "Business Hours: 10:00-23:00 daily",
    actions: [
      { type: "whatsapp", text: "WhatsApp", icon: "💬", message: "Hi! I want to order pizza" },
      { type: "link", text: "Menu", icon: "📋", url: "https://example.com/menu" }
    ],
    theme: {
      backgroundColor: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
      textColor: "white",
      borderRadius: 16
    },
    fontFamily: "'Inter', system-ui, sans-serif"
  };

  scripts.forEach(async (script) => {
    // Защита от повторного выполнения
    if (script.dataset.ctcMounted === '1') return;
    script.dataset.ctcMounted = '1';

    const id = normalizeId(script.dataset.id);
    const basePath = getBasePath(script.src);

    console.log(`[ClickToCallWidget] Инициализация виджета "${id}"`);
    console.log(`[ClickToCallWidget] Базовый путь: ${basePath}`);
    console.log(`[ClickToCallWidget] URL конфига: ${basePath}configs/${id}.json`);

    try {
      const config = await loadConfig(id, basePath);
      mountWidget(script, config);
      console.log(`[ClickToCallWidget] ✅ Виджет "${id}" успешно создан`);
    } catch (error) {
      console.warn(`[ClickToCallWidget] ⚠️ Используем дефолтный конфиг для "${id}":`, error.message);
      mountWidget(script, defaultConfig);
    }
  });

  function mountWidget(host, cfg) {
    const config = {
      ...defaultConfig,
      ...cfg,
      actions: cfg?.actions || defaultConfig.actions,
      theme: { ...defaultConfig.theme, ...(cfg?.theme || {}) }
    };

    const configId = normalizeId(host.dataset.id || 'demo');
    const uniqueClass = `ctc-${configId}-${Date.now()}`;
    const wrap = document.createElement('div');
    wrap.className = `ctc-container ${uniqueClass}`;

    const cleanPhone = (config.phone || '').replace(/[^\d+]/g, '');
    const displayPhone = config.displayPhone || config.phone || '';

    // Генерируем кнопки действий
    const actionsHTML = (config.actions || []).map(action => {
      const url = buildActionUrl(action, config.phone);
      if (!url) return '';
      
      return `
        <a href="${escapeHtml(url)}" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="ctc-action-btn">
          ${action.icon ? `${escapeHtml(action.icon)} ` : ''}${escapeHtml(action.text)}
        </a>
      `;
    }).join('');

    wrap.innerHTML = `
      <style>
        .${uniqueClass} {
          font-family: ${config.fontFamily};
          max-width: 380px;
          margin: 20px auto;
          width: 100%;
        }
        
        .${uniqueClass} .ctc-widget {
          background: 
            radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            ${config.theme.backgroundColor};
          border-radius: ${config.theme.borderRadius}px;
          padding: 28px;
          color: ${config.theme.textColor};
          box-shadow: 0 16px 48px rgba(0,0,0,0.25);
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: center;
        }
        
        .${uniqueClass} .ctc-widget::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.18) 0%, transparent 55%);
          pointer-events: none;
        }
        
        .${uniqueClass} .ctc-widget:hover {
          transform: translateY(-3px);
          box-shadow: 0 24px 64px rgba(0,0,0,0.35);
        }
        
        .${uniqueClass} .ctc-icon {
          font-size: 2.8em;
          margin-bottom: 12px;
          display: block;
          animation: ctc-pulse-${uniqueClass} 2.2s ease-in-out infinite;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
        }
        
        .${uniqueClass} .ctc-title {
          font-size: 1.4em;
          font-weight: 700;
          margin: 0 0 8px 0;
          text-shadow: 0 2px 8px rgba(0,0,0,0.3);
          letter-spacing: 0.3px;
        }
        
        .${uniqueClass} .ctc-subtitle {
          font-size: 0.95em;
          opacity: 0.92;
          margin: 0 0 22px 0;
          font-weight: 500;
        }
        
        .${uniqueClass} .ctc-main-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 88%;
          max-width: 320px;
          margin: 0 auto 18px auto;
          background: rgba(255, 255, 255, 0.22);
          color: ${config.theme.textColor};
          border: 2px solid rgba(255, 255, 255, 0.35);
          padding: 18px 24px;
          border-radius: 14px;
          font-size: 1.15em;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(12px);
          box-sizing: border-box;
          letter-spacing: 0.6px;
          font-family: 'JetBrains Mono', 'SF Mono', monospace;
          position: relative;
          z-index: 1;
        }
        
        .${uniqueClass} .ctc-main-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.55);
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        }
        
        .${uniqueClass} .ctc-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 12px;
          margin-top: 18px;
          position: relative;
          z-index: 1;
        }
        
        .${uniqueClass} .ctc-action-btn {
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          font-size: 0.85em;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
        }
        
        .${uniqueClass} .ctc-action-btn:hover {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-1px);
        }
        
        .${uniqueClass} .ctc-info-text {
          margin-top: 18px;
          font-size: 0.82em;
          opacity: 0.85;
          font-weight: 500;
          position: relative;
          z-index: 1;
        }
        
        @keyframes ctc-pulse-${uniqueClass} {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        
        @media (max-width: 480px) {
          .${uniqueClass} {
            max-width: calc(100vw - 32px);
            margin: 16px auto;
          }
          
          .${uniqueClass} .ctc-widget {
            padding: 22px;
          }
          
          .${uniqueClass} .ctc-main-btn {
            font-size: 1.05em;
            padding: 16px 20px;
          }
          
          .${uniqueClass} .ctc-actions {
            grid-template-columns: 1fr;
            gap: 10px;
          }
        }
      </style>
      <div class="ctc-widget">
        <div class="ctc-icon">${escapeHtml(config.icon)}</div>
        <h3 class="ctc-title">${escapeHtml(config.title)}</h3>
        <p class="ctc-subtitle">${escapeHtml(config.subtitle)}</p>
        
        <a href="tel:${cleanPhone}" class="ctc-main-btn">
          ${escapeHtml(displayPhone)}
        </a>
        
        ${actionsHTML ? `<div class="ctc-actions">${actionsHTML}</div>` : ''}
        
        ${config.infoText ? `<div class="ctc-info-text">${escapeHtml(config.infoText)}</div>` : ''}
      </div>
    `;

    host.parentNode.insertBefore(wrap, host);
  }

  function buildActionUrl(action, defaultPhone) {
    if (!action || typeof action !== 'object') return null;
    
    const type = (action.type || '').toLowerCase();
    const phone = (defaultPhone || '').replace(/[^\d]/g, '');
    
    switch (type) {
      case 'whatsapp':
        const message = action.message || action.additionalText || 'Hi!';
        return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : null;
        
      case 'telegram':
        const user = (action.value || '').replace(/^@/, '');
        return user ? `https://t.me/${user}` : null;
        
      case 'sms':
        const smsBody = action.message || action.text || '';
        const query = smsBody ? `?body=${encodeURIComponent(smsBody)}` : '';
        return phone ? `sms:${defaultPhone}${query}` : null;
        
      case 'email':
        const email = action.value || action.email || '';
        const subject = action.message || action.subject || action.text || '';
        const emailQuery = subject ? `?subject=${encodeURIComponent(subject)}` : '';
        return email ? `mailto:${email}${emailQuery}` : null;
        
      case 'link':
        return action.url || action.value || null;
        
      default:
        return null;
    }
  }

  // ИСПРАВЛЕННЫЕ вспомогательные функции
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
      // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: добавляем origin для полного URL
      return url.origin + url.pathname.replace(/\/[^\/]*$/, '/');
    } catch (error) {
      console.warn('[ClickToCallWidget] Ошибка определения базового пути:', error);
      return './';
    }
  }

  async function loadConfig(id, basePath) {
    const configName = normalizeId(id);
    const url = `${basePath}configs/${configName}.json?v=${Date.now()}`;
    
    console.log(`[ClickToCallWidget] Загружаем конфиг: ${url}`);
    
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
      console.log(`[ClickToCallWidget] ✅ Конфиг загружен:`, config);
      return config;
      
    } catch (error) {
      console.warn(`[ClickToCallWidget] ⚠️ Ошибка загрузки конфига:`, error.message);
      throw error;
    }
  }
})();
