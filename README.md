# 🕐 Countdown Timer Widget

A beautiful, self-contained countdown timer widget with glass morphism design and orange gradient styling.

## ✨ Features

- **Beautiful Design**: Orange gradient with glass morphism effects
- **Self-contained**: All CSS and JavaScript in one file
- **Responsive**: Works on desktop and mobile
- **Easy Integration**: Simple script tag implementation
- **Local Configuration**: Supports both remote and local configs
- **Real-time Updates**: Live countdown with smooth animations

## 🚀 Quick Start

### CDN Usage
```html
<!-- Default demo countdown -->
<script src="https://cdn.jsdelivr.net/gh/yourusername/countdown-timer-widget2@main/embed.js" data-id="demo"></script>

<!-- Custom configuration -->
<script src="https://cdn.jsdelivr.net/gh/yourusername/countdown-timer-widget2@main/embed.js" data-id="your-config"></script>
```

### Local Usage (Works when saved to PC)
```html
<!-- Local configuration -->
<script type="application/json" id="ctw-local-config">
{
    "endDate": "2024-12-25T00:00:00",
    "labels": {
        "days": "ДНИ",
        "hours": "ЧАСЫ", 
        "minutes": "МИНУТЫ",
        "seconds": "СЕКУНДЫ"
    }
}
</script>
<script src="./embed.js" data-id="local"></script>
```

## ⚙️ Configuration

Create a JSON file in the `configs/` directory:

```json
{
    "endDate": "2025-12-31T23:59:59",
    "labels": {
        "days": "DAYS",
        "hours": "HOURS",
        "minutes": "MINUTES", 
        "seconds": "SECONDS"
    }
}
```

### Configuration Options

- `endDate`: Target date/time in ISO format (required)
- `labels`: Custom text labels for time units (optional)

## 📁 Repository Structure

```
├── configs/          # Configuration files
│   └── demo.json    # Demo configuration
├── embed.js         # Main widget script
├── index.html       # Demo page
├── local-test.html  # Local configuration test
├── _headers         # Cloudflare headers
└── README.md        # This file
```

## 🎨 Design Features

- **Orange Gradient**: Beautiful #C44536 to #D07C47 gradient
- **Glass Morphism**: Translucent effects with backdrop blur
- **Smooth Animations**: Hover effects and transitions
- **Monospace Numbers**: Clear, readable countdown display
- **Responsive Grid**: 4-column on desktop, 2-column on mobile

## 🧪 Testing

Open `local-test.html` to see both local and remote configuration examples.

## 📱 Browser Support

- Chrome/Edge/Safari (modern versions)
- Firefox (modern versions)  
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔧 Development

The widget follows the same architecture pattern as the business-hours-widget for consistency and reliability.