(function() {
    'use strict';

    // Встроенные стили для мгновенной загрузки
    // Встроенные стили (ваши остаются без изменений)
    const inlineCSS = `
        .countdown-widget-container{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:20px auto;text-align:center}
        .countdown-widget{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:20px;padding:40px 30px;box-shadow:0 20px 60px rgba(102,126,234,0.4);color:white;position:relative;overflow:hidden}
@@ -42,11 +42,23 @@
            document.head.appendChild(style);
        }

        const baseUrl = currentScript.dataset.base || 
    currentScript.src.replace(/\/[^\/]+$/, '');
        // ИСПРАВЛЕНО: Улучшенное определение baseUrl
        let baseUrl = currentScript.dataset.base;
        if (!baseUrl) {
            const scriptSrc = currentScript.src;
            if (scriptSrc) {
                // Убираем имя файла из URL, оставляем только домен и путь
                baseUrl = scriptSrc.replace(/\/[^\/]*$/, '');
            } else {
                // Fallback для продакшена
                baseUrl = 'https://countdown-timer-widget2.tf-widgets.com';
            }
        }

        const configUrl = `${baseUrl}/configs/${encodeURIComponent(clientId)}.json`;

        console.log('[CountdownWidget] Загружаем конфигурацию:', configUrl);
        
        // Показываем индикатор загрузки
        const container = createContainer(currentScript, clientId);
        container.innerHTML = `
@@ -67,12 +79,14 @@
            }
        })
        .then(response => {
            console.log('[CountdownWidget] Ответ сервера:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`Конфигурация для ${clientId} не найдена (${response.status})`);
            }
            return response.json();
        })
        .then(config => {
            console.log('[CountdownWidget] Конфигурация загружена:', config);
            createCountdownWidget(container, config, clientId);
            console.log(`[CountdownWidget] Виджет ${clientId} успешно создан`);
        })
@@ -85,95 +99,96 @@
        console.error('[CountdownWidget] Критическая ошибка:', error);
    }

    // Остальные функции остаются без изменений...
    function createContainer(scriptElement, clientId) {
        let container = document.createElement('div');
        container.id = `countdown-widget-${clientId}`;
        container.className = 'countdown-widget-container';
        scriptElement.parentNode.insertBefore(container, scriptElement.nextSibling);
        return container;
    }

    function createCountdownWidget(container, config, clientId) {
        const targetDate = new Date(config.target).getTime();

        function updateCountdown() {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference <= 0) {
                container.innerHTML = `
                    <div class="countdown-done">
                        ${config.doneText || 'Время вышло!'}
                    </div>
                `;
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            const themeClass = config.theme ? `theme-${config.theme}` : '';
            const effectsClass = [
                config.effects?.glow ? 'glow' : '',
                config.effects?.animation ? 'animate' : ''
            ].filter(Boolean).join(' ');

            container.innerHTML = `
                <div class="countdown-widget ${themeClass} ${effectsClass}">
                    ${config.title ? `<h2 class="countdown-title">${config.title}</h2>` : ''}
                    <div class="countdown-display">
                        <div class="countdown-item">
                            <span class="countdown-number">${days.toString().padStart(2, '0')}</span>
                            <span class="countdown-label">${config.labels?.days || 'Days'}</span>
                        </div>
                        <div class="countdown-item">
                            <span class="countdown-number">${hours.toString().padStart(2, '0')}</span>
                            <span class="countdown-label">${config.labels?.hours || 'Hours'}</span>
                        </div>
                        <div class="countdown-item">
                            <span class="countdown-number">${minutes.toString().padStart(2, '0')}</span>
                            <span class="countdown-label">${config.labels?.minutes || 'Minutes'}</span>
                        </div>
                        <div class="countdown-item">
                            <span class="countdown-number">${seconds.toString().padStart(2, '0')}</span>
                            <span class="countdown-label">${config.labels?.seconds || 'Seconds'}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        // Очистка при удалении элемента
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.removedNodes.forEach(function(node) {
                        if (node === container) {
                            clearInterval(interval);
                            observer.disconnect();
                        }
                    });
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function showError(container, clientId, message) {
        container.innerHTML = `
            <div class="countdown-error">
                <h3 style="margin: 0 0 15px 0;">⏰ Виджет временно недоступен</h3>
                <p style="margin: 0; opacity: 0.9; font-size: 0.9em;">ID: ${clientId}</p>
                <details style="margin-top: 15px;">
                    <summary style="cursor: pointer; opacity: 0.8;">Подробности</summary>
                    <p style="margin: 10px 0 0 0; font-size: 0.8em; opacity: 0.7;">${message}</p>
                </details>
            </div>
        `;
    }
})();
