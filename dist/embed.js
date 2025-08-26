(function() {
    'use strict';
    
    try {
        // Находим текущий script тег
        const currentScript = document.currentScript || 
            (function() {
                const scripts = document.getElementsByTagName('script');
                return scripts[scripts.length - 1];
            })();
        
        const clientId = currentScript.dataset.id;
        if (!clientId) {
            console.error('[CountdownWidget] data-id обязателен');
            return;
        }
        
        // Определяем базовый URL
        const baseUrl = currentScript.dataset.base || 
            currentScript.src.replace(/\/dist\/[^\/]+$/, '');
        
        const cssUrl = `${baseUrl}/dist/widget.min.css`;
        const widgetJsUrl = `${baseUrl}/dist/widget.min.js`;
        const configUrl = `${baseUrl}/configs/${encodeURIComponent(clientId)}.json`;
        
        // Загружаем CSS (если еще не загружен)
        function loadCSS(href) {
            if (document.querySelector(`link[href="${href}"]`)) return;
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        }
        
        // Загружаем JS
        function loadJS(src) {
            return new Promise((resolve, reject) => {
                if (window.CountdownWidget) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        
        // Загружаем все ресурсы и инициализируем
        loadCSS(cssUrl);
        
        loadJS(widgetJsUrl)
            .then(() => fetch(configUrl, { cache: 'no-cache' }))
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Конфигурация для ${clientId} не найдена (${response.status})`);
                }
                return response.json();
            })
            .then(config => {
                // Создаем контейнер для виджета
                let container = config.mountSelector ? 
                    document.querySelector(config.mountSelector) : null;
                
                if (!container) {
                    container = document.createElement('div');
                    container.id = `countdown-widget-${clientId}`;
                    container.className = 'countdown-widget-container';
                    currentScript.parentNode.insertBefore(container, currentScript.nextSibling);
                }
                
                // Инициализируем виджет (поддержка разных API)
                if (window.CountdownWidget) {
                    if (typeof window.CountdownWidget.init === 'function') {
                        // Ваш текущий API
                        window.CountdownWidget.init(container, config);
                    } else if (typeof window.CountdownWidget === 'function') {
                        // Класс-конструктор
                        new window.CountdownWidget(container, config);
                    }
                } else {
                    throw new Error('CountdownWidget не найден');
                }
                
                console.log(`[CountdownWidget] Виджет ${clientId} успешно инициализирован`);
            })
            .catch(error => {
                console.error('[CountdownWidget] Ошибка загрузки:', error);
                
                // Показываем ошибку пользователю
                const errorDiv = document.createElement('div');
                errorDiv.style.cssText = `
                    padding: 10px; 
                    background: #ffe6e6; 
                    border: 1px solid #ff6b6b; 
                    border-radius: 4px; 
                    color: #d63031; 
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                `;
                errorDiv.textContent = `Виджет временно недоступен (ID: ${clientId})`;
                currentScript.parentNode.insertBefore(errorDiv, currentScript.nextSibling);
            });
            
    } catch (error) {
        console.error('[CountdownWidget] Критическая ошибка:', error);
    }
})();
