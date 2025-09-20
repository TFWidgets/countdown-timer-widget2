(function() {
    'use strict';
    
    const COUNTDOWN_WIDGET_VERSION = '2.1.0';
    console.log(`[CountdownWidget v${COUNTDOWN_WIDGET_VERSION}] Initializing...`);

    // CSS стили с полной кастомизацией через CSS-переменные
    const inlineCSS = `
        .countdown-widget-container {
            font-family: var(--countdown-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
            max-width: var(--countdown-max-width, 600px);
            margin: var(--countdown-margin, 20px auto);
            text-align: var(--countdown-text-align, center);
            position: var(--countdown-position, relative);
            z-index: var(--countdown-z-index, 1000);
        }
        
        .countdown-widget {
            background: var(--countdown-bg, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
            border-radius: var(--countdown-radius, 20px);
            padding: var(--countdown-padding, 40px 30px);
            box-shadow: var(--countdown-shadow, 0 20px 60px rgba(102,126,234,0.4));
            color: var(--countdown-text-color, white);
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        
        .countdown-widget:hover {
            transform: var(--countdown-hover-transform, translateY(-2px));
            box-shadow: var(--countdown-hover-shadow, 0 25px 70px rgba(102,126,234,0.5));
        }
        
        .countdown-widget::before {
            content: '';
            position: absolute;
            inset: 0;
            background: var(--countdown-overlay, radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2) 0%, transparent 50%));
            pointer-events: none;
        }
        
        .countdown-title {
            font-size: var(--countdown-title-size, 1.8em);
            font-weight: var(--countdown-title-weight, 600);
            margin: var(--countdown-title-margin, 0 0 30px 0);
            text-shadow: var(--countdown-title-shadow, 0 2px 8px rgba(0,0,0,0.3));
            color: var(--countdown-title-color, inherit);
            position: relative;
            z-index: 2;
        }
        
        .countdown-display {
            display: flex;
            justify-content: var(--countdown-display-justify, center);
            align-items: var(--countdown-display-align, stretch);
            gap: var(--countdown-display-gap, 20px);
            flex-wrap: wrap;
            margin: var(--countdown-display-margin, 30px 0);
            position: relative;
            z-index: 2;
        }
        
        .countdown-item {
            background: var(--countdown-item-bg, rgba(255,255,255,0.15));
            backdrop-filter: var(--countdown-item-backdrop, blur(15px));
            border: var(--countdown-item-border, 1px solid rgba(255,255,255,0.3));
            border-radius: var(--countdown-item-radius, 16px);
            padding: var(--countdown-item-padding, 24px 18px);
            min-width: var(--countdown-item-min-width, 85px);
            transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
            position: relative;
            flex: var(--countdown-item-flex, 0 1 auto);
        }
        
        .countdown-item:hover {
            transform: var(--countdown-item-hover-transform, translateY(-8px) scale(1.05));
            box-shadow: var(--countdown-item-hover-shadow, 0 15px 35px rgba(0,0,0,0.3));
            background: var(--countdown-item-hover-bg, rgba(255,255,255,0.25));
        }
        
        .countdown-number {
            display: block;
            font-size: var(--countdown-number-size, 2.8em);
            font-weight: var(--countdown-number-weight, 800);
            line-height: var(--countdown-number-line-height, 1);
            margin-bottom: var(--countdown-number-margin-bottom, 8px);
            text-shadow: var(--countdown-number-shadow, 0 3px 6px rgba(0,0,0,0.4));
            background: var(--countdown-number-gradient, linear-gradient(45deg, #fff, #f8f9fa));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            color: var(--countdown-number-color, white);
            font-family: var(--countdown-number-font, inherit);
        }
        
        .countdown-label {
            font-size: var(--countdown-label-size, 0.85em);
            text-transform: var(--countdown-label-transform, uppercase);
            letter-spacing: var(--countdown-label-spacing, 1.2px);
            font-weight: var(--countdown-label-weight, 600);
            opacity: var(--countdown-label-opacity, 0.95);
            color: var(--countdown-label-color, inherit);
            font-family: var(--countdown-label-font, inherit);
        }
        
        .countdown-done {
            background: var(--countdown-done-bg, linear-gradient(135deg, #11998e 0%, #38ef7d 100%));
            padding: var(--countdown-done-padding, 50px 30px);
            border-radius: var(--countdown-done-radius, 20px);
            font-size: var(--countdown-done-size, 1.6em);
            font-weight: var(--countdown-done-weight, 700);
            text-shadow: var(--countdown-done-shadow, 0 2px 8px rgba(0,0,0,0.3));
            color: var(--countdown-done-color, white);
            position: relative;
            z-index: 2;
        }
        
        .countdown-error {
            background: var(--countdown-error-bg, linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%));
            padding: var(--countdown-error-padding, 30px);
            border-radius: var(--countdown-error-radius, 16px);
            color: var(--countdown-error-color, white);
            box-shadow: var(--countdown-error-shadow, 0 15px 40px rgba(255,107,107,0.4));
        }
        
        .countdown-loading {
            text-align: center;
            padding: 40px;
            color: var(--countdown-loading-color, white);
            position: relative;
            z-index: 2;
        }
        
        .countdown-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: countdown-spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        
        /* Анимации */
        @keyframes countdown-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes countdown-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }
        
        @keyframes countdown-glow {
            0%, 100% { 
                box-shadow: var(--countdown-shadow, 0 20px 60px rgba(102,126,234,0.4)); 
            }
            50% { 
                box-shadow: var(--countdown-glow-shadow, 0 20px 60px rgba(102,126,234,0.6), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.3)); 
            }
        }
        
        /* Эффекты */
        .countdown-widget.animate .countdown-item {
            animation: var(--countdown-item-animation, countdown-pulse 2s ease-in-out infinite);
        }
        
        .countdown-widget.glow {
            animation: var(--countdown-glow-animation, countdown-glow 3s ease-in-out infinite);
        }
        
        /* Адаптивность */
        @media (max-width: 768px) {
            .countdown-widget-container {
                max-width: calc(100vw - 40px);
                margin: 10px auto;
            }
            
            .countdown-widget {
                padding: var(--countdown-padding-tablet, 30px 20px);
            }
            
            .countdown-display {
                gap: var(--countdown-display-gap-tablet, 15px);
            }
            
            .countdown-item {
                min-width: var(--countdown-item-min-width-tablet, 70px);
                padding: var(--countdown-item-padding-tablet, 18px 12px);
            }
            
            .countdown-number {
                font-size: var(--countdown-number-size-tablet, 2.2em);
            }
            
            .countdown-title {
                font-size: var(--countdown-title-size-tablet, 1.5em);
            }
        }
        
        @media (max-width: 480px) {
            .countdown-widget {
                padding: var(--countdown-padding-mobile, 25px 15px);
            }
            
            .countdown-display {
                gap: var(--countdown-display-gap-mobile, 12px);
            }
            
            .countdown-item {
                min-width: var(--countdown-item-min-width-mobile, 65px);
                padding: var(--countdown-item-padding-mobile, 15px 10px);
            }
            
            .countdown-number {
                font-size: var(--countdown-number-size-mobile, 1.9em);
            }
            
            .countdown-title {
                font-size: var(--countdown-title-size-mobile, 1.3em);
            }
            
            .countdown-label {
                font-size: var(--countdown-label-size-mobile, 0.75em);
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
            console.error('[CountdownWidget] data-id обязателен');
            return;
        }

        // Нормализация clientId: убираем .js расширение
        if (clientId.endsWith('.js')) {
            clientId = clientId.slice(0, -3);
        }

        console.log(`[CountdownWidget v${COUNTDOWN_WIDGET_VERSION}] Loading clientId: ${clientId}`);

        // Добавляем стили один раз
        if (!document.querySelector('#countdown-widget-styles')) {
            const style = document.createElement('style');
            style.id = 'countdown-widget-styles';
            style.textContent = inlineCSS;
            document.head.appendChild(style);
        }

        // Надежное определение baseUrl через URL API
        const baseUrl = currentScript.src ? 
            new URL('.', currentScript.src).href.replace(/\/$/, '') : 
            'https://countdown-timer-widget2.tf-widgets.com';

        // URL конфига с кеш-бастером
        const configUrl = `${baseUrl}/configs/${encodeURIComponent(clientId)}.json?v=${Date.now()}`;

        console.log(`[CountdownWidget] Config URL: ${configUrl}`);

        // Создаем контейнер
        const container = createContainer(currentScript, clientId);
        
        // Показываем загрузку
        showLoading(container);

        // Загружаем конфигурацию с fallback
        loadConfig(configUrl, baseUrl)
            .then(config => {
                console.log(`[CountdownWidget] Config loaded:`, config);
                validateConfig(config);
                applyCustomStyles(container, config);
                createCountdownWidget(container, config, clientId);
                console.log(`[CountdownWidget] ✅ Виджет ${clientId} успешно создан`);
            })
            .catch(error => {
                console.error('[CountdownWidget] ❌ Ошибка:', error);
                showError(container, clientId, error.message);
            });

    } catch (error) {
        console.error('[CountdownWidget] 💥 Критическая ошибка:', error);
    }

    function createContainer(scriptElement, clientId) {
        const container = document.createElement('div');
        container.id = `countdown-widget-${clientId}`;
        container.className = 'countdown-widget-container';
        scriptElement.parentNode.insertBefore(container, scriptElement.nextSibling);
        return container;
    }

    function showLoading(container) {
        container.innerHTML = `
            <div class="countdown-widget">
                <div class="countdown-loading">
                    <div class="countdown-spinner"></div>
                    <div>Загрузка таймера...</div>
                </div>
            </div>
        `;
    }

    async function loadConfig(configUrl, baseUrl) {
        try {
            const response = await fetch(configUrl, {
                cache: 'no-cache',
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.warn(`[CountdownWidget] Основной конфиг недоступен, используем demo: ${error.message}`);
            
            // Fallback на demo.json
            const demoResponse = await fetch(`${baseUrl}/configs/demo.json?v=${Date.now()}`, {
                cache: 'no-cache',
                headers: { 'Accept': 'application/json' }
            });
            
            if (!demoResponse.ok) {
                throw new Error('Конфигурация недоступна');
            }
            
            return await demoResponse.json();
        }
    }

    function validateConfig(config) {
        if (!config.target) {
            throw new Error('Целевая дата не указана в конфигурации');
        }
        
        const targetDate = new Date(config.target);
        if (isNaN(targetDate.getTime())) {
            throw new Error('Некорректный формат целевой даты');
        }
        
        console.log(`[CountdownWidget] Target date: ${config.target} (${targetDate.toLocaleString()})`);
    }

    function applyCustomStyles(container, config) {
        const s = config.styling || {};
        const rootStyle = container.style;
        
        // Основные стили контейнера
        if (s.fontFamily) rootStyle.setProperty('--countdown-font', s.fontFamily);
        if (s.maxWidth) rootStyle.setProperty('--countdown-max-width', s.maxWidth);
        if (s.margin) rootStyle.setProperty('--countdown-margin', s.margin);
        if (s.textAlign) rootStyle.setProperty('--countdown-text-align', s.textAlign);
        if (s.zIndex) rootStyle.setProperty('--countdown-z-index', s.zIndex);
        
        // Фон виджета
        if (s.primaryColor && s.secondaryColor) {
            rootStyle.setProperty('--countdown-bg', `linear-gradient(135deg, ${s.primaryColor} 0%, ${s.secondaryColor} 100%)`);
        } else if (s.backgroundColor) {
            rootStyle.setProperty('--countdown-bg', s.backgroundColor);
        }
        
        // Основные стили виджета
        if (s.borderRadius) rootStyle.setProperty('--countdown-radius', s.borderRadius);
        if (s.padding) rootStyle.setProperty('--countdown-padding', s.padding);
        if (s.textColor) rootStyle.setProperty('--countdown-text-color', s.textColor);
        if (s.shadow) rootStyle.setProperty('--countdown-shadow', s.shadow);
        if (s.hoverTransform) rootStyle.setProperty('--countdown-hover-transform', s.hoverTransform);
        if (s.hoverShadow) rootStyle.setProperty('--countdown-hover-shadow', s.hoverShadow);
        if (s.overlay) rootStyle.setProperty('--countdown-overlay', s.overlay);
        
        // Заголовок
        if (s.titleSize) rootStyle.setProperty('--countdown-title-size', s.titleSize);
        if (s.titleWeight) rootStyle.setProperty('--countdown-title-weight', s.titleWeight);
        if (s.titleColor) rootStyle.setProperty('--countdown-title-color', s.titleColor);
        if (s.titleShadow) rootStyle.setProperty('--countdown-title-shadow', s.titleShadow);
        if (s.titleMargin) rootStyle.setProperty('--countdown-title-margin', s.titleMargin);
        
        // Дисплей счетчика
        if (s.displayGap) rootStyle.setProperty('--countdown-display-gap', s.displayGap);
        if (s.displayJustify) rootStyle.setProperty('--countdown-display-justify', s.displayJustify);
        if (s.displayMargin) rootStyle.setProperty('--countdown-display-margin', s.displayMargin);
        
        // Элементы счетчика
        if (s.itemBackground) rootStyle.setProperty('--countdown-item-bg', s.itemBackground);
        if (s.itemBorder) rootStyle.setProperty('--countdown-item-border', s.itemBorder);
        if (s.itemRadius) rootStyle.setProperty('--countdown-item-radius', s.itemRadius);
        if (s.itemPadding) rootStyle.setProperty('--countdown-item-padding', s.itemPadding);
        if (s.itemMinWidth) rootStyle.setProperty('--countdown-item-min-width', s.itemMinWidth);
        if (s.itemBackdrop) rootStyle.setProperty('--countdown-item-backdrop', s.itemBackdrop);
        if (s.itemHoverTransform) rootStyle.setProperty('--countdown-item-hover-transform', s.itemHoverTransform);
        if (s.itemHoverShadow) rootStyle.setProperty('--countdown-item-hover-shadow', s.itemHoverShadow);
        if (s.itemHoverBackground) rootStyle.setProperty('--countdown-item-hover-bg', s.itemHoverBackground);
        
        // Числа
        if (s.numberSize) rootStyle.setProperty('--countdown-number-size', s.numberSize);
        if (s.numberWeight) rootStyle.setProperty('--countdown-number-weight', s.numberWeight);
        if (s.numberColor) rootStyle.setProperty('--countdown-number-color', s.numberColor);
        if (s.numberFont) rootStyle.setProperty('--countdown-number-font', s.numberFont);
        if (s.numberGradient) rootStyle.setProperty('--countdown-number-gradient', s.numberGradient);
        if (s.numberShadow) rootStyle.setProperty('--countdown-number-shadow', s.numberShadow);
        if (s.numberMarginBottom) rootStyle.setProperty('--countdown-number-margin-bottom', s.numberMarginBottom);
        
        // Лейблы
        if (s.labelSize) rootStyle.setProperty('--countdown-label-size', s.labelSize);
        if (s.labelWeight) rootStyle.setProperty('--countdown-label-weight', s.labelWeight);
        if (s.labelColor) rootStyle.setProperty('--countdown-label-color', s.labelColor);
        if (s.labelFont) rootStyle.setProperty('--countdown-label-font', s.labelFont);
        if (s.labelTransform) rootStyle.setProperty('--countdown-label-transform', s.labelTransform);
        if (s.labelSpacing) rootStyle.setProperty('--countdown-label-spacing', s.labelSpacing);
        if (s.labelOpacity) rootStyle.setProperty('--countdown-label-opacity', s.labelOpacity);
        
        // Состояние завершения
        if (s.doneBackground) rootStyle.setProperty('--countdown-done-bg', s.doneBackground);
        if (s.donePadding) rootStyle.setProperty('--countdown-done-padding', s.donePadding);
        if (s.doneRadius) rootStyle.setProperty('--countdown-done-radius', s.doneRadius);
        if (s.doneSize) rootStyle.setProperty('--countdown-done-size', s.doneSize);
        if (s.doneWeight) rootStyle.setProperty('--countdown-done-weight', s.doneWeight);
        if (s.doneColor) rootStyle.setProperty('--countdown-done-color', s.doneColor);
        if (s.doneShadow) rootStyle.setProperty('--countdown-done-shadow', s.doneShadow);
        
        // Мобильные стили
        if (s.paddingMobile) rootStyle.setProperty('--countdown-padding-mobile', s.paddingMobile);
        if (s.titleSizeMobile) rootStyle.setProperty('--countdown-title-size-mobile', s.titleSizeMobile);
        if (s.numberSizeMobile) rootStyle.setProperty('--countdown-number-size-mobile', s.numberSizeMobile);
        if (s.displayGapMobile) rootStyle.setProperty('--countdown-display-gap-mobile', s.displayGapMobile);
        if (s.itemPaddingMobile) rootStyle.setProperty('--countdown-item-padding-mobile', s.itemPaddingMobile);
        if (s.itemMinWidthMobile) rootStyle.setProperty('--countdown-item-min-width-mobile', s.itemMinWidthMobile);
    }

    function createCountdownWidget(container, config, clientId) {
        const targetDate = new Date(config.target).getTime();
        let countdownInterval;

        function updateCountdown() {
            const now = new Date().getTime();
            const difference = targetDate - now;
            
            console.log(`[CountdownWidget] Time check: target=${targetDate}, now=${now}, diff=${difference}`);
            
            if (difference <= 0) {
                clearInterval(countdownInterval);
                container.innerHTML = `
                    <div class="countdown-widget">
                        <div class="countdown-done">
                            ${escapeHtml(config.doneText || '🎊 Время вышло!')}
                        </div>
                    </div>
                `;
                console.log(`[CountdownWidget] Timer finished, showing: ${config.doneText}`);
                return;
            }
            
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            // Определяем классы эффектов
            const effectsClasses = [];
            if (config.effects?.glow) effectsClasses.push('glow');
            if (config.effects?.animation) effectsClasses.push('animate');
            
            const effectsClass = effectsClasses.join(' ');
            
            container.innerHTML = `
                <div class="countdown-widget ${effectsClass}">
                    ${config.title ? `<h2 class="countdown-title">${escapeHtml(config.title)}</h2>` : ''}
                    <div class="countdown-display">
                        <div class="countdown-item">
                            <span class="countdown-number">${days.toString().padStart(2, '0')}</span>
                            <span class="countdown-label">${escapeHtml(config.labels?.days || 'Days')}</span>
                        </div>
                        <div class="countdown-item">
                            <span class="countdown-number">${hours.toString().padStart(2, '0')}</span>
                            <span class="countdown-label">${escapeHtml(config.labels?.hours || 'Hours')}</span>
                        </div>
                        <div class="countdown-item">
                            <span class="countdown-number">${minutes.toString().padStart(2, '0')}</span>
                            <span class="countdown-label">${escapeHtml(config.labels?.minutes || 'Minutes')}</span>
                        </div>
                        <div class="countdown-item">
                            <span class="countdown-number">${seconds.toString().padStart(2, '0')}</span>
                            <span class="countdown-label">${escapeHtml(config.labels?.seconds || 'Seconds')}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
        
        // Очистка интервала при удалении элемента
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.removedNodes.forEach(function(node) {
                        if (node === container || container.contains(node)) {
                            clearInterval(countdownInterval);
                            observer.disconnect();
                            console.log(`[CountdownWidget] Cleaned up interval for ${clientId}`);
                        }
                    });
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    function showError(container, clientId, message) {
        container.innerHTML = `
            <div class="countdown-error">
                <h3 style="margin: 0 0 15px 0;">⏰ Таймер недоступен</h3>
                <p style="margin: 0; opacity: 0.9; font-size: 0.9em;">ID: ${escapeHtml(clientId)}</p>
                <details style="margin-top: 15px;">
                    <summary style="cursor: pointer; opacity: 0.8;">Подробности</summary>
                    <p style="margin: 10px 0 0 0; font-size: 0.8em; opacity: 0.7;">${escapeHtml(message)}</p>
                </details>
            </div>
        `;
    }

})();
