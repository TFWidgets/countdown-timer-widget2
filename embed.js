/*!
 * TF Widgets — Countdown Timer v2
 * Встраивание: <script src=".../embed.js" data-id="CLIENT_ID"></script>
 * Конфиг клиента: configs/CLIENT_ID.json (формат v1 полностью поддерживается, все новые поля необязательные)
 * Классы и CSS-переменные: префикс bhw- (общий для всех виджетов TF Widgets)
 */
(function () {
    'use strict';

    var VERSION = '2.0.0';
    var LOG = '[TFW Countdown]';
    // Где работает живое превью BHWCountdown.render() (конфигуратор на сайте). Сюда же можно добавить свой xxx.myshopify.com
    var PREVIEW_DOMAINS = ['tf-widgets.com', '*.tf-widgets.com', '9ac5za-h1.myshopify.com'];

    /* =========================================================
       БАЗОВЫЕ СТИЛИ (один раз на страницу)
       Все значения берутся из CSS-переменных --bhw-*,
       которые задаются конфигом клиента в generateUniqueStyles()
       ========================================================= */
    var inlineCSS = `
        .bhw-container {
            font-family: var(--bhw-font, 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif);
            font-size: var(--bhw-base-size, 16px);
            line-height: 1.25;
            max-width: var(--bhw-max-width, 400px);
            margin: var(--bhw-margin, 20px auto);
            width: 100%;
            box-sizing: border-box;
            text-align: center;
            -webkit-font-smoothing: antialiased;
            container: bhw / inline-size;
        }
        .bhw-container *, .bhw-container *::before, .bhw-container *::after { box-sizing: border-box; }
        .bhw-widget {
            position: relative;
            overflow: hidden;
            isolation: isolate;
            background: var(--bhw-bg, linear-gradient(145deg, #17191e 0%, #0c0d10 100%));
            border: 1px solid var(--bhw-widget-border, rgba(255,255,255,0.08));
            border-radius: var(--bhw-widget-radius, 20px);
            padding: var(--bhw-padding, 26px);
            color: var(--bhw-text-color, #ffffff);
            box-shadow: var(--bhw-shadow, 0 20px 50px -12px rgba(0,0,0,0.45));
            transition: transform .45s cubic-bezier(.2,.8,.2,1), box-shadow .45s cubic-bezier(.2,.8,.2,1);
        }
        .bhw-widget::before {
            content: '';
            position: absolute;
            inset: 0;
            z-index: -1;
            pointer-events: none;
            background: var(--bhw-overlay,
                radial-gradient(120% 80% at 50% -20%, rgba(255,255,255,0.10) 0%, transparent 60%),
                radial-gradient(60% 60% at 100% 100%, color-mix(in srgb, var(--bhw-accent, #ff6b3d) 18%, transparent) 0%, transparent 70%));
        }
        .bhw-widget:hover {
            transform: translateY(-2px);
            box-shadow: var(--bhw-shadow-hover, 0 28px 70px -14px rgba(0,0,0,0.55));
        }

        /* заголовок */
        .bhw-head { margin: 0 0 var(--bhw-head-gap, 18px); }
        .bhw-badge {
            display: inline-flex; align-items: center; gap: 7px;
            margin: 0 0 12px; padding: 5px 11px;
            border-radius: 999px;
            font-size: .72em; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
            color: var(--bhw-accent, #ff6b3d);
            background: color-mix(in srgb, var(--bhw-accent, #ff6b3d) 14%, transparent);
        }
        .bhw-badge::before {
            content: ''; width: 6px; height: 6px; border-radius: 50%;
            background: currentColor;
            animation: bhw-pulse 1.6s ease-in-out infinite;
        }
        .bhw-title {
            margin: 0; padding: 0;
            font-family: inherit;
            font-size: var(--bhw-title-size, 1.2em);
            font-weight: 700;
            letter-spacing: -.02em;
            line-height: 1.25;
            color: var(--bhw-title-color, inherit);
        }
        .bhw-subtitle {
            margin: 6px 0 0; padding: 0;
            font-size: .88em;
            line-height: 1.5;
            opacity: .7;
        }

        /* таймер */
        .bhw-countdown {
            display: grid;
            grid-template-columns: repeat(var(--bhw-cols, 4), minmax(0, 1fr));
            gap: var(--bhw-gap, 10px);
            margin: var(--bhw-countdown-margin, 0);
            position: relative;
        }
        .bhw-time-block {
            position: relative;
            background: var(--bhw-block-bg, rgba(255,255,255,0.05));
            border: var(--bhw-block-border, 1px solid rgba(255,255,255,0.09));
            border-radius: var(--bhw-block-radius, 14px);
            padding: var(--bhw-block-padding, 16px 6px);
            -webkit-backdrop-filter: blur(12px);
            backdrop-filter: blur(12px);
            transition: background .3s, border-color .3s, transform .3s cubic-bezier(.2,.8,.2,1);
        }
        .bhw-time-block:hover {
            background: var(--bhw-block-bg-hover, rgba(255,255,255,0.08));
            border-color: var(--bhw-block-border-hover, rgba(255,255,255,0.18));
            transform: translateY(-2px);
        }
        .bhw-sep .bhw-time-block:not(:last-child)::after {
            content: ':';
            position: absolute;
            top: 50%;
            right: calc(var(--bhw-gap, 10px) / -2);
            transform: translate(50%, -62%);
            font-size: var(--bhw-value-size, 2em);
            font-weight: 700;
            line-height: 1;
            opacity: .28;
            pointer-events: none;
        }
        .bhw-time-value {
            display: flex;
            justify-content: center;
            overflow: hidden;
            height: 1.08em;
            margin-bottom: 8px;
            font-size: var(--bhw-value-size, 2em);
            font-weight: var(--bhw-value-weight, 700);
            font-family: var(--bhw-value-font, inherit);
            font-variant-numeric: tabular-nums;
            letter-spacing: var(--bhw-value-spacing, -0.02em);
            line-height: 1.08;
            text-shadow: var(--bhw-text-shadow, none);
            color: var(--bhw-value-color, inherit);
        }
        .bhw-digit { display: inline-block; min-width: .6em; }
        .bhw-digit.bhw-roll { animation: bhw-roll .5s cubic-bezier(.2,.8,.2,1); }
        .bhw-time-label {
            font-size: var(--bhw-label-size, .68em);
            font-weight: var(--bhw-label-weight, 600);
            opacity: var(--bhw-label-opacity, .6);
            text-transform: uppercase;
            letter-spacing: var(--bhw-label-spacing, .08em);
            white-space: nowrap;
            color: var(--bhw-label-color, inherit);
        }
        .bhw-urgent .bhw-time-value { color: var(--bhw-accent, #ff6b3d); }

        /* полоса прогресса */
        .bhw-progress {
            height: 6px; margin: 18px 0 0;
            border-radius: 999px;
            background: var(--bhw-progress-track, rgba(255,255,255,0.1));
            overflow: hidden;
        }
        .bhw-progress-bar {
            height: 100%; width: 100%;
            border-radius: inherit;
            background: var(--bhw-accent, #ff6b3d);
            box-shadow: 0 0 12px var(--bhw-accent, #ff6b3d);
            transition: width 1s linear;
        }

        /* кнопка */
        .bhw-button {
            display: flex; align-items: center; justify-content: center; gap: 8px;
            width: 100%;
            margin: 18px 0 0;
            padding: 14px 20px;
            border: 0;
            border-radius: var(--bhw-button-radius, 999px);
            background: var(--bhw-button-bg, var(--bhw-accent, #ff6b3d));
            color: var(--bhw-button-text, #ffffff) !important;
            font: inherit; font-size: .95em; font-weight: 700;
            text-decoration: none !important;
            cursor: pointer;
            box-shadow: 0 12px 26px -10px var(--bhw-button-bg, var(--bhw-accent, #ff6b3d));
            transition: transform .2s, filter .2s, box-shadow .2s;
        }
        .bhw-button:hover { transform: translateY(-1px); filter: brightness(1.07); }
        .bhw-button:focus-visible { outline: 2px solid var(--bhw-accent, #ff6b3d); outline-offset: 3px; }
        .bhw-button svg { width: 16px; height: 16px; transition: transform .25s; }
        .bhw-button:hover svg { transform: translateX(3px); }

        /* после окончания */
        .bhw-expired {
            padding: 14px 8px;
            font-size: 1.05em; font-weight: 700;
        }

        /* кнопка закрытия (для полосы) */
        .bhw-close {
            position: absolute; top: 50%; right: 12px;
            width: 28px; height: 28px;
            display: grid; place-items: center;
            padding: 0; border: 0; border-radius: 50%;
            background: rgba(255,255,255,0.08);
            color: inherit; font: inherit; font-size: 16px; line-height: 1;
            cursor: pointer; opacity: .7;
            transform: translateY(-50%);
            transition: opacity .2s, background .2s;
        }
        .bhw-close:hover { opacity: 1; background: rgba(255,255,255,0.16); }

        /* ---------- вариант "полоса" (объявление на всю ширину) ---------- */
        .bhw-layout-bar { max-width: none; margin: 0; }
        .bhw-layout-bar .bhw-widget {
            display: flex; align-items: center; justify-content: center; flex-wrap: wrap;
            gap: 10px 22px;
            padding: 10px 52px 10px 20px;
            border-radius: var(--bhw-widget-radius, 0);
            border-width: 0 0 1px;
            text-align: left;
        }
        .bhw-layout-bar .bhw-widget:hover { transform: none; }
        .bhw-layout-bar .bhw-head { margin: 0; }
        .bhw-layout-bar .bhw-badge { display: none; }
        .bhw-layout-bar .bhw-title { font-size: 1em; }
        .bhw-layout-bar .bhw-subtitle { margin: 2px 0 0; font-size: .8em; }
        .bhw-layout-bar .bhw-countdown { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; }
        .bhw-layout-bar .bhw-time-block {
            display: flex; align-items: baseline; gap: 3px;
            padding: 6px 9px; border-radius: 9px;
        }
        .bhw-layout-bar .bhw-time-block:hover { transform: none; }
        .bhw-layout-bar .bhw-time-value { margin: 0; font-size: 1.15em; }
        .bhw-layout-bar .bhw-time-label { font-size: .62em; letter-spacing: .04em; }
        .bhw-layout-bar.bhw-sep .bhw-time-block:not(:last-child)::after { display: none; }
        .bhw-layout-bar .bhw-progress { display: none; }
        .bhw-layout-bar .bhw-button { width: auto; margin: 0; padding: 9px 16px; font-size: .88em; }
        .bhw-layout-bar .bhw-expired { padding: 4px 0; }
        .bhw-pos-top, .bhw-pos-bottom { position: fixed; left: 0; right: 0; z-index: 2147483000; }
        .bhw-pos-top { top: 0; }
        .bhw-pos-bottom { bottom: 0; }
        .bhw-pos-bottom .bhw-widget { border-width: 1px 0 0; }
        .bhw-pos-top .bhw-widget { animation: bhw-drop .5s cubic-bezier(.2,.8,.2,1); }
        .bhw-pos-bottom .bhw-widget { animation: bhw-rise .5s cubic-bezier(.2,.8,.2,1); }

        /* загрузка */
        .bhw-loading { padding: 24px; text-align: center; opacity: .8; }
        .bhw-spinner {
            width: 28px; height: 28px; margin: 0 auto 12px;
            border: 3px solid rgba(255,255,255,0.2);
            border-top-color: currentColor;
            border-radius: 50%;
            animation: bhw-spin 1s linear infinite;
        }
        .bhw-sr {
            position: absolute !important; width: 1px; height: 1px;
            overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap;
        }

        /* защита от тем сайта, которые красят весь текст через color: ... !important */
        .bhw-container .bhw-widget { color: var(--bhw-text-color, #ffffff) !important; }
        .bhw-container .bhw-widget *:not(.bhw-button) { color: inherit !important; }
        .bhw-container .bhw-widget .bhw-badge { color: var(--bhw-accent, #ff6b3d) !important; }
        .bhw-container .bhw-widget .bhw-title { color: var(--bhw-title-color, inherit) !important; }
        .bhw-container .bhw-widget .bhw-time-value { color: var(--bhw-value-color, inherit) !important; }
        .bhw-container .bhw-widget .bhw-time-label { color: var(--bhw-label-color, inherit) !important; }
        .bhw-container.bhw-urgent .bhw-widget .bhw-time-value { color: var(--bhw-accent, #ff6b3d) !important; }
        .bhw-container .bhw-widget .bhw-button, .bhw-container .bhw-widget .bhw-button * { color: var(--bhw-button-text, #ffffff) !important; }

        @keyframes bhw-spin { to { transform: rotate(360deg); } }
        @keyframes bhw-roll { from { transform: translateY(-60%); opacity: 0; filter: blur(2px); } to { transform: none; opacity: 1; filter: none; } }
        @keyframes bhw-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
        @keyframes bhw-drop { from { transform: translateY(-100%); } to { transform: none; } }
        @keyframes bhw-rise { from { transform: translateY(100%); } to { transform: none; } }

        @media (max-width: 480px) {
            .bhw-container { max-width: calc(100vw - 32px); margin: var(--bhw-margin-mobile, 16px auto); }
            .bhw-layout-bar { max-width: none; margin: 0; }
        }
        /* компактный вид зависит от ширины самого виджета (узкая колонка, сайдбар, телефон) */
        @container bhw (max-width: 440px) {
            .bhw-widget { padding: var(--bhw-padding-mobile, 20px); }
            .bhw-countdown { gap: var(--bhw-gap-mobile, 8px); }
            .bhw-time-block { padding: 12px 4px; }
            .bhw-time-value { font-size: var(--bhw-value-size-mobile, 1.6em); }
            .bhw-time-label { font-size: var(--bhw-label-size-mobile, .6em); letter-spacing: .04em; }
            .bhw-layout-bar .bhw-widget { justify-content: center; text-align: center; padding: 10px 44px 10px 14px; }
            .bhw-layout-bar .bhw-time-value { font-size: 1.1em; }
            /* на телефоне полоса компактная: 05:42:54 без подписей */
            .bhw-layout-bar .bhw-countdown { gap: 10px; }
            .bhw-layout-bar .bhw-time-block { padding: 5px 7px; }
            .bhw-layout-bar .bhw-time-label { display: none; }
            .bhw-layout-bar.bhw-sep .bhw-time-block:not(:last-child)::after { display: block; font-size: 1.1em; right: -5px; }
        }
        @container bhw (max-width: 300px) {
            .bhw-countdown { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .bhw-sep .bhw-time-block::after { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
            .bhw-container *, .bhw-container *::before, .bhw-container *::after { animation: none !important; transition: none !important; }
        }
    `;

    /* =========================================================
       ПУБЛИЧНЫЙ API (для конфигуратора и превью на сайте):
       window.BHWCountdown.render(elementContainer, config) -> { destroy() }
       ========================================================= */
    var api = window.BHWCountdown = window.BHWCountdown || {};
    api.version = VERSION;
    api.defaults = getDefaultConfig;
    api.checkAccess = bhwCheckAccess;
    api.render = function (container, config) {
        // Живое превью (конфигуратор) разрешено только на сайте TF Widgets, localhost и из файла
        if (!bhwCheckAccess({ domains: PREVIEW_DOMAINS }).ok) {
            console.warn(LOG, 'preview is only available on tf-widgets.com');
            return { destroy: function () {}, update: function () {} };
        }
        injectBaseStyles();
        var finalConfig = mergeDeep(getDefaultConfig(), config || {});
        if (!container.__bhwClass) {
            container.__bhwClass = 'bhw-countdown-preview-' + Math.random().toString(36).slice(2, 8);
        }
        if (container._bhwDestroy) container._bhwDestroy();
        container.className = 'bhw-container ' + container.__bhwClass;
        applyCustomStyles(container.__bhwClass, finalConfig.style);
        return createCountdownWidget(container, finalConfig, true);
    };

    /* =========================================================
       АВТОЗАПУСК ПО <script data-id="...">
       ========================================================= */
    try {
        var currentScript = document.currentScript || (function () {
            var scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();

        if (currentScript && currentScript.dataset && currentScript.dataset.id) {
            var debug = currentScript.dataset.debug === '1';
            var clientId = normalizeId(currentScript.dataset.id);

            // Защита от повторного выполнения
            if (currentScript.dataset.bhwMounted !== '1') {
                currentScript.dataset.bhwMounted = '1';
                injectBaseStyles();

                var baseUrl = getBasePath(currentScript.src);
                var uniqueClass = 'bhw-countdown-' + clientId.replace(/[^a-z0-9_-]/gi, '') + '-' + Date.now();
                var container = createContainer(currentScript, clientId, uniqueClass);
                showLoading(container);

                loadConfig(clientId, baseUrl)
                    .then(function (fetchedConfig) {
                        // Доступ: виджет работает только на доменах из конфига клиента
                        var access = bhwCheckAccess(fetchedConfig);
                        if (!access.ok) {
                            console.warn(LOG, 'widget "' + clientId + '" is not active on ' + (location.hostname || 'this page') + ': ' + access.reason);
                            container.remove();
                            return;
                        }
                        var finalConfig = mergeDeep(getDefaultConfig(), fetchedConfig);
                        if (debug) console.log(LOG, 'config "' + clientId + '":', finalConfig);
                        applyCustomStyles(uniqueClass, finalConfig.style);
                        createCountdownWidget(container, finalConfig, false);
                    })
                    .catch(function (error) {
                        // Нет конфига = нет виджета (раньше показывался таймер по умолчанию на любой data-id)
                        console.warn(LOG, 'config "' + clientId + '" not loaded:', error.message);
                        container.remove();
                    });
            }
        }
    } catch (error) {
        console.error(LOG, 'critical error:', error);
    }

    /* =========================================================
       ФУНКЦИИ
       ========================================================= */

    /* ---------------------------------------------------------
       ДОСТУП (общий блок для всех виджетов TF Widgets — копировать без изменений)
       В конфиге клиента:
         "active": true,                       // false = виджет выключен (например, подписка отменена)
         "domains": ["client.com", "client-shop.myshopify.com", "*.client.com"]
       "client.com" разрешает client.com и www.client.com,
       "*.client.com" — любые поддомены (shop.client.com и т.д.).
       Без списка domains виджет не запускается.
       На localhost и при открытии файла с компьютера работает всегда (для тестов).
       --------------------------------------------------------- */
    function bhwCheckAccess(config) {
        config = config || {};
        if (config.active === false) return { ok: false, reason: 'widget is switched off ("active": false)' };
        var host = String(location.hostname || '').toLowerCase().replace(/^www\./, '');
        if (!host || host === 'localhost' || host === '127.0.0.1' || location.protocol === 'file:') return { ok: true };
        var list = config.domains;
        if (typeof list === 'string') list = list.split(/[\s,]+/);
        if (!Array.isArray(list) || !list.length) return { ok: false, reason: 'no "domains" in config' };
        for (var i = 0; i < list.length; i++) {
            var d = String(list[i] || '').trim().toLowerCase()
                .replace(/^[a-z]+:\/\//, '').replace(/[\/:].*$/, '').replace(/^www\./, '');
            if (!d) continue;
            if (d.indexOf('*.') === 0) {
                var base = d.slice(2);
                if (host === base || host.slice(-(base.length + 1)) === '.' + base) return { ok: true };
            } else if (host === d) {
                return { ok: true };
            }
        }
        return { ok: false, reason: 'domain is not in "domains"' };
    }
    function injectBaseStyles() {
        if (!document.querySelector('#business-hours-countdown-widget-styles')) {
            var style = document.createElement('style');
            style.id = 'business-hours-countdown-widget-styles';
            style.textContent = inlineCSS;
            document.head.appendChild(style);
        }
    }

    function normalizeId(id) {
        return String(id || 'demo').replace(/\.(json|js)$/i, '');
    }

    function getBasePath(src) {
        if (!src) return './';
        try {
            var url = new URL(src, location.href);
            return url.origin + url.pathname.replace(/\/[^\/]*$/, '/');
        } catch (error) {
            return './';
        }
    }

    function createContainer(scriptElement, clientId, uniqueClass) {
        var container = document.createElement('div');
        container.id = 'business-hours-countdown-widget-' + clientId;
        container.className = 'bhw-container ' + uniqueClass;
        scriptElement.parentNode.insertBefore(container, scriptElement.nextSibling);
        return container;
    }

    function showLoading(container) {
        container.innerHTML =
            '<div class="bhw-widget"><div class="bhw-loading"><div class="bhw-spinner"></div><div>Loading countdown...</div></div></div>';
    }

    function getDefaultConfig() {
        return {
            // Режим: "date" — до конкретной даты; "daily" — каждый день до времени dailyTime (например, "закажи до 14:00")
            mode: 'date',
            endDate: '2026-12-31T23:59:59',
            dailyTime: '18:00',
            // IANA-зона, например "Europe/Prague". Если пусто — время из endDate без зоны считается по времени посетителя
            timezone: '',
            // Дата начала акции (необязательно): включает полосу прогресса
            startDate: '',
            // "card" — карточка, "bar" — полоса-объявление на всю ширину
            layout: 'card',
            // для bar: "inline" — где стоит скрипт, "top"/"bottom" — прилипает к краю экрана
            position: 'inline',
            closable: false,
            badge: '',
            title: '',
            subtitle: '',
            button: { text: '', url: '', newTab: false },
            expired: { text: '', hide: false },
            hideZeroDays: false,
            labels: {
                days: 'DAYS',
                hours: 'HOURS',
                minutes: 'MINUTES',
                seconds: 'SECONDS'
            },
            style: {
                fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
                valueFontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
                separators: true,
                // за сколько минут до конца цифры подсвечиваются акцентным цветом (0 = выключено)
                urgentMinutes: 0,
                colors: {
                    background: 'linear-gradient(145deg, #17191e 0%, #0c0d10 100%)',
                    text: '#ffffff',
                    accent: '#ff6b3d',
                    blockBackground: 'rgba(255, 255, 255, 0.05)',
                    blockBorder: 'rgba(255, 255, 255, 0.09)',
                    blockHover: 'rgba(255, 255, 255, 0.08)',
                    borderHover: 'rgba(255, 255, 255, 0.18)',
                    widgetBorder: 'rgba(255, 255, 255, 0.08)',
                    buttonBackground: '',
                    buttonText: '#ffffff'
                },
                borderRadius: { widget: 20, blocks: 14 },
                sizes: { fontSize: 1, padding: 26, blockPadding: 16, gap: 10 },
                shadow: {
                    widget: '0 20px 50px -12px rgba(0,0,0,0.45)',
                    widgetHover: '0 28px 70px -14px rgba(0,0,0,0.55)',
                    text: 'none'
                }
            }
        };
    }

    function isPlainObject(v) {
        return v && typeof v === 'object' && !Array.isArray(v);
    }

    // Глубокое слияние: всё, что не указано в конфиге клиента, берётся из значений по умолчанию
    function mergeDeep(base, override) {
        var result = {};
        var key;
        for (key in base) if (Object.prototype.hasOwnProperty.call(base, key)) result[key] = base[key];
        if (!isPlainObject(override)) return result;
        for (key in override) {
            if (!Object.prototype.hasOwnProperty.call(override, key)) continue;
            var o = override[key];
            if (o === undefined || o === null) continue;
            result[key] = isPlainObject(o) && isPlainObject(base[key]) ? mergeDeep(base[key], o) : o;
        }
        return result;
    }

    function loadConfig(clientId, baseUrl) {
        // Локальный конфиг для разработки
        if (clientId === 'local') {
            return new Promise(function (resolve, reject) {
                var localScript = document.querySelector('#bhw-countdown-local-config');
                if (!localScript) return reject(new Error('local config not found (#bhw-countdown-local-config)'));
                try { resolve(JSON.parse(localScript.textContent)); }
                catch (err) { reject(new Error('local JSON parse error: ' + err.message)); }
            });
        }

        var configUrl = baseUrl + 'configs/' + encodeURIComponent(clientId) + '.json?v=' + Date.now();
        return fetch(configUrl, { cache: 'no-store', headers: { 'Accept': 'application/json' } })
            .then(function (response) {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.json();
            });
    }

    function applyCustomStyles(uniqueClass, style) {
        var styleId = 'bhw-countdown-style-' + uniqueClass;
        var styleElement = document.getElementById(styleId);
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }
        styleElement.textContent = generateUniqueStyles(uniqueClass, style);
    }

    // Защита от "поломки" CSS через значения из конфига
    function cssValue(v, fallback) {
        if (v === undefined || v === null || v === '') return fallback;
        return String(v).replace(/[;{}<>]/g, '');
    }

    function num(v, fallback) {
        var n = Number(v);
        return isFinite(n) && v !== '' && v !== null ? n : fallback;
    }

    function generateUniqueStyles(uniqueClass, style) {
        var s = style || {};
        var colors = s.colors || {};
        var sizes = s.sizes || {};
        var borderRadius = s.borderRadius || {};
        var shadow = s.shadow || {};
        var fs = num(sizes.fontSize, 1);
        var pad = num(sizes.padding, 26);
        var gap = num(sizes.gap, 10);
        var bpad = num(sizes.blockPadding, 16);
        var accent = cssValue(colors.accent, '#ff6b3d');

        return '.' + uniqueClass + ' {' +
            '--bhw-font:' + cssValue(s.fontFamily, "'Inter', system-ui, sans-serif") + ';' +
            '--bhw-value-font:' + cssValue(s.valueFontFamily, 'inherit') + ';' +
            '--bhw-max-width:' + Math.round(400 * fs) + 'px;' +
            '--bhw-bg:' + cssValue(colors.background, 'linear-gradient(145deg, #17191e 0%, #0c0d10 100%)') + ';' +
            '--bhw-widget-border:' + cssValue(colors.widgetBorder, 'rgba(255,255,255,0.08)') + ';' +
            '--bhw-widget-radius:' + num(borderRadius.widget, 20) + 'px;' +
            '--bhw-padding:' + pad + 'px;' +
            '--bhw-padding-mobile:' + Math.round(pad * 0.8) + 'px;' +
            '--bhw-text-color:' + cssValue(colors.text, '#ffffff') + ';' +
            '--bhw-title-color:' + cssValue(colors.title, 'inherit') + ';' +
            '--bhw-accent:' + accent + ';' +
            '--bhw-button-bg:' + cssValue(colors.buttonBackground, accent) + ';' +
            '--bhw-button-text:' + cssValue(colors.buttonText, '#ffffff') + ';' +
            '--bhw-shadow:' + cssValue(shadow.widget, '0 20px 50px -12px rgba(0,0,0,0.45)') + ';' +
            '--bhw-shadow-hover:' + cssValue(shadow.widgetHover, '0 28px 70px -14px rgba(0,0,0,0.55)') + ';' +
            '--bhw-gap:' + gap + 'px;' +
            '--bhw-gap-mobile:' + Math.round(gap * 0.8) + 'px;' +
            '--bhw-countdown-margin:0;' +
            '--bhw-block-bg:' + cssValue(colors.blockBackground, 'rgba(255,255,255,0.05)') + ';' +
            '--bhw-block-border:1px solid ' + cssValue(colors.blockBorder, 'rgba(255,255,255,0.09)') + ';' +
            '--bhw-block-radius:' + num(borderRadius.blocks, 14) + 'px;' +
            '--bhw-block-padding:' + bpad + 'px ' + Math.round(bpad * 0.4) + 'px;' +
            '--bhw-block-bg-hover:' + cssValue(colors.blockHover, 'rgba(255,255,255,0.08)') + ';' +
            '--bhw-block-border-hover:' + cssValue(colors.borderHover, 'rgba(255,255,255,0.18)') + ';' +
            '--bhw-progress-track:' + cssValue(colors.progressTrack, 'rgba(127,127,127,0.18)') + ';' +
            '--bhw-value-size:' + (2 * fs) + 'em;' +
            '--bhw-value-size-mobile:' + (1.6 * fs) + 'em;' +
            '--bhw-label-size:' + (0.68 * fs) + 'em;' +
            '--bhw-label-size-mobile:' + (0.6 * fs) + 'em;' +
            '--bhw-title-size:' + (1.2 * fs) + 'em;' +
            '--bhw-text-shadow:' + cssValue(shadow.text, 'none') + ';' +
            '}';
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function safeUrl(url) {
        var u = String(url || '').trim();
        if (!u) return '';
        if (/^(https?:|mailto:|tel:)/i.test(u) || /^\/(?!\/)/.test(u) || /^#/.test(u)) return u;
        if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(u)) return 'https://' + u;
        return '';
    }

    /* ---------- время и часовые пояса ---------- */
    function tzOffsetMs(date, tz) {
        try {
            var dtf = new Intl.DateTimeFormat('en-US', {
                timeZone: tz, hourCycle: 'h23',
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
            var p = {};
            dtf.formatToParts(date).forEach(function (x) { p[x.type] = x.value; });
            var asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, (+p.hour) % 24, +p.minute, +p.second);
            return asUTC - Math.floor(date.getTime() / 1000) * 1000;
        } catch (e) {
            return -date.getTimezoneOffset() * 60000;
        }
    }

    // "Настенное" время в зоне tz -> timestamp
    function zonedToTs(y, mo, d, h, mi, s, tz) {
        var guess = Date.UTC(y, mo, d, h, mi, s);
        var off = tzOffsetMs(new Date(guess), tz);
        var ts = guess - off;
        var off2 = tzOffsetMs(new Date(ts), tz); // поправка на переход летнего/зимнего времени
        return off2 === off ? ts : guess - off2;
    }

    function parseEnd(endDate, tz) {
        var str = String(endDate || '').trim();
        var hasZone = /(z|[+-]\d{2}:?\d{2})$/i.test(str);
        var m = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
        if (tz && !hasZone && m) {
            return zonedToTs(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0), tz);
        }
        var t = new Date(str).getTime();
        return isNaN(t) ? Date.now() : t;
    }

    // Ежедневный дедлайн: ближайшее наступление dailyTime в зоне tz (или по времени посетителя)
    function nextDaily(dailyTime, tz) {
        var hm = String(dailyTime || '18:00').split(':');
        var H = +hm[0] || 0, M = +hm[1] || 0;
        var now = Date.now();
        if (tz) {
            var off = tzOffsetMs(new Date(now), tz);
            var local = new Date(now + off);
            var y = local.getUTCFullYear(), mo = local.getUTCMonth(), d = local.getUTCDate();
            var target = zonedToTs(y, mo, d, H, M, 0, tz);
            if (target <= now) target = zonedToTs(y, mo, d + 1, H, M, 0, tz);
            return target;
        }
        var t = new Date(); t.setHours(H, M, 0, 0);
        if (t.getTime() <= now) t.setDate(t.getDate() + 1);
        return t.getTime();
    }

    /* ---------- разметка ---------- */
    var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

    function buildHtml(config) {
        var labels = config.labels || {};
        var units = ['days', 'hours', 'minutes', 'seconds'];
        var blocks = units.map(function (u) {
            return '<div class="bhw-time-block" data-block="' + u + '">' +
                '<div class="bhw-time-value" data-unit="' + u + '" aria-hidden="true"><span class="bhw-digit">0</span><span class="bhw-digit">0</span></div>' +
                '<div class="bhw-time-label">' + escapeHtml(labels[u]) + '</div>' +
                '</div>';
        }).join('');

        var head = '';
        if (config.badge || config.title || config.subtitle) {
            head = '<div class="bhw-head">' +
                (config.badge ? '<div class="bhw-badge">' + escapeHtml(config.badge) + '</div>' : '') +
                (config.title ? '<div class="bhw-title">' + escapeHtml(config.title) + '</div>' : '') +
                (config.subtitle ? '<div class="bhw-subtitle">' + escapeHtml(config.subtitle) + '</div>' : '') +
                '</div>';
        }

        var btn = config.button || {};
        var href = safeUrl(btn.url);
        var button = (btn.text && href)
            ? '<a class="bhw-button" href="' + escapeHtml(href) + '"' + (btn.newTab ? ' target="_blank" rel="noopener"' : '') + '>' + escapeHtml(btn.text) + ARROW + '</a>'
            : '';

        var progress = config.startDate ? '<div class="bhw-progress" aria-hidden="true"><div class="bhw-progress-bar"></div></div>' : '';
        var close = config.closable ? '<button type="button" class="bhw-close" aria-label="Close">&times;</button>' : '';

        return '<div class="bhw-widget" role="timer">' + close + head +
            '<div class="bhw-countdown">' + blocks + '</div>' +
            '<span class="bhw-sr" data-sr></span>' +
            progress + button +
            '</div>';
    }

    function setDigits(el, value, animate) {
        var str = String(value).padStart(2, '0');
        var spans = el.querySelectorAll('.bhw-digit');
        // если цифр стало больше (например, 100+ дней) — пересобираем
        if (spans.length !== str.length) {
            el.innerHTML = str.split('').map(function (c) { return '<span class="bhw-digit">' + c + '</span>'; }).join('');
            return;
        }
        for (var i = 0; i < str.length; i++) {
            if (spans[i].textContent !== str[i]) {
                spans[i].textContent = str[i];
                if (animate) {
                    spans[i].classList.remove('bhw-roll');
                    void spans[i].offsetWidth; // перезапуск анимации
                    spans[i].classList.add('bhw-roll');
                }
            }
        }
    }

    function createCountdownWidget(container, config, isPreview) {
        // полоса, закрытая посетителем в этой сессии, не показывается снова
        var dismissKey = 'bhw-dismiss-' + (container.id || 'preview');
        if (!isPreview && config.closable) {
            try { if (sessionStorage.getItem(dismissKey) === '1') { container.style.display = 'none'; return { destroy: function () {} }; } } catch (e) {}
        }

        var layout = config.layout === 'bar' ? 'bar' : 'card';
        var position = config.position === 'top' || config.position === 'bottom' ? config.position : 'inline';
        var cls = ' bhw-layout-' + layout + (config.style && config.style.separators === false ? '' : ' bhw-sep');
        if (layout === 'bar' && position !== 'inline' && !isPreview) cls += ' bhw-pos-' + position;
        container.className = container.className.replace(/\s*bhw-(layout|pos)-\w+|\s*bhw-sep|\s*bhw-urgent/g, '') + cls;
        container.style.display = '';

        container.innerHTML = buildHtml(config);

        var widget = container.querySelector('.bhw-widget');
        var srEl = container.querySelector('[data-sr]');
        var bar = container.querySelector('.bhw-progress-bar');
        var closeBtn = container.querySelector('.bhw-close');
        var tz = config.timezone || '';
        var isDaily = config.mode === 'daily';
        var endTime = isDaily ? nextDaily(config.dailyTime, tz) : parseEnd(config.endDate, tz);
        var startTime = config.startDate ? parseEnd(config.startDate, tz) : 0;
        var urgentMs = num(config.style && config.style.urgentMinutes, 0) * 60000;
        var lastSr = '';
        var timer = 0;
        var first = true;

        // отступ под прилипшую полосу, чтобы она не перекрывала шапку сайта
        var spacer = null;
        if (layout === 'bar' && position !== 'inline' && !isPreview) {
            spacer = document.createElement('div');
            spacer.className = 'bhw-bar-spacer';
            requestAnimationFrame(function () { spacer.style.height = widget.offsetHeight + 'px'; });
            if (position === 'top') document.body.insertBefore(spacer, document.body.firstChild);
            else document.body.appendChild(spacer);
        }

        if (closeBtn) closeBtn.addEventListener('click', function () {
            destroy();
            container.style.display = 'none';
            try { sessionStorage.setItem(dismissKey, '1'); } catch (e) {}
        });

        function onExpired() {
            var exp = config.expired || {};
            if (isDaily) { endTime = nextDaily(config.dailyTime, tz); return false; }
            clearInterval(timer);
            if (exp.hide && !isPreview) {
                container.style.display = 'none';
                if (spacer) spacer.remove();
                return true;
            }
            if (exp.text) {
                var cd = container.querySelector('.bhw-countdown');
                if (cd) cd.outerHTML = '<div class="bhw-expired">' + escapeHtml(exp.text) + '</div>';
                var pr = container.querySelector('.bhw-progress'); if (pr) pr.remove();
                return true;
            }
            ['days', 'hours', 'minutes', 'seconds'].forEach(function (u) {
                var el = container.querySelector('[data-unit="' + u + '"]');
                if (el) setDigits(el, 0, false);
            });
            return true;
        }

        function update() {
            var now = Date.now();
            var left = endTime - now;
            if (left <= 0 && onExpired()) return;
            left = Math.max(0, endTime - now);

            var days = Math.floor(left / 86400000);
            var hours = Math.floor((left % 86400000) / 3600000);
            var minutes = Math.floor((left % 3600000) / 60000);
            var seconds = Math.floor((left % 60000) / 1000);

            var dayBlock = container.querySelector('[data-block="days"]');
            if (dayBlock) {
                var hideDays = config.hideZeroDays && days === 0;
                dayBlock.style.display = hideDays ? 'none' : '';
                container.style.setProperty('--bhw-cols', hideDays ? 3 : 4);
            }

            var vals = { days: days, hours: hours, minutes: minutes, seconds: seconds };
            for (var u in vals) {
                var el = container.querySelector('[data-unit="' + u + '"]');
                if (el) setDigits(el, vals[u], !first);
            }
            first = false;

            container.classList.toggle('bhw-urgent', urgentMs > 0 && left < urgentMs);

            if (bar && startTime && endTime > startTime) {
                var pct = Math.max(0, Math.min(100, (left / (endTime - startTime)) * 100));
                bar.style.width = pct.toFixed(2) + '%';
            }

            // текст для скринридеров обновляем раз в минуту
            var sr = (days ? days + ' days ' : '') + hours + ' hours ' + minutes + ' minutes left';
            if (sr !== lastSr && srEl) { srEl.textContent = sr; lastSr = sr; }
        }

        function destroy() {
            clearInterval(timer);
            clearTimeout(timer);
            if (spacer) spacer.remove();
        }

        update();
        // синхронизируем тики с началом секунды, чтобы цифры менялись ровно
        timer = setTimeout(function () {
            update();
            timer = setInterval(update, 1000);
        }, 1000 - (Date.now() % 1000));
        container._countdownInterval = timer;
        container._bhwDestroy = destroy;

        return { destroy: destroy, update: update };
    }
})();
