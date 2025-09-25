(function() {
    'use strict';

    // Базовые CSS стили с CSS-переменными
    const inlineCSS = `
        .bhw-container {
            font-family: var(--bhw-font, 'Inter', system-ui, sans-serif);
            max-width: var(--bhw-max-width, 380px);
            margin: var(--bhw-margin, 20px auto);
            width: 100%;
        }
        .bhw-widget {
            background: var(--bhw-bg, linear-gradient(135deg, #C44536 0%, #D07C47 100%));
            border-radius: var(--bhw-widget-radius, 16px);
            padding: var(--bhw-padding, 28px);
            color: var(--bhw-text-color, #ffffff);
            box-shadow: var(--bhw-shadow, 0 16px 48px rgba(0,0,0,0.25));
            position: relative;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            text-align: center;
        }
        .bhw-widget::before {
            content: '';
            position: absolute;
            inset: 0;
            background: var(--bhw-overlay, 
                radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
            );
            pointer-events: none;
        }
        .bhw-widget:hover {
            transform: translateY(-3px);
            box-shadow: var(--bhw-shadow-hover, 0 24px 64px rgba(0,0,0,0.35));
        }
        .bhw-countdown {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: var(--bhw-gap, 15px);
            margin: var(--bhw-countdown-margin, 20px 0);
            position: relative;
            z-index: 1;
        }
        .bhw-time-block {
            background: var(--bhw-block-bg, rgba(255, 255, 255, 0.22));
            border: var(--bhw-block-border, 2px solid rgba(255, 255, 255, 0.35));
            border-radius: var(--bhw-block-radius, 12px);
            padding: var(--bhw-block-padding, 16px 8px);
            backdrop-filter: blur(12px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .bhw-time-block:hover {
            background: var(--bhw-block-bg-hover, rgba(255, 255, 255, 0.3));
            border-color: var(--bhw-block-border-hover, rgba(255, 255, 255, 0.55));
            transform: translateY(-2px) scale(1.02);
        }
        .bhw-time-value {
            font-size: var(--bhw-value-size, 1.8em);
            font-weight: var(--bhw-value-weight, 700);
            font-family: var(--bhw-value-font, 'JetBrains Mono', 'SF Mono', monospace);
            letter-spacing: var(--bhw-value-spacing, 0.6px);
            text-shadow: var(--bhw-text-shadow, 0 2px 8px rgba(0,0,0,0.3));
            margin-bottom: 4px;
            color: var(--bhw-value-color, inherit);
        }
        .bhw-time-label {
            font-size: var(--bhw-label-size, 0.7em);
            font-weight: var(--bhw-label-weight, 600);
            opacity: var(--bhw-label-opacity, 0.9);
            text-transform: uppercase;
            letter-spacing: var(--bhw-label-spacing, 1px);
            color: var(--bhw-label-color, inherit);
        }
        .bhw-loading { text-align: center; padding: 40px; color: white; }
        .bhw-spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid white; border-radius: 50%; animation: bhw-spin 1s linear infinite; margin: 0 auto 15px; }
        @keyframes bhw-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @media (max-width: 480px) {
            .bhw-container { max-width: calc(100vw - 32px); margin: 16px auto; }
            .bhw-widget { padding: var(--bhw-padding-mobile, 20px); }
            .bhw-countdown { grid-template-columns: repeat(2, 1fr); gap: var(--bhw-gap-mobile, 12px); }
            .bhw-time-value { font-size: var(--bhw-value-size-mobile, 1.5em); }
            .bhw-time-label { font-size: var(--bhw-label-size-mobile, 0.65em); }
        }
    `;

    try {
        const currentScript = document.currentScript || (function() {
            const scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();

        let clientId = currentScript.dataset.id;
        if (!clientId) {
            console.error('[BusinessHoursCountdownWidget] data-id обязателен');
            return;
        }

        clientId = normalizeId(clientId);

        // Защита от повторного выполнения
        if (currentScript.dataset.bhwMounted === '1') return;
        currentScript.dataset.bhwMounted = '1';

        console.log(`[BusinessHoursCountdownWidget] 🚀 Инициализация виджета "${clientId}"`);

        // Добавляем базовые стили один раз в head с уникальным ID
        if (!document.querySelector('#business-hours-countdown-widget-styles')) {
            const style = document.createElement('style');
            style.id = 'business-hours-countdown-widget-styles';
            style.textContent = inlineCSS;
            document.head.appendChild(style);
        }

        const baseUrl = getBasePath(currentScript.src);
        const uniqueClass = `bhw-countdown-${clientId}-${Date.now()}`;
        const container = createContainer(currentScript, clientId, uniqueClass);
        
        showLoading(container);

        // Загружаем конфигурацию
        loadConfig(clientId, baseUrl)
            .then(fetchedConfig => {
                const finalConfig = mergeDeep(getDefaultConfig(), fetchedConfig);
                console.log(`[BusinessHoursCountdownWidget] 📋 Финальный конфиг для "${clientId}":`, finalConfig);
                
                applyCustomStyles(uniqueClass, finalConfig.style);
                createCountdownWidget(container, finalConfig);
                console.log(`[BusinessHoursCountdownWidget] ✅ Виджет "${clientId}" успешно создан`);
            })
            .catch(error => {
                console.warn(`[BusinessHoursCountdownWidget] ⚠️ Ошибка загрузки "${clientId}":`, error.message);
                const defaultConfig = getDefaultConfig();
                applyCustomStyles(uniqueClass, defaultConfig.style);
                createCountdownWidget(container, defaultConfig);
            });

    } catch (error) {
        console.error('[BusinessHoursCountdownWidget] 💥 Критическая ошибка:', error);
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
            return './';
        }
    }

    function createContainer(scriptElement, clientId, uniqueClass) {
        const container = document.createElement('div');
        container.id = `business-hours-countdown-widget-${clientId}`;
        container.className = `bhw-container ${uniqueClass}`;
        scriptElement.parentNode.insertBefore(container, scriptElement.nextSibling);
        return container;
    }

    function showLoading(container) {
        container.innerHTML = `
            <div class="bhw-widget">
                <div class="bhw-loading">
                    <div class="bhw-spinner"></div>
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
                valueFontFamily: "'JetBrains Mono', 'SF Mono', monospace",
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

    function mergeDeep(base, override) {
        const result = { ...base, ...override };

        // Сливаем объекты первого уровня
        for (const key of ['labels', 'style']) {
            if (base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) {
                result[key] = { ...(base[key] || {}), ...(override[key] || {}) };
            }
        }

        // Сливаем объекты второго уровня в style
        if (result.style) {
            for (const subKey of ['colors', 'borderRadius', 'sizes', 'shadow']) {
                if (base.style[subKey] && typeof base.style[subKey] === 'object' && !Array.isArray(base.style[subKey])) {
                    result.style[subKey] = { ...(base.style[subKey] || {}), ...(override.style?.[subKey] || {}) };
                }
            }
        }
        
        return result;
    }

    async function loadConfig(clientId, baseUrl) {
        // Локальный конфиг для разработки
        if (clientId === 'local') {
            const localScript = document.querySelector('#bhw-countdown-local-config');
            if (!localScript) {
                throw new Error('Локальный конфиг не найден (#bhw-countdown-local-config)');
            }
            try {
                const config = JSON.parse(localScript.textContent);
                console.log(`[BusinessHoursCountdownWidget] 📄 Локальный конфиг загружен:`, config);
                return config;
            } catch (err) {
                throw new Error('Ошибка парсинга локального JSON: ' + err.message);
            }
        }

        // Загрузка с сервера
        const configUrl = `${baseUrl}configs/${encodeURIComponent(clientId)}.json?v=${Date.now()}`;
        console.log(`[BusinessHoursCountdownWidget] 🌐 Загружаем конфиг: ${configUrl}`);
        
        const response = await fetch(configUrl, { 
            cache: 'no-store',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const config = await response.json();
        console.log(`[BusinessHoursCountdownWidget] ✅ Серверный конфиг загружен:`, config);
        return config;
    }

    function applyCustomStyles(uniqueClass, style) {
        const styleId = `bhw-countdown-style-${uniqueClass}`;
        let styleElement = document.getElementById(styleId);
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }
        
        styleElement.textContent = generateUniqueStyles(uniqueClass, style);
    }

    function generateUniqueStyles(uniqueClass, style) {
        const s = style || {};
        const colors = s.colors || {};
        const sizes = s.sizes || {};
        const borderRadius = s.borderRadius || {};
        const shadow = s.shadow || {};
        const fs = sizes.fontSize || 1;

        return `
            .${uniqueClass} {
                --bhw-font: ${s.fontFamily || "'Inter', system-ui, sans-serif"};
                --bhw-max-width: ${Math.round(380 * fs)}px;
                --bhw-bg: ${colors.background || "linear-gradient(135deg, #C44536 0%, #D07C47 100%)"};
                --bhw-widget-radius: ${borderRadius.widget || 16}px;
                --bhw-padding: ${sizes.padding || 28}px;
                --bhw-padding-mobile: ${Math.round((sizes.padding || 28) * 0.8)}px;
                --bhw-text-color: ${colors.text || "#ffffff"};
                --bhw-shadow: ${shadow.widget || "0 16px 48px rgba(0,0,0,0.25)"};
                --bhw-shadow-hover: ${shadow.widgetHover || "0 24px 64px rgba(0,0,0,0.35)"};
                --bhw-gap: ${sizes.gap || 15}px;
                --bhw-gap-mobile: ${Math.round((sizes.gap || 15) * 0.8)}px;
                --bhw-countdown-margin: ${Math.round(20 * fs)}px 0;
                --bhw-block-bg: ${colors.blockBackground || "rgba(255, 255, 255, 0.22)"};
                --bhw-block-border: 2px solid ${colors.blockBorder || "rgba(255, 255, 255, 0.35)"};
                --bhw-block-radius: ${borderRadius.blocks || 12}px;
                --bhw-block-padding: ${sizes.blockPadding || 16}px ${Math.round((sizes.blockPadding || 16) * 0.5)}px;
                --bhw-block-bg-hover: ${colors.blockHover || "rgba(255, 255, 255, 0.3)"};
                --bhw-block-border-hover: ${colors.borderHover || "rgba(255, 255, 255, 0.55)"};
                --bhw-value-size: ${1.8 * fs}em;
                --bhw-value-size-mobile: ${1.5 * fs}em;
                --bhw-label-size: ${0.7 * fs}em;
                --bhw-label-size-mobile: ${0.65 * fs}em;
                --bhw-text-shadow: ${shadow.text || "0 2px 8px rgba(0,0,0,0.3)"};
                --bhw-value-font: ${s.valueFontFamily || "'JetBrains Mono', 'SF Mono', monospace"};
            }
        `;
    }

    function createCountdownWidget(container, config) {
        const labels = config.labels || {};
        
        container.innerHTML = `
            <div class="bhw-widget">
                <div class="bhw-countdown">
                    <div class="bhw-time-block">
                        <div class="bhw-time-value" data-unit="days">00</div>
                        <div class="bhw-time-label">${escapeHtml(labels.days)}</div>
                    </div>
                    <div class="bhw-time-block">
                        <div class="bhw-time-value" data-unit="hours">00</div>
                        <div class="bhw-time-label">${escapeHtml(labels.hours)}</div>
                    </div>
                    <div class="bhw-time-block">
                        <div class="bhw-time-value" data-unit="minutes">00</div>
                        <div class="bhw-time-label">${escapeHtml(labels.minutes)}</div>
                    </div>
                    <div class="bhw-time-block">
                        <div class="bhw-time-value" data-unit="seconds">00</div>
                        <div class="bhw-time-label">${escapeHtml(labels.seconds)}</div>
                    </div>
                </div>
            </div>
        `;

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

            const setValue = (unit, value) => {
                const el = container.querySelector(`[data-unit="${unit}"]`);
                if (el) el.textContent = String(value).padStart(2, '0');
            };

            setValue('days', days);
            setValue('hours', hours);
            setValue('minutes', minutes);
            setValue('seconds', seconds);
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
