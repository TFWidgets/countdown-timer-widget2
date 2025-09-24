(function() {
    'use strict';

    // Базовые CSS стили с CSS-переменными для полной кастомизации
    const inlineCSS = `
        .ctw-container {
            font-family: var(--ctw-font, 'Inter', system-ui, sans-serif);
            max-width: var(--ctw-max-width, 380px);
            margin: var(--ctw-margin, 20px auto);
            width: 100%;
        }
        
        .ctw-widget {
            background: var(--ctw-bg, linear-gradient(135deg, #C44536 0%, #D07C47 100%));
            border-radius: var(--ctw-widget-radius, 16px);
            padding: var(--ctw-padding, 28px);
            color: var(--ctw-text-color, #ffffff);
            box-shadow: var(--ctw-shadow, 0 16px 48px rgba(0,0,0,0.25));
            position: relative;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            text-align: center;
        }
        
        .ctw-widget::before {
            content: '';
            position: absolute;
            inset: 0;
            background: var(--ctw-overlay, 
                radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
            );
            pointer-events: none;
        }
        
        .ctw-widget:hover {
            transform: translateY(-3px);
            box-shadow: var(--ctw-shadow-hover, 0 24px 64px rgba(0,0,0,0.35));
        }
        
        .ctw-countdown {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: var(--ctw-gap, 15px);
            margin: var(--ctw-countdown-margin, 20px 0);
            position: relative;
            z-index: 1;
        }
        
        .ctw-time-block {
            background: var(--ctw-block-bg, rgba(255, 255, 255, 0.22));
            border: var(--ctw-block-border, 2px solid rgba(255, 255, 255, 0.35));
            border-radius: var(--ctw-block-radius, 12px);
            padding: var(--ctw-block-padding, 16px 8px);
            backdrop-filter: blur(12px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .ctw-time-block:hover {
            background: var(--ctw-block-bg-hover, rgba(255, 255, 255, 0.3));
            border-color: var(--ctw-block-border-hover, rgba(255, 255, 255, 0.55));
            transform: translateY(-2px) scale(1.02);
        }
        
        .ctw-time-value {
            font-size: var(--ctw-value-size, 1.8em);
            font-weight: var(--ctw-value-weight, 700);
            font-family: var(--ctw-value-font, 'JetBrains Mono', 'SF Mono', monospace);
            letter-spacing: var(--ctw-value-spacing, 0.6px);
            text-shadow: var(--ctw-text-shadow, 0 2px 8px rgba(0,0,0,0.3));
            margin-bottom: 4px;
            color: var(--ctw-value-color, inherit);
        }
        
        .ctw-time-label {
            font-size: var(--ctw-label-size, 0.7em);
            font-weight: var(--ctw-label-weight, 600);
            opacity: var(--ctw-label-opacity, 0.9);
            text-transform: uppercase;
            letter-spacing: var(--ctw-label-spacing, 1px);
            color: var(--ctw-label-color, inherit);
        }
        
        .ctw-loading {
            text-align: center;
            padding: var(--ctw-loading-padding, 40px);
            color: var(--ctw-loading-color, white);
        }
        
        .ctw-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: ctw-spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        
        .ctw-error {
            background: var(--ctw-error-bg, linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%));
            padding: var(--ctw-error-padding, 30px);
            border-radius: var(--ctw-error-radius, 16px);
            color: var(--ctw-error-text, white);
            text-align: center;
        }
        
        @keyframes ctw-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 480px) {
            .ctw-container { 
                max-width: calc(100vw - 32px); 
                margin: var(--ctw-margin-mobile, 16px auto); 
            }
            .ctw-widget { 
                padding: var(--ctw-padding-mobile, 20px); 
            }
            .ctw-countdown { 
                grid-template-columns: repeat(2, 1fr); 
                gap: var(--ctw-gap-mobile, 12px); 
            }
            .ctw-time-value { 
                font-size: var(--ctw-value-size-mobile, 1.5em); 
            }
            .ctw-time-label { 
                font-size: var(--ctw-label-size-mobile, 0.65em); 
            }
        }
    `;

    try {
        const currentScript = document.currentScript || (function() {
            const scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();

        let clientId = currentScript.dataset.id;
        if (!clientId) {
            console.error('[CountdownTimerWidget] data-id обязателен');
            return;
        }

        // Нормализуем ID
        clientId = normalizeId(clientId);

        // Защита от повторного выполнения
        if (currentScript.dataset.ctwMounted === '1') return;
        currentScript.dataset.ctwMounted = '1';

        console.log(`[CountdownTimerWidget] Инициализация виджета "${clientId}"`);

        // Добавляем базовые стили один раз
        if (!document.querySelector('#countdown-timer-widget-styles')) {
            const style = document.createElement('style');
            style.id = 'countdown-timer-widget-styles';
            style.textContent = inlineCSS;
            document.head.appendChild(style);
        }

        // Определяем baseUrl
        const baseUrl = getBasePath(currentScript.src);

        // Создаем контейнер с уникальным классом
        const uniqueClass = `ctw-${clientId}-${Date.now()}`;
        const container = createContainer(currentScript, clientId, uniqueClass);
        
        // Показываем загрузку
        showLoading(container);

        // Загружаем конфигурацию и создаем виджет
        loadConfig(clientId, baseUrl)
            .then(config => {
                applyCustomStyles(container, config, uniqueClass);
                createCountdownWidget(container, config);
                console.log(`[CountdownTimerWidget] ✅ Виджет "${clientId}" успешно создан`);
            })
            .catch(error => {
                console.warn(`[CountdownTimerWidget] ⚠️ Используем дефолтный конфиг для "${clientId}":`, error.message);
                const defaultConfig = getDefaultConfig();
                applyCustomStyles(container, defaultConfig, uniqueClass);
                createCountdownWidget(container, defaultConfig);
            });

    } catch (error) {
        console.error('[CountdownTimerWidget] Критическая ошибка:', error);
    }

    function normalizeId(id) {
        return (id || 'demo').replace(/\.(json|js)$/i, '');
    }

    function getBasePath(src) {
        if (!src) return './';
        try {
            const url = new URL(src, location.href);
            return url.origin + url.pathname.replace(/\/[^\/]*$/, '/');
        } catch (error) {
            console.warn('[CountdownTimerWidget] Ошибка определения базового пути:', error);
            return './';
        }
    }

    function createContainer(scriptElement, clientId, uniqueClass) {
        const container = document.createElement('div');
        container.id = `countdown-timer-widget-${clientId}`;
        container.className = `ctw-container ${uniqueClass}`;
        scriptElement.parentNode.insertBefore(container, scriptElement.nextSibling);
        return container;
    }

    function showLoading(container) {
        container.innerHTML = `
            <div class="ctw-widget">
                <div class="ctw-loading">
                    <div class="ctw-spinner"></div>
                    <div>Loading countdown...</div>
                </div>
            </div>
        `;
    }

    function getDefaultConfig() {
        return {
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
    }

    // Загрузка конфигурации
    async function loadConfig(clientId, baseUrl) {
        // Локальный конфиг для разработки
        if (clientId === 'local') {
            const localScript = document.querySelector('#ctw-local-config');
            if (!localScript) {
                throw new Error('Локальный конфиг не найден (#ctw-local-config)');
            }
            try {
                return JSON.parse(localScript.textContent);
            } catch (err) {
                throw new Error('Ошибка парсинга локального конфига: ' + err.message);
            }
        }

        // Загрузка с сервера
        const configUrl = `${baseUrl}configs/${encodeURIComponent(clientId)}.json?v=${Date.now()}`;
        console.log(`[CountdownTimerWidget] Загружаем конфиг: ${configUrl}`);
        
        const response = await fetch(configUrl, { 
            cache: 'no-store',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const config = await response.json();
        console.log(`[CountdownTimerWidget] ✅ Конфиг загружен:`, config);
        return config;
    }

    // Применение кастомных стилей через CSS-переменные
    function applyCustomStyles(container, config, uniqueClass) {
        const s = config.style || {};
        const fs = s.sizes?.fontSize || 1;
        
        const styleElement = document.createElement('style');
        styleElement.textContent = generateUniqueStyles(uniqueClass, s, fs);
        container.appendChild(styleElement);
    }

    function generateUniqueStyles(uniqueClass, style, fontSize) {
        const s = style;
        const colors = s.colors || {};
        const sizes = s.sizes || {};
        const borderRadius = s.borderRadius || {};
        const shadow = s.shadow || {};

        return `
            .${uniqueClass} {
                --ctw-font: ${s.fontFamily || "'Inter', system-ui, sans-serif"};
                --ctw-max-width: ${Math.round(380 * fontSize)}px;
                --ctw-bg: ${colors.background || "linear-gradient(135deg, #C44536 0%, #D07C47 100%)"};
                --ctw-widget-radius: ${borderRadius.widget || 16}px;
                --ctw-padding: ${sizes.padding || 28}px;
                --ctw-padding-mobile: ${Math.round((sizes.padding || 28) * 0.8)}px;
                --ctw-text-color: ${colors.text || "#ffffff"};
                --ctw-shadow: ${shadow.widget || "0 16px 48px rgba(0,0,0,0.25)"};
                --ctw-shadow-hover: ${shadow.widgetHover || "0 24px 64px rgba(0,0,0,0.35)"};
                --ctw-gap: ${sizes.gap || 15}px;
                --ctw-gap-mobile: ${Math.round((sizes.gap || 15) * 0.8)}px;
                --ctw-countdown-margin: ${Math.round(20 * fontSize)}px 0;
                --ctw-block-bg: ${colors.blockBackground || "rgba(255, 255, 255, 0.22)"};
                --ctw-block-border: 2px solid ${colors.blockBorder || "rgba(255, 255, 255, 0.35)"};
                --ctw-block-radius: ${borderRadius.blocks || 12}px;
                --ctw-block-padding: ${sizes.blockPadding || 16}px ${Math.round((sizes.blockPadding || 16) * 0.5)}px;
                --ctw-block-bg-hover: ${colors.blockHover || "rgba(255, 255, 255, 0.3)"};
                --ctw-block-border-hover: ${colors.borderHover || "rgba(255, 255, 255, 0.55)"};
                --ctw-value-size: ${1.8 * fontSize}em;
                --ctw-value-size-mobile: ${1.5 * fontSize}em;
                --ctw-label-size: ${0.7 * fontSize}em;
                --ctw-label-size-mobile: ${0.65 * fontSize}em;
                --ctw-text-shadow: ${shadow.text || "0 2px 8px rgba(0,0,0,0.3)"};
                --ctw-value-font: ${s.valueFontFamily || "'JetBrains Mono', 'SF Mono', monospace"};
            }
        `;
    }

    function createCountdownWidget(container, config) {
        const labels = config.labels || {};

        container.innerHTML = `
            <div class="ctw-widget">
                <div class="ctw-countdown">
                    <div class="ctw-time-block">
                        <div class="ctw-time-value" data-unit="days">00</div>
                        <div class="ctw-time-label">${escapeHtml(labels.days || 'DAYS')}</div>
                    </div>
                    <div class="ctw-time-block">
                        <div class="ctw-time-value" data-unit="hours">00</div>
                        <div class="ctw-time-label">${escapeHtml(labels.hours || 'HOURS')}</div>
                    </div>
                    <div class="ctw-time-block">
                        <div class="ctw-time-value" data-unit="minutes">00</div>
                        <div class="ctw-time-label">${escapeHtml(labels.minutes || 'MINUTES')}</div>
                    </div>
                    <div class="ctw-time-block">
                        <div class="ctw-time-value" data-unit="seconds">00</div>
                        <div class="ctw-time-label">${escapeHtml(labels.seconds || 'SECONDS')}</div>
                    </div>
                </div>
            </div>
        `;

        // Запуск таймера
        startCountdown(container, config.endDate);
    }

    function startCountdown(container, endDate) {
        const endTime = new Date(endDate).getTime();
        
        function updateCountdown() {
            const now = Date.now();
            const timeLeft = endTime - now;

            if (timeLeft <= 0) {
                ['days', 'hours', 'minutes', 'seconds'].forEach(unit => {
                    const element = container.querySelector(`[data-unit="${unit}"]`);
                    if (element) element.textContent = '00';
                });
                if (container._countdownInterval) {
                    clearInterval(container._countdownInterval);
                }
                return;
            }

            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            const daysEl = container.querySelector('[data-unit="days"]');
            const hoursEl = container.querySelector('[data-unit="hours"]');
            const minutesEl = container.querySelector('[data-unit="minutes"]');
            const secondsEl = container.querySelector('[data-unit="seconds"]');

            if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
            if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
            if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
            if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
        }

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        container._countdownInterval = interval;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }
})();
