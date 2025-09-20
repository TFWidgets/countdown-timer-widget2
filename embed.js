(() => {
  const scripts = Array.from(document.querySelectorAll('script[src*="embed.js"]'));
  if (!scripts.length) return;

  const pad2 = n => String(n).padStart(2, '0');

  // Красивые дефолты (не настраиваются)
  const defaultConfig = {
    target: "2025-12-31T23:59:59",
    doneText: "🎉 Событие началось!",
    labels: { 
      days: "Дней", 
      hours: "Часов", 
      minutes: "Минут", 
      seconds: "Секунд" 
    },
    theme: { 
      backgroundColor: "#0f172a", 
      textColor: "#ffffff", 
      borderRadius: 16 
    },
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    autoStart: true
  };

  function mountWidget(host, cfg) {
    const config = { 
      ...defaultConfig, 
      ...cfg,
      labels: { ...defaultConfig.labels, ...(cfg.labels || {}) },
      theme: { ...defaultConfig.theme, ...(cfg.theme || {}) }
    };

    const wrap = document.createElement('div');
    wrap.className = 'cdw-container';
    wrap.style.setProperty('--bg-color', config.theme.backgroundColor);
    wrap.style.setProperty('--text-color', config.theme.textColor);
    wrap.style.setProperty('--border-radius', config.theme.borderRadius + 'px');
    wrap.style.fontFamily = config.fontFamily;

    wrap.innerHTML = `
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

    // Встроенные красивые стили (дефолт)
    const style = document.createElement('style');
    style.textContent = `
      .cdw-container { 
        color: var(--text-color); 
        font-family: inherit;
      }
      
      .cdw-widget {
        background: 
          radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(255, 119, 198, 0.2) 0%, transparent 50%),
          var(--bg-color);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: var(--border-radius);
        padding: 40px 32px;
        backdrop-filter: blur(16px);
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        position: relative;
        overflow: hidden;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .cdw-widget::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(
          circle at 30% 20%, 
          rgba(255, 255, 255, 0.15) 0%, 
          transparent 60%
        );
        pointer-events: none;
      }
      
      .cdw-widget:hover {
        transform: translateY(-2px);
        box-shadow: 
          0 16px 48px rgba(0, 0, 0, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.15);
      }
      
      .cdw-display {
        display: grid;
        grid-template-columns: repeat(4, minmax(80px, 1fr));
        gap: 20px;
        position: relative;
        z-index: 1;
      }
      
      .cdw-item {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: calc(var(--border-radius) - 4px);
        padding: 24px 16px;
        text-align: center;
        backdrop-filter: blur(8px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }
      
      .cdw-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          135deg, 
          rgba(255, 255, 255, 0.1) 0%, 
          transparent 50%
        );
        pointer-events: none;
      }
      
      .cdw-item:hover {
        transform: translateY(-4px) scale(1.02);
        background: rgba(255, 255, 255, 0.12);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
        border-color: rgba(255, 255, 255, 0.25);
      }
      
      .cdw-number {
        font-family: 'JetBrains Mono', 'SF Mono', 'Roboto Mono', monospace;
        font-size: 2.8rem;
        font-weight: 800;
        line-height: 1;
        margin-bottom: 8px;
        color: var(--text-color);
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        background: linear-gradient(
          135deg, 
          currentColor 0%, 
          rgba(255, 255, 255, 0.8) 100%
        );
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
      }
      
      .cdw-label {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        opacity: 0.85;
        color: var(--text-color);
      }
      
      .cdw-start {
        display: none;
        width: 100%;
        margin-top: 24px;
        padding: 14px 20px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: calc(var(--border-radius) - 4px);
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-color);
        font-weight: 600;
        cursor: pointer;
        backdrop-filter: blur(8px);
        transition: all 0.3s ease;
      }
      
      .cdw-start:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-1px);
      }
      
      .cdw-done {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border-radius: var(--border-radius);
        padding: 48px 32px;
        text-align: center;
        font-size: 1.5rem;
        font-weight: 700;
        color: white;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        box-shadow: 0 16px 40px rgba(16, 185, 129, 0.4);
        position: relative;
        overflow: hidden;
      }
      
      .cdw-done::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(
          circle at 30% 30%, 
          rgba(255, 255, 255, 0.2) 0%, 
          transparent 70%
        );
      }
      
      @media (max-width: 640px) {
        .cdw-widget { 
          padding: 28px 20px; 
        }
        
        .cdw-display { 
          grid-template-columns: repeat(4, 1fr); 
          gap: 12px; 
        }
        
        .cdw-item { 
          padding: 16px 12px; 
        }
        
        .cdw-number { 
          font-size: 2rem; 
        }
        
        .cdw-label { 
          font-size: 0.7rem; 
        }
      }
    `;
    
    wrap.appendChild(style);
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
  scripts.forEach(async (script, index) => {
    const configId = script.dataset.id || 'demo';
    
    // Определяем базовый путь
    let basePath = '';
    try {
      const srcUrl = new URL(script.src, location.href);
      basePath = srcUrl.pathname.replace(/\/[^\/]*$/, '/');
    } catch {}
    
    const config = await loadConfig(configId, basePath);
    mountWidget(script, config);
  });
})();
