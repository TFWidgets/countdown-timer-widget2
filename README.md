# 📞 Click to Call Widget

Виджет для вставки на любые сайты. Работает везде - Shopify, WordPress, обычный HTML.

## 🚀 Как использовать

### 1. Развернуть на Cloudflare Pages
1. Зайти на [dash.cloudflare.com/pages](https://dash.cloudflare.com/pages)
2. Create project → Connect to Git → GitHub
3. Выбрать этот репозиторий
4. Build settings: Framework = None, Build output = `/`
5. Deploy

### 2. Получить свой домен
После деплоя получите URL типа: `https://your-widget.pages.dev`

### 3. Код для клиентов
```html
<script src="https://your-widget.pages.dev/embed.js" data-id="demo"></script>
```

## 📋 Для новых клиентов

1. Создать файл `/configs/client-name.json`
2. Настроить параметры виджета
3. Дать клиенту код с `data-id="client-name"`

## Пример конфига:
```json
{
  "phone": "+1234567890",
  "displayPhone": "+1 (234) 567-890",
  "icon": "🛒",
  "title": "Contact Us",
  "subtitle": "We're here to help!",
  "actions": [
    {
      "type": "whatsapp", 
      "text": "WhatsApp",
      "icon": "💬",
      "message": "Hi! I need help"
    }
  ]
}
```

## ✅ Готово!
Виджет работает на любых сайтах без ограничений.