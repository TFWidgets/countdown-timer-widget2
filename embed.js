(function() {
    'use strict';

    // CSS стили для виджета рабочего времени
    const inlineCSS = `
        .business-hours-widget-container {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 400px;
            margin: 20px auto;
        }
        
        .business-hours-widget {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            padding: 30px;
            color: white;
            box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);
        }
        
        .widget-header {
            text-align: center;
            margin-bottom: 25px;
        }
        
        .business-name {
            font-size: 1.6em;
            font-weight: 600;
            margin-bottom: 15px;
            text-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #4ade80;
            color: white;
            padding: 8px 16px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 0.9em;
        }
        
        .status-badge.closed {
            background: #ef4444;
        }
        
        .hours-table {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 20px;
            color: #333;
            margin: 20px 0;
        }
        
        .hours-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid rgba(0,0,0,0.1);
        }
        
        .hours-row:last-child {
            border-bottom: none;
        }
        
        .hours-row.current-day {
            background: rgba(102, 126, 234, 0.1);
            border-radius: 8px;
            padding: 12px 15px;
            margin: 0 -15px;
        }
        
        .day-name {
            font-weight: 600;
            font-size: 1em;
        }
        
        .hours-time {
            font-weight: 500;
            color: #666;
        }
        
        .hours-time.closed {
            color: #ef4444;
            font-style: italic;
        }
        
        .closing-info {
            background: rgba(255, 255, 255, 0.2);
            padding: 12px;
            border-radius: 10px;
            text-align: center;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .timezone-info {
            text-align: center;
            font-size: 0.85em;
            opacity: 0.8;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
        }
        
        .error {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            padding: 30px;
            border-radius: 16px;
            color: white;
            text-align: center;
        }
        
        @media (max-width: 480px) {
            .business-hours-widget {
                padding: 20px;
            }
            .hours-table {
                padding: 15px;
            }
        }
    `;

    try {
        const currentScript = document.currentScript || (function() {
            const scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();

        const clientId = currentScript.dataset.id;
        if (!clientId) {
            console.error('[BusinessHoursWidget] data-id обязателен');
            return;
        }

        // Добавляем стили
        if (!document.querySelector('#business-hours-widget-styles')) {
            const style = document.createElement('style');
            style.id = 'business-hours-widget-styles';
            style.textContent = inlineCSS;
            document.head.appendChild(style);
        }

        // Определяем baseUrl
        let baseUrl = currentScript.dataset.base;
        if (!baseUrl) {
            const scriptSrc = currentScript.src;
            if (scriptSrc) {
                baseUrl = scriptSrc.replace(/\/[^\/]*$/, '');
            } else {
                baseUrl = 'https://business-hours-widget.tf-widgets.com';
            }
        }

        const configUrl = `${baseUrl}/configs/${encodeURIComponent(clientId)}.json`;
        console.log('[BusinessHoursWidget] Загружаем конфигурацию:', configUrl);

        // Создаем контейнер и показываем загрузку
        const container = createContainer(currentScript, clientId);
        container.innerHTML = `
            <div class="business-hours-widget">
                <div class="loading">
                    <div style="width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                    <div>Загрузка виджета...</div>
                </div>
            </div>
            <style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>
        `;

        // Загружаем конфигурацию
        fetch(configUrl, {
            cache: 'no-cache',
            headers: { 'Accept': 'application/json' }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Конфигурация для ${clientId} не найдена (${response.status})`);
            }
            return response.json();
        })
        .then(config => {
            console.log('[BusinessHoursWidget] Конфигурация загружена:', config);
            createBusinessHoursWidget(container, config, clientId);
        })
        .catch(error => {
            console.error('[BusinessHoursWidget] Ошибка загрузки:', error);
            showError(container, clientId, error.message);
        });

    } catch (error) {
        console.error('[BusinessHoursWidget] Критическая ошибка:', error);
    }

    function createContainer(scriptElement, clientId) {
        let container = document.createElement('div');
        container.id = `business-hours-widget-${clientId}`;
        container.className = 'business-hours-widget-container';
        scriptElement.parentNode.insertBefore(container, scriptElement.nextSibling);
        return container;
    }

    function createBusinessHoursWidget(container, config, clientId) {
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes from midnight
        
        // Определяем статус (открыто/закрыто)
        const todayHours = config.hours[currentDay];
        let isOpen = false;
        let closingTime = '';
        
        if (todayHours && !todayHours.closed) {
            const openTime = parseTime(todayHours.open);
            const closeTime = parseTime(todayHours.close);
            isOpen = currentTime >= openTime && currentTime < closeTime;
            closingTime = todayHours.close;
        }

        const daysOfWeek = config.labels?.days || [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ];

        let hoursHTML = '';
        config.hours.forEach((dayHours, index) => {
            const isCurrent = index === currentDay;
            const dayName = daysOfWeek[index];
            const timeText = dayHours.closed ? 
                (config.labels?.closed || 'Closed') : 
                `${dayHours.open}–${dayHours.close}`;
            
            hoursHTML += `
                <div class="hours-row ${isCurrent ? 'current-day' : ''}">
                    <span class="day-name">${dayName}</span>
                    <span class="hours-time ${dayHours.closed ? 'closed' : ''}">${timeText}</span>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="business-hours-widget">
                <div class="widget-header">
                    <h2 class="business-name">${config.businessName || 'Business Hours'}</h2>
                    <div class="status-badge ${isOpen ? '' : 'closed'}">
                        ${isOpen ? '●' : '●'} ${isOpen ? (config.labels?.open || 'Open now') : (config.labels?.closed || 'Closed')}
                        ${config.icon ? ` ${config.icon}` : ' ☕'}
                    </div>
                </div>
                
                <div class="hours-table">
                    ${hoursHTML}
                </div>
                
                ${isOpen && closingTime ? `
                    <div class="closing-info">
                        ${config.labels?.closesAt || 'Closes at'} ${closingTime}
                    </div>
                ` : ''}
                
                ${config.timezone ? `
                    <div class="timezone-info">
                        ${config.labels?.timezone || 'Time zone'}: ${config.timezone}
                    </div>
                ` : ''}
            </div>
        `;
    }

    function parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    function showError(container, clientId, message) {
        container.innerHTML = `
            <div class="business-hours-widget error">
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
