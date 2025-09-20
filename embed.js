(function() {
    'use strict';

    const CTC_WIDGET_VERSION = '2.0.0';
    console.log(`[ClickToCallWidget v${CTC_WIDGET_VERSION}] Initializing...`);

    // CSS стили с полной кастомизацией через CSS-переменные
    const inlineCSS = `
        .ctc-container {
            font-family: var(--ctc-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
            max-width: var(--ctc-max-width, 350px);
            margin: var(--ctc-margin, 20px auto);
            position: var(--ctc-position, relative);
            z-index: var(--ctc-z-index, 1000);
        }
        
        .ctc-widget {
            background: var(--ctc-bg, linear-gradient(135deg, #25d366 0%, #128c7e 100%));
            border-radius: var(--ctc-radius, 16px);
            padding: var(--ctc-padding, 25px);
            color: var(--ctc-text-color, white);
            box-shadow: var(--ctc-shadow, 0 8px 32px rgba(37, 211, 102, 0.3));
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        
        .ctc-widget:hover {
            transform: var(--ctc-hover-transform, translateY(-2px));
            box-shadow: var(--ctc-hover-shadow, 0 12px 40px rgba(37, 211, 102, 0.4));
        }
        
        .ctc-widget::before {
            content: '';
            position: absolute;
            inset: 0;
            background: var(--ctc-overlay, radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 70%));
            pointer-events: none;
        }
        
        .ctc-header {
            text-align: var(--ctc-header-align, center);
            margin-bottom: var(--ctc-header-margin, 20px);
            position: relative;
            z-index: 2;
        }
        
        .ctc-icon {
            font-size: var(--ctc-icon-size, 2.5em);
            margin-bottom: var(--ctc-icon-margin, 10px);
            display: block;
            animation: var(--ctc-icon-animation, ctc-pulse 2s infinite);
        }
        
        .ctc-title {
            font-size: var(--ctc-title-size, 1.4em);
            font-weight: var(--ctc-title-weight, 600);
            margin: var(--ctc-title-margin, 0 0 8px 0);
            color: var(--ctc-title-color, inherit);
        }
        
        .ctc-subtitle {
            font-size: var(--ctc-subtitle-size, 0.9em);
            opacity: var(--ctc-subtitle-opacity, 0.9);
            margin: var(--ctc-subtitle-margin, 0 0 20px 0);
            color: var(--ctc-subtitle-color, inherit);
        }
        
        .ctc-main-button {
            width: var(--ctc-button-width, 85%);
            max-width: var(--ctc-button-max-width, 300px);
            margin: var(--ctc-button-margin, 0 auto);
            background: var(--ctc-button-bg, rgba(255, 255, 255, 0.2));
            color: var(--ctc-button-color, white);
            border: var(--ctc-button-border, 2px solid rgba(255, 255, 255, 0.3));
            padding: var(--ctc-button-padding, 16px 24px);
            border-radius: var(--ctc-button-radius, 12px);
            font-size: var(--ctc-button-size, 1.1em);
            font-weight: var(--ctc-button-weight, 600);
            cursor: pointer;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--ctc-button-gap, 12px);
            transition: all 0.3s ease;
            position: relative;
            z-index: 2;
            backdrop-filter: blur(10px);
            box-sizing: border-box;
        }
        
        .ctc-main-button:hover {
            background: var(--ctc-button-hover-bg, rgba(255, 255, 255, 0.3));
            border-color: var(--ctc-button-hover-border, rgba(255, 255, 255, 0.5));
            transform: scale(1.02);
        }
        
        .ctc-phone-display {
            font-family: var(--ctc-phone-font, inherit);
            font-size: var(--ctc-phone-size, 1.15em);
            font-weight: var(--ctc-phone-weight, 600);
            letter-spacing: var(--ctc-phone-spacing, 0.5px);
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.2;
        }
        
        .ctc-actions-grid {
            display: grid;
            grid-template-columns: var(--ctc-actions-columns, repeat(auto-fit, minmax(120px, 1fr)));
            gap: var(--ctc-actions-gap, 10px);
            margin-top: var(--ctc-actions-margin-top, 15px);
            position: relative;
            z-index: 2;
        }
        
        .ctc-action-button {
            padding: var(--ctc-action-padding, 8px 12px);
            background: var(--ctc-action-bg, transparent);
            color: var(--ctc-action-color, rgba(255, 255, 255, 0.9));
            border: var(--ctc-action-border, 1px solid rgba(255, 255, 255, 0.3));
            border-radius: var(--ctc-action-radius, 8px);
            font-size: var(--ctc-action-size, 0.8em);
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: all 0.3s ease;
        }
        
        .ctc-action-button:hover {
            background: var(--ctc-action-hover, rgba(255, 255, 255, 0.1));
            border-color: var(--ctc-action-hover-border, rgba(255, 255, 255, 0.5));
        }
        
        .ctc-info-text {
            margin-top: var(--ctc-info-margin-top, 15px);
            font-size: var(--ctc-info-size, 0.8em);
            opacity: var(--ctc-info-opacity, 0.8);
            text-align: center;
            color: var(--ctc-info-color, inherit);
            position: relative;
            z-index: 2;
        }
        
        .ctc-floating {
            position: fixed;
            bottom: var(--ctc-floating-bottom, 20px);
            right: var(--ctc-floating-right, 20px);
            left: var(--ctc-floating-left, auto);
            max-width: var(--ctc-floating-max-width, 280px);
            margin: 0;
            z-index: var(--ctc-floating-z-index, 9999);
        }
        
        .ctc-floating .ctc-widget {
            animation: ctc-bounce-in 0.6s ease;
        }
        
        .ctc-loading {
            text-align: center;
            padding: 40px 20px;
            color: #666;
        }
        
        .ctc-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid var(--ctc-spinner-color, #25d366);
            border-radius: 50%;
            animation: ctc-spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        
        .ctc-error {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            padding: 25px;
            border-radius: 16px;
            color: white;
            text-align: center;
            box-shadow: 0 8px 32px rgba(255, 107, 107, 0.3);
        }
        
        @keyframes ctc-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes ctc-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        @keyframes ctc-bounce-in {
            0% {
                opacity: 0;
                transform: scale(0.3) translateY(50px);
            }
            50% {
                opacity: 1;
                transform: scale(1.05) translateY(-10px);
            }
            70% {
                transform: scale(0.9) translateY(0);
            }
            100% {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
        
        @media (max-width: 480px) {
            .ctc-container {
                max-width: calc(100vw - 40px);
                margin: 10px auto;
            }
            
            .ctc-widget {
                padding: 20px;
            }
            
            .ctc-floating {
                bottom: 10px;
                right: 10px;
                left: 10px;
                max-width: none;
            }
            
            .ctc-actions-grid {
                grid-template-columns: 1fr;
                gap: 8px;
            }
            
            .ctc-phone-display {
                font-size: var(--ctc-phone-size-mobile, 1em);
                letter-spacing: 0.3px;
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
            console.error('[ClickToCallWidget] data-id обязателен');
            return;
        }

        // Нормализация clientId: убираем .js расширение
        if (clientId.endsWith('.js')) {
            clientId = clientId.slice(0, -3);
        }

        console.log(`[ClickToCallWidget v${CTC_WIDGET_VERSION}] Loading clientId: ${clientId}`);

        // Добавляем стили один раз
        if (!document.querySelector('#click-to-call-widget-styles')) {
            const style = document.createElement('style');
            style.id = 'click-to-call-widget-styles';
            style.textContent = inlineCSS;
            document.head.appendChild(style);
        }

        // Определяем baseUrl
        const baseUrl = currentScript.src ? 
            currentScript.src.replace(/\/[^\/]*$/, '') : 
            'https://call-widget.tf-widgets.com';

        // URL конфига с кеш-бастером
        const configUrl = `${baseUrl}/configs/${encodeURIComponent(clientId)}.json?v=${Date.now()}`;

        // Создаем контейнер
        const container = createContainer(currentScript, clientId);
        
        // Показываем загрузку
        showLoading(container);

        // Загружаем конфигурацию с fallback
        loadConfig(configUrl, baseUrl)
            .then(config => {
                validateConfig(config);
                applyCustomStyles(container, config);
                createClickToCallWidget(container, config, clientId);
                console.log(`[ClickToCallWidget] ✅ Виджет ${clientId} успешно создан`);
            })
            .catch(error => {
                console.error('[ClickToCallWidget] ❌ Ошибка:', error);
                showError(container, clientId, error.message);
            });

    } catch (error) {
        console.error('[ClickToCallWidget] 💥 Критическая ошибка:', error);
    }

    function createContainer(scriptElement, clientId) {
        const container = document.createElement('div');
        container.id = `click-to-call-widget-${clientId}`;
        container.className = 'ctc-container';
        
        // Поддержка floating режима
        const isFloating = scriptElement.dataset.floating === 'true';
        if (isFloating) {
            container.classList.add('ctc-floating');
            document.body.appendChild(container);
        } else {
            scriptElement.parentNode.insertBefore(container, scriptElement.nextSibling);
        }
        
        return container;
    }

    function showLoading(container) {
        container.innerHTML = `
            <div class="ctc-widget">
                <div class="ctc-loading">
                    <div class="ctc-spinner"></div>
                    <div>Загрузка...</div>
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
            console.warn(`[ClickToCallWidget] Основной конфиг недоступен, используем demo: ${error.message}`);
            
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
        if (!config.phoneNumber) {
            throw new Error('Номер телефона не указан в конфигурации');
        }
    }

    function applyCustomStyles(container, config) {
        const s = config.styling || {};
        const rootStyle = container.style;
        
        // Основные стили
        if (s.fontFamily) rootStyle.setProperty('--ctc-font', s.fontFamily);
        if (s.maxWidth) rootStyle.setProperty('--ctc-max-width', s.maxWidth);
        if (s.margin) rootStyle.setProperty('--ctc-margin', s.margin);
        if (s.zIndex) rootStyle.setProperty('--ctc-z-index', s.zIndex);
        
        // Фон виджета
        if (s.primaryColor && s.secondaryColor) {
            rootStyle.setProperty('--ctc-bg', `linear-gradient(135deg, ${s.primaryColor} 0%, ${s.secondaryColor} 100%)`);
        } else if (s.backgroundColor) {
            rootStyle.setProperty('--ctc-bg', s.backgroundColor);
        }
        
        // Стили виджета
        if (s.borderRadius) rootStyle.setProperty('--ctc-radius', s.borderRadius);
        if (s.padding) rootStyle.setProperty('--ctc-padding', s.padding);
        if (s.textColor) rootStyle.setProperty('--ctc-text-color', s.textColor);
        if (s.shadow) rootStyle.setProperty('--ctc-shadow', s.shadow);
        if (s.hoverTransform) rootStyle.setProperty('--ctc-hover-transform', s.hoverTransform);
        if (s.hoverShadow) rootStyle.setProperty('--ctc-hover-shadow', s.hoverShadow);
        
        // Заголовок и иконка
        if (s.headerAlign) rootStyle.setProperty('--ctc-header-align', s.headerAlign);
        if (s.iconSize) rootStyle.setProperty('--ctc-icon-size', s.iconSize);
        if (s.iconAnimation) rootStyle.setProperty('--ctc-icon-animation', s.iconAnimation);
        if (s.titleSize) rootStyle.setProperty('--ctc-title-size', s.titleSize);
        if (s.titleWeight) rootStyle.setProperty('--ctc-title-weight', s.titleWeight);
        
        // Кнопка (НОВЫЕ ПЕРЕМЕННЫЕ ДЛЯ ЦЕНТРИРОВАНИЯ)
        if (s.buttonBackground) rootStyle.setProperty('--ctc-button-bg', s.buttonBackground);
        if (s.buttonColor) rootStyle.setProperty('--ctc-button-color', s.buttonColor);
        if (s.buttonBorder) rootStyle.setProperty('--ctc-button-border', s.buttonBorder);
        if (s.buttonRadius) rootStyle.setProperty('--ctc-button-radius', s.buttonRadius);
        if (s.buttonSize) rootStyle.setProperty('--ctc-button-size', s.buttonSize);
        if (s.buttonWidth) rootStyle.setProperty('--ctc-button-width', s.buttonWidth);
        if (s.buttonMaxWidth) rootStyle.setProperty('--ctc-button-max-width', s.buttonMaxWidth);
        if (s.buttonMargin) rootStyle.setProperty('--ctc-button-margin', s.buttonMargin);
        
        // Стили телефона (НОВЫЕ ПЕРЕМЕННЫЕ)
        if (s.phoneFont) rootStyle.setProperty('--ctc-phone-font', s.phoneFont);
        if (s.phoneSize) rootStyle.setProperty('--ctc-phone-size', s.phoneSize);
        if (s.phoneWeight) rootStyle.setProperty('--ctc-phone-weight', s.phoneWeight);
        if (s.phoneSpacing) rootStyle.setProperty('--ctc-phone-spacing', s.phoneSpacing);
        if (s.phoneSizeMobile) rootStyle.setProperty('--ctc-phone-size-mobile', s.phoneSizeMobile);
        
        // Floating режим
        if (s.floatingBottom) rootStyle.setProperty('--ctc-floating-bottom', s.floatingBottom);
        if (s.floatingRight) rootStyle.setProperty('--ctc-floating-right', s.floatingRight);
        if (s.floatingMaxWidth) rootStyle.setProperty('--ctc-floating-max-width', s.floatingMaxWidth);
    }

    function createClickToCallWidget(container, config, clientId) {
        const {
            businessName,
            phoneNumber,
            displayPhoneNumber, // КЛЮЧЕВОЕ ПОЛЕ для красивого отображения
            icon = '📞',
            title,
            subtitle,
            actions = [],
            infoText
        } = config;

        // Очистка номера телефона для tel: ссылки
        const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
        
        // ГЛАВНОЕ ИСПРАВЛЕНИЕ: используем displayPhoneNumber если указан
        const finalDisplayPhone = displayPhoneNumber || phoneNumber;
        const callUrl = `tel:${cleanPhone}`;

        console.log(`[ClickToCallWidget] Phone: ${phoneNumber} → Display: ${finalDisplayPhone} → Clean: ${cleanPhone}`);

        // Генерируем дополнительные действия
        const actionsHTML = actions.length > 0 ? `
            <div class="ctc-actions-grid">
                ${actions.map(action => {
                    const actionUrl = buildActionUrl(action);
                    return actionUrl ? `
                        <a href="${escapeHtml(actionUrl)}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="ctc-action-button"
                           onclick="trackAction('${clientId}', '${action.type}')">
                            ${action.icon ? `${escapeHtml(action.icon)} ` : ''}${escapeHtml(action.text)}
                        </a>
                    ` : '';
                }).join('')}
            </div>
        ` : '';

        // Создаем HTML структуру
        container.innerHTML = `
            <div class="ctc-widget">
                <div class="ctc-header">
                    <div class="ctc-icon">${escapeHtml(icon)}</div>
                    <h3 class="ctc-title">${escapeHtml(title || businessName || 'Позвоните нам')}</h3>
                    ${subtitle ? `<p class="ctc-subtitle">${escapeHtml(subtitle)}</p>` : ''}
                </div>
                
                <a href="${callUrl}" class="ctc-main-button" onclick="trackCall('${clientId}', '${cleanPhone}')">
                    <span class="ctc-phone-display">${escapeHtml(finalDisplayPhone)}</span>
                </a>
                
                ${actionsHTML}
                
                ${infoText ? `<p class="ctc-info-text">${escapeHtml(infoText)}</p>` : ''}
            </div>
        `;

        // Добавляем обработчик клика для аналитики
        const mainButton = container.querySelector('.ctc-main-button');
        if (mainButton) {
            mainButton.addEventListener('click', function(e) {
                // Google Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'phone_call', {
                        event_category: 'engagement',
                        event_label: clientId,
                        phone_number: cleanPhone
                    });
                }
                
                // Facebook Pixel
                if (typeof fbq !== 'undefined') {
                    fbq('track', 'Contact', {
                        content_name: 'Phone Call',
                        content_category: clientId
                    });
                }
                
                console.log(`[ClickToCallWidget] Call initiated: ${cleanPhone} (${clientId})`);
            });
        }
    }

    function buildActionUrl(action) {
        const { type, value, text, url, additionalText } = action;
        
        switch (type) {
            case 'whatsapp':
                const whatsappNumber = value ? value.replace(/[^\d]/g, '') : '';
                const whatsappText = additionalText || text;
                const whatsappQuery = whatsappText ? `?text=${encodeURIComponent(whatsappText)}` : '';
                return whatsappNumber ? `https://wa.me/${whatsappNumber}${whatsappQuery}` : null;
                
            case 'telegram':
                const telegramUser = value ? value.replace(/^@/, '') : '';
                return telegramUser ? `https://t.me/${telegramUser}` : null;
                
            case 'sms':
                const smsNumber = value ? value.replace(/[^\d+]/g, '') : '';
                const smsBody = additionalText || text;
                const smsQuery = smsBody ? `?body=${encodeURIComponent(smsBody)}` : '';
                return smsNumber ? `sms:${smsNumber}${smsQuery}` : null;
                
            case 'email':
                const subject = additionalText || text;
                const emailQuery = subject ? `?subject=${encodeURIComponent(subject)}` : '';
                return value ? `mailto:${value}${emailQuery}` : null;
                
            case 'link':
                return url || value || null;
                
            default:
                return null;
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    function showError(container, clientId, message) {
        container.innerHTML = `
            <div class="ctc-widget ctc-error">
                <div class="ctc-icon">❌</div>
                <h3 style="margin: 0 0 15px 0;">Виджет недоступен</h3>
                <p style="margin: 0; font-size: 0.9em;">ID: ${escapeHtml(clientId)}</p>
                <details style="margin-top: 15px;">
                    <summary style="cursor: pointer;">Подробности</summary>
                    <p style="margin: 10px 0 0 0; font-size: 0.8em;">${escapeHtml(message)}</p>
                </details>
            </div>
        `;
    }

    // Глобальные функции для трекинга
    window.trackCall = function(clientId, phoneNumber) {
        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'phone_call',
                client_id: clientId,
                phone_number: phoneNumber
            });
        }
    };

    window.trackAction = function(clientId, actionType) {
        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'widget_action',
                client_id: clientId,
                action_type: actionType
            });
        }
    };

})();
