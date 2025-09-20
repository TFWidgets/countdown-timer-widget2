(() => {
  const scripts = Array.from(document.querySelectorAll('script[src*="embed.js"]'));
  if (!scripts.length) return;

  const pad2 = n => String(n).padStart(2, '0');

  // Базовые дефолты
  const defaultConfig = {
    target: "2025-12-31T23:59:59",
    doneText: "🎉 Событие началось!",
    labels: { days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds" },
    effects: { glow: true, animation: true },
    styling: {
      fontFamily: "'Inter', system-ui, sans-serif",
      primaryColor: "#667eea",
      secondaryColor: "#764ba2",
      textColor: "white",
      borderRadius: "18px",
      padding: "45px 35px"
    },
    autoStart: true
  };

  function mountWidget(host, cfg) {
    // Проверяем, не обработан ли уже этот конкретный скрипт
    if (host.dataset.cdwMounted === '1') return;
    host.dataset.cdwMounted = '1';

    const config = {
      ...defaultConfig,
      ...cfg,
      labels: { ...defaultConfig.labels, ...(cfg.labels || {}) },
      effects: { ...defaultConfig.effects, ...(cfg.effects || {}) },
      styling: { ...defaultConfig.styling, ...(cfg.styling || {}) }
    };

    const s = config.styling;
    const configId = host.dataset.id || 'demo';
    // Создаем уникальный класс для каждого виджета
    const uniqueClass = `cdw-${configId}-${Date.now()}`;
    
    const wrap = document.createElement('div');
    wrap.className = `cdw-container ${uniqueClass}`;

    // Определяем фон
    const background = s.backgroundColor || 
      `linear-gradient(135deg, ${s.primaryColor} 0%, ${s.secondaryColor} 100%)`;

    wrap.innerHTML = `
      <style>
        .${uniqueClass} {
          font-family: ${s.fontFamily};
          color: ${s.textColor};
          width: 100%;
        }
        
        .${uniqueClass} .cdw-widget {
          background: 
            radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 119, 198, 0.2) 0%, transparent 50%),
            ${background};
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: ${s.borderRadius};
          padding: ${s.padding};
          backdrop-filter: blur(16px);
          box-shadow: 0 15px 45px rgba(0,0,0,0.4);
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          max-width: 550px;
          margin: 0 auto;
        }
        
        .${uniqueClass} .cdw-widget::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: ${config.effects.glow ? 
            'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 60%)' : 
            'none'};
          pointer-events: none;
        }
        
        .${uniqueClass} .cdw-widget:hover {
          transform: ${config.effects.animation ? 'translateY(-3px)' : 'none'};
          box-shadow: ${config.effects.animation ? 
            '0 20px 60px rgba(0,0,0,0.5)' : 
            '0 15px 45px rgba(0,0,0,0.4)'};
        }
        
        .${uniqueClass} .cdw-display {
          display: grid;
          grid-template-columns: repeat(4, minmax(80px, 1fr));
          gap: 20px;
          position: relative;
          z-index: 1;
        }
        
        .${uniqueClass} .cdw-item {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: calc(${s.borderRadius} - 6px);
          padding: 24px 16px;
          text-align: center;
          backdrop-filter: blur(12px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .${uniqueClass} .cdw-item::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        
        .${uniqueClass} .cdw-item:hover {
          transform: ${config.effects.animation ? 'translateY(-6px) scale(1.03)' : 'none'};
          background: ${config.effects.animation ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)'};
          box-shadow: ${config.effects.animation ? '0 12px 25px rgba(0,0,0,0.3)' : 'none'};
          border-color: ${config.effects.animation ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.25)'};
        }
        
        .${uniqueClass} .cdw-number {
          font-family: 'JetBrains Mono', 'SF Mono', 'Roboto Mono', monospace;
          font-size: 2.8rem;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 8px;
          color: ${s.textColor};
          text-shadow: ${config.effects.glow ? '0 2px 8px rgba(0,0,0,0.5)' : 'none'};
          background: linear-gradient(135deg, currentColor 0%, rgba(255,255,255,0.8) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: ${config.effects.glow ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'};
        }
        
        .${uniqueClass} .cdw-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          opacity: 0.9;
          color: ${s.textColor};
        }
        
        .${uniqueClass} .cdw-start {
          display: none;
          width: 100%;
          margin-top: 24px;
          padding: 14px 20px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: calc(${s.borderRadius} - 6px);
          background: rgba(255,255,255,0.1);
          color: ${s.textColor};
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
        }
        
        .${uniqueClass} .cdw-start:hover {
          background: rgba(255,255,255,0.15);
          transform: translateY(-1px);
        }
        
        .${uniqueClass} .cdw-done {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: ${s.borderRadius};
          padding: 48px 32px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          text-shadow: 0 2px 8px rgba(0,0,0,0.3);
          box-shadow: 0 16px 40px rgba(16,185,129,0.4);
          position: relative;
          overflow: hidden;
        }
        
        .${uniqueClass} .cdw-done::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 70%);
        }
        
        @media (max-width: 640px) {
          .${uniqueClass} .cdw-widget { padding: 28px 20px; }
          .${uniqueClass} .cdw-display { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 12px; 
          }
          .${uniqueClass} .cdw-item { padding: 16px 12px; }
          .${uniqueClass} .cdw-number { font-size: 2rem; }
          .${uniqueClass} .cdw-label { font-size: 0.7rem; }
        }
      </style>
      <div class="cdw-widget">
        <div class="cdw-display">
          <div class="cdw-item">
            <div class="cdw-number" data-unit="days">0</div>
            <div class="cdw-label">${config.labels.days}</div>
          </div>
          <div class="cdw-item">
            <div class="cdw-number" data-unit="hours">00</div>
            <div class="cdw-label">${config.labels.hours}</div>
          </div>
          <div class="cdw-item">
            <div class="cdw-number" data-unit="minutes">00</div>
            <div class="cdw-label">${config.labels.minutes}</div>
          </div>
          <div class="cdw-item">
            <div class="cdw-number" data-unit="seconds">00</div>
            <div class="cdw-label">${config.labels.seconds}</div>
          </div>
        </div>
        <button class="cdw-start" type="button">Запустить таймер</button>
        <div class="cdw-done" hidden></div>
      </div>
    `;

    host.parentNode.insertBefore(wrap, host);

    // Логика таймера
    const target = new Date(config.target).getTime();
    const numbers = {
      days: wrap.querySelector('.cdw-number[data-unit="days"]'),
      hours: wrap.querySelector('.cdw-number[data-unit="hours"]'),
      minutes: wrap.querySelector('.cdw-number[data-unit="minutes"]'),
      seconds: wrap.querySelector('.cdw-number[data-unit="seconds"]')
    };
    const doneEl = wrap.querySelector('.cdw-done');
    const startBtn = wrap.querySelector('.cdw-start');

    let timer = null;

    function updateDisplay() {
      const now = Date.now();
      let diff = Math.max(0, target - now);

      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      diff -= days * 24 * 60 * 60 * 1000;
      const hours = Math.floor(diff / (60 * 60 * 1000));
      diff -= hours * 60 * 60 * 1000;
      const minutes = Math.floor(diff / (60 * 1000));
      diff -= minutes * 60 * 1000;
      const seconds = Math.floor(diff / 1000);

      numbers.days.textContent = days;
      numbers.hours.textContent = pad2(hours);
      numbers.minutes.textContent = pad2(minutes);
      numbers.seconds.textContent = pad2(seconds);

      if (target <= now) {
        clearInterval(timer);
        wrap.querySelector('.cdw-display').style.display = 'none';
        doneEl.textContent = config.doneText;
        doneEl.hidden = false;
      }
    }

    function startTimer() {
      if (timer) return;
      updateDisplay();
      timer = setInterval(updateDisplay, 1000);
    }

    if (config.autoStart) {
      startTimer();
    } else {
      startBtn.style.display = 'block';
      startBtn.addEventListener('click', () => {
        startBtn.style.display = 'none';
        startTimer();
      });
    }
  }

  // Загрузка конфигов
  async function loadConfig(id, basePath) {
    const configName = (id || 'demo').replace(/\.(json|js)$/, '');
    const url = `${basePath}configs/${configName}.json`;
    
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) return defaultConfig;
      return await response.json();
    } catch {
      return defaultConfig;
    }
  }

  // Инициализация виджетов
  scripts.forEach(async (script) => {
    const configId = script.dataset.id || 'demo';
    
    let basePath = '';
    try {
      const srcUrl = new URL(script.src, location.href);
      basePath = srcUrl.pathname.replace(/\/[^\/]*$/, '/');
    } catch {}
    
    const config = await loadConfig(configId, basePath);
    mountWidget(script, config);
  });
})();
