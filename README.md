# 🎨 WakeDock Frontend

> **SvelteKit Dashboard** - Modern TypeScript interface for Docker container management with real-time updates and responsive design.

## 📋 Overview

WakeDock Frontend is a cutting-edge SvelteKit application providing an intuitive web interface for Docker container management. Built with TypeScript, TailwindCSS, and modern web standards for optimal performance and user experience.

## 🏗️ Architecture

- **Framework**: SvelteKit 2.22+ with SSR/SPA hybrid
- **Language**: TypeScript 5.6+ with strict type checking
- **Styling**: TailwindCSS 3.4+ with custom design system
- **Icons**: Lucide Svelte for consistent iconography
- **State Management**: Svelte stores with reactive updates
- **API Client**: Fetch API with TypeScript interfaces
- **WebSocket**: Real-time updates for container events
- **Build Tool**: Vite 5.4+ with optimized bundling

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0+
- npm 8.0+
- Docker (for containerized deployment)

### Development Setup
```bash
# Clone the repository
git clone https://github.com/kihw/wakedock-frontend.git
cd wakedock-frontend

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Open browser at http://localhost:3000
```

### Docker Build
```bash
# Build the Docker image
docker build -t wakedock-frontend .

# Run the container
docker run -p 3000:3000 \
  -e WAKEDOCK_API_URL=http://backend:5000 \
  -e VITE_API_BASE_URL=/api/v1 \
  wakedock-frontend
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Start production server
npm start
```

## 🌐 Features

### 🎛️ Dashboard
- **Real-time Container Monitoring** with live status updates
- **Resource Usage Metrics** (CPU, Memory, Network)
- **Container Logs** with search and filtering
- **Service Management** (start, stop, restart, remove)
- **Docker Compose** orchestration support

### 🎨 User Interface
- **Responsive Design** optimized for desktop and mobile
- **Dark/Light Theme** with system preference detection
- **Accessibility** compliant (ARIA, keyboard navigation)
- **Modern Design System** with consistent components
- **Progressive Web App** capabilities

### 🔒 Security & Authentication
- **JWT Token Management** with automatic refresh
- **Role-based Access Control** for different user levels
- **Secure API Communication** with CORS protection
- **Session Management** with timeout handling

## 📁 Project Structure

```
wakedock-frontend/
├── src/                         # Source code
│   ├── lib/                     # Library components and utilities
│   │   ├── components/          # Reusable Svelte components
│   │   │   ├── ui/              # UI component library
│   │   │   │   ├── atoms/       # Basic UI elements
│   │   │   │   ├── molecules/   # Composite components
│   │   │   │   └── organisms/   # Complex feature components
│   │   │   ├── layout/          # Layout components
│   │   │   └── features/        # Feature-specific components
│   │   ├── stores/              # Svelte stores for state management
│   │   ├── utils/               # Utility functions
│   │   ├── types/               # TypeScript type definitions
│   │   └── api/                 # API client and services
│   ├── routes/                  # SvelteKit routes (pages)
│   │   ├── +layout.svelte       # Main layout
│   │   ├── +page.svelte         # Home page
│   │   ├── dashboard/           # Dashboard routes
│   │   ├── services/            # Service management routes
│   │   └── auth/                # Authentication routes
│   ├── app.html                 # HTML template
│   ├── app.css                  # Global styles
│   └── main.ts                  # Client entry point
├── static/                      # Static assets
│   ├── favicon.ico
│   ├── favicon.png
│   └── icons/
├── tests/                       # Test suites
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   └── e2e/                     # End-to-end tests
├── Dockerfile                   # Multi-stage container build
├── package.json                 # Dependencies and scripts
├── svelte.config.js             # SvelteKit configuration
├── vite.config.js               # Vite build configuration
├── tailwind.config.js           # TailwindCSS configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## ⚙️ Configuration

### Environment Variables
```bash
# API Configuration
WAKEDOCK_API_URL=http://backend:5000      # Backend API URL
VITE_API_BASE_URL=/api/v1                 # API base path
PUBLIC_WS_URL=/ws                         # WebSocket endpoint

# Application
NODE_ENV=production                       # Environment mode
PORT=3000                                 # Server port
HOST=0.0.0.0                             # Server host

# Features
VITE_ENABLE_WEBSOCKET=true               # Enable real-time updates
VITE_ENABLE_PWA=true                     # Enable PWA features
```

### Build Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [sveltekit()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000',
      '/ws': {
        target: 'ws://localhost:5000',
        ws: true
      }
    }
  }
});
```

## 🧪 Testing

### Unit Tests
```bash
# Run unit tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run E2E tests with Playwright
npm run test:e2e
```

### Code Quality
```bash
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run format
npm run format:check

# Full CI pipeline
npm run ci
```

## 🎨 Design System

### Components Library
```svelte
<!-- Button Component -->
<script lang="ts">
  import { Button } from '$lib/components/ui/atoms';
  
  export let variant: 'primary' | 'secondary' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
</script>

<Button {variant} {size} on:click>
  Click me
</Button>
```

### Color Palette
```css
/* Custom TailwindCSS colors */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
}
```

### Typography
- **Headings**: Inter font family with consistent spacing
- **Body Text**: Optimized for readability at all screen sizes
- **Code**: Monospace font for logs and technical content

## 🔄 API Integration

### Service Layer
```typescript
// API service example
import type { Container, ContainerStats } from '$lib/types';

class ContainerService {
  private baseURL = '/api/v1/containers';

  async getContainers(): Promise<Container[]> {
    const response = await fetch(this.baseURL);
    return response.json();
  }

  async getContainerStats(id: string): Promise<ContainerStats> {
    const response = await fetch(`${this.baseURL}/${id}/stats`);
    return response.json();
  }

  async startContainer(id: string): Promise<void> {
    await fetch(`${this.baseURL}/${id}/start`, {
      method: 'POST'
    });
  }
}
```

### WebSocket Integration
```typescript
// Real-time updates
import { writable } from 'svelte/store';

const containerEvents = writable<ContainerEvent[]>([]);

const ws = new WebSocket('/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  containerEvents.update(events => [...events, data]);
};
```

## 📱 Progressive Web App

### Features
- **Offline Support** with service worker caching
- **App Install** prompt for native-like experience
- **Push Notifications** for important container events
- **Background Sync** for actions when offline

### Manifest Configuration
```json
{
  "name": "WakeDock Dashboard",
  "short_name": "WakeDock",
  "description": "Docker Container Management Dashboard",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/",
  "icons": [...]
}
```

## 🚀 Performance Optimization

### Build Optimizations
- **Code Splitting** for optimal bundle sizes
- **Tree Shaking** to remove unused code
- **Asset Optimization** for images and static files
- **Gzip Compression** for reduced transfer sizes

### Runtime Performance
- **Virtual Scrolling** for large container lists
- **Lazy Loading** for route-based code splitting
- **Debounced Search** for responsive filtering
- **Caching Strategy** for API responses

## 🌐 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **ES2020+** features with automatic polyfills
- **Progressive Enhancement** for older browsers

## 🤝 Integration with WakeDock Platform

This frontend is designed to work seamlessly with the WakeDock ecosystem:

- **Main Repository**: [wakedock](https://github.com/kihw/wakedock)
- **Backend API**: [wakedock-backend](https://github.com/kihw/wakedock-backend)

### Docker Compose Integration
```yaml
services:
  wakedock-frontend:
    build:
      context: https://github.com/kihw/wakedock-frontend.git
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - WAKEDOCK_API_URL=http://wakedock-backend:5000
      - VITE_API_BASE_URL=/api/v1
```

## 🔧 Development Guidelines

### Code Style
- **TypeScript**: Strict mode with comprehensive type coverage
- **Prettier**: Consistent code formatting
- **ESLint**: Code quality and error prevention
- **Svelte**: Component composition and reactive patterns

### Component Development
```svelte
<script lang="ts">
  import type { Container } from '$lib/types';
  import { createEventDispatcher } from 'svelte';
  
  export let container: Container;
  
  const dispatch = createEventDispatcher<{
    start: { id: string };
    stop: { id: string };
  }>();
  
  $: statusColor = container.status === 'running' ? 'green' : 'red';
</script>

<div class="container-card bg-white dark:bg-gray-800 p-4 rounded-lg">
  <h3 class="text-lg font-semibold">{container.name}</h3>
  <span class="status text-{statusColor}-500">{container.status}</span>
  
  <div class="actions space-x-2 mt-4">
    <button 
      class="btn-primary" 
      on:click={() => dispatch('start', { id: container.id })}
    >
      Start
    </button>
    <button 
      class="btn-secondary" 
      on:click={() => dispatch('stop', { id: container.id })}
    >
      Stop
    </button>
  </div>
</div>
```

## 📚 Documentation

### Component Storybook
```bash
# Start Storybook for component development
npm run storybook

# Build Storybook for deployment
npm run build-storybook
```

### API Documentation
- **Backend API**: Auto-generated from FastAPI backend
- **Frontend Types**: Generated from API schemas
- **Component Library**: Documented with examples

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🐛 Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/kihw/wakedock-frontend/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/kihw/wakedock-frontend/discussions)
- **Documentation**: [WakeDock Docs](https://github.com/kihw/wakedock/docs)

---

**Built with ❤️ and modern web technologies**