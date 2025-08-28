(function() {
    'use strict';
    
    // Встроенные стили (ваши остаются без изменений)
    const inlineCSS = `
        .countdown-widget-container{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:20px auto;text-align:center}
        .countdown-widget{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:20px;padding:40px 30px;box-shadow:0 20px 60px rgba(102,126,234,0.4);color:white;position:relative;overflow:hidden}
        .countdown-widget::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 30% 20%,rgba(255,255,255,0.2) 0%,transparent 50%);pointer-events:none}
        .countdown-title{font-size:1.8em;font-weight:600;margin-bottom:30px;text-shadow:0 2px 8px rgba(0,0,0,0.3)}
        .countdown-display{display:flex;justify-content:center;gap:20px;flex-wrap:wrap;margin:30px 0}
        .countdown-item{background:rgba(255,255,255,0.15);backdrop-filter:blur(15px);border:1px solid rgba(255,255,255,0.3);border-radius:16px;padding:24px 18px;min-width:85px;transition:all 0.4s cubic-bezier(0.4,0,0.2,1);position:relative}
        .countdown-item:hover{transform:translateY(-8px) scale(1.05);box-shadow:0 15px 35px rgba(0,0,0,0.3);background:rgba(255,255,255,0.25)}
        .countdown-number{display:block;font-size:2.8em;font-weight:800;line-height:1;margin-bottom:8px;text-shadow:0 3px 6px rgba(0,0,0,0.4);background:linear-gradient(45deg,#fff,#f8f9fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .countdown-label{font-size:0.85em;text-transform:uppercase;letter-spacing:1.2px;font-weight:600;opacity:0.95}
        .countdown-done{background:linear-gradient(135deg,#11998e 0%,#38ef7d 100%);padding:50px 30px;border-radius:20px;font-size:1.6em;font-weight:700;text-shadow:0 2px 8px rgba(0,0,0,0.3)}
        .countdown-error{background:linear-gradient(135deg,#ff6b6b 0%,#ee5a24 100%);padding:30px;border-radius:16px;color:white;box-shadow:0 15px 40px rgba(255,107,107,0.4)}
        @keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.02)}100%{transform:scale(1)}}
        .countdown-widget.animate .countdown-item{animation:pulse 2s ease-in-out infinite}
        .countdown-widget.glow{box-shadow:0 20px 60px rgba(102,126,234,0.4),0 0 0 1px rgba(255,255,255,0.1),inset 0 1px 0 rgba(255,255,255,0.3)}
        @media (max-width:768px){.countdown-display{gap:15px}.countdown-item{min-width:70px;padding:18px 12px}.countdown-number{font-size:2.2em}.countdown-widget{padding:30px 20px}}
        @media (max-width:480px){.countdown-display{gap:12px}.countdown-item{min-width:65px;padding:15px 10px}.countdown-number{font-size:1.9em}.countdown-title{font-size:1.4em}}
    `;
    
    try {
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
        
        // Добавляем стили если их еще нет
        if (!document.querySelector('#countdown-widget-styles')) {
            const style = document.createElement('style');
            style.id = 'countdown-widget-styles';
            style.textContent = inlineCSS;
            document.head.appendChild(style);
        }
        
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
            <div class="countdown-widget">
                <div style="padding: 40px; text-align: center;">
                    <div style="width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                    <div>Загрузка виджета...</div>
                </div>
            </div>
            <style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>
        `;
        
        // Загружаем конфигурацию
        fetch(configUrl, { 
            cache: 'no-cache',
            headers: {
                'Accept': 'application/json'
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
        .catch(error => {
            console.error('[CountdownWidget] Ошибка загрузки:', error);
            showError(container, clientId, error.message);
        });
        
    } catch (error) {
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
