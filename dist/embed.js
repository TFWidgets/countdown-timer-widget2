(function() {
    'use strict';
    
    // Получение текущего скрипт-тега
    const currentScript = document.currentScript || 
          (function() {
              const scripts = document.getElementsByTagName('script');
              return scripts[scripts.length - 1];
          })();
    
    if (!currentScript) {
        console.error('TFWidget: Unable to find script tag');
        return;
    }
    
    // Извлечение параметров
    const clientId = currentScript.getAttribute('data-id');
    const debug = currentScript.hasAttribute('data-debug');
    const apiBase = currentScript.getAttribute('data-api') || 'https://api.tf-widgets.com';
    
    if (!clientId) {
        console.error('TFWidget: data-id attribute is required');
        return;
    }
    
    // Определение базового URL для ресурсов
    const scriptSrc = currentScript.src;
    const cdnBase = scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1);
    
    // Загрузка CSS с кэшированием
    function loadCSS(href) {
        if (document.querySelector(`link[href="${href}"]`)) return;
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.crossOrigin = 'anonymous';
        link.onerror = () => debug && console.warn('TFWidget: CSS load failed:', href);
        document.head.appendChild(link);
    }
    
    // Загрузка JS с Promise
    function loadJS(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.crossOrigin = 'anonymous';
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load: ${src}`));
            document.head.appendChild(script);
        });
    }
    
    // Получение конфигурации с fallback
    async function fetchClientConfig(clientId) {
        try {
            const response = await fetch(`${apiBase}/widget/countdown/config?client=${encodeURIComponent(clientId)}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                credentials: 'omit',
                signal: AbortSignal.timeout(5000) // 5 секунд таймаут
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const config = await response.json();
            debug && console.log('TFWidget: Config loaded:', config);
            return config;
            
        } catch (error) {
            console.warn('TFWidget: API unavailable, using fallback:', error.message);
            
            // Fallback конфигурация для Shopify
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59, 59, 999);
            
            return {
                target: tomorrow.toISOString(),
                locale: 'en-US',
                title: 'Limited Time Offer!',
                theme: 'default',
                labels: {
                    days: 'Days',
                    hours: 'Hours', 
                    minutes: 'Minutes',
                    seconds: 'Seconds'
                },
                doneText: 'Offer Ended!',
                autoStart: true,
                styles: {
                    fontSize: '18px',
                    color: '#333',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '20px',
                    textAlign: 'center',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }
            };
        }
    }
    
    // Создание контейнера
    function createContainer() {
        const containerId = `tf-countdown-${clientId}`;
        let container = document.getElementById(containerId);
        
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.className = 'tf-countdown-widget';
            container.setAttribute('data-client', clientId);
            
            // Вставка после скрипт-тега
            currentScript.parentNode.insertBefore(container, currentScript.nextSibling);
        }
        
        return container;
    }
    
    // Применение кастомных стилей
    function applyCustomStyles(config) {
        if (!config.styles) return;
        
        const styleId = `tf-countdown-styles-${clientId}`;
        if (document.getElementById(styleId)) return;
        
        const styles = config.styles;
        const css = `
            #tf-countdown-${clientId} {
                font-size: ${styles.fontSize || '16px'};
                color: ${styles.color || '#333'};
                background-color: ${styles.backgroundColor || 'transparent'};
                border-radius: ${styles.borderRadius || '0'};
                padding: ${styles.padding || '10px'};
                text-align: ${styles.textAlign || 'left'};
                font-family: ${styles.fontFamily || 'inherit'};
                box-shadow: ${styles.boxShadow || 'none'};
                border: ${styles.border || 'none'};
                margin: ${styles.margin || '0'};
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = css;
        document.head.appendChild(styleElement);
    }
    
    // Инициализация виджета
    function initWidget(container, config) {
        // Применить кастомные стили
        applyCustomStyles(config);
        
        // Инициализировать виджет
        if (typeof window.TFCountdownWidget === 'function') {
            new window.TFCountdownWidget(container, config);
        } else if (typeof window.initTFCountdown === 'function') {
            window.initTFCountdown(container, config);
        } else {
            console.error('TFWidget: Widget API not found in main script');
            return;
        }
        
        // Аналитика (опционально)
        try {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'widget_loaded', {
                    'client_id': clientId,
                    'widget_type': 'countdown'
                });
            }
        } catch (e) {
            // Игнорируем ошибки аналитики
        }
        
        debug && console.log('TFWidget: Successfully initialized for client:', clientId);
    }
    
    // Основная логика загрузки
    async function bootstrap() {
        try {
            // Загрузить стили
            loadCSS(`${cdnBase}widget.min.css`);
            
            // Параллельно загрузить конфиг и основной скрипт
            const [config] = await Promise.all([
                fetchClientConfig(clientId),
                loadJS(`${cdnBase}widget.min.js`)
            ]);
            
            // Создать контейнер и инициализировать виджет
            const container = createContainer();
            initWidget(container, config);
            
        } catch (error) {
            console.error('TFWidget: Initialization failed:', error);
            
            // Показать fallback сообщение
            const container = createContainer();
            container.innerHTML = '<div style="padding:10px;color:#666;text-align:center;">Widget temporarily unavailable</div>';
        }
    }
    
    // Запуск после готовности DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
    
})();
