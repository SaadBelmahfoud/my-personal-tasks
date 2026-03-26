# MyPersonalTasks Frontend

A modern, responsive web application for personal and collaborative task management, built with **Next.js 15**, **React 19**, and **TypeScript**.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Internationalization (i18n)](#internationalization-i18n)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

---

## ✨ Features

### Core Features
- 🔐 **Authentication** - JWT-based authentication with refresh tokens
- 📊 **Dashboard** - Overview of projects, tasks, and statistics
- 📁 **Project Management** - Create, update, delete, and share projects
- ✅ **Task Management** - Full CRUD operations with priorities, statuses, due dates
- 🌍 **Internationalization** - English and French support
- 🎨 **Theming** - Light and dark mode support
- 📱 **Responsive Design** - Mobile-first approach

### Technical Features
- ⚡ **Server Components** - Next.js App Router with server components
- 🔄 **Real-time Updates** - Ready for WebSocket integration
- 📦 **Type-safe** - Full TypeScript coverage
- 🎯 **Form Validation** - Client-side validation
- 🔔 **Notifications** - Toast notifications system
- 🧭 **Navigation** - Sidebar with responsive mobile menu

---

## 🔧 Technology Stack

### Core Framework
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 15.x | React framework with App Router |
| **React** | 19.x | UI library |
| **TypeScript** | 5.x | Type safety |

### State Management
| Library | Purpose |
|---------|---------|
| **Zustand** | Global state management |
| **TanStack Query** | Server state management |

### UI & Styling
| Library | Purpose |
|---------|---------|
| **Tailwind CSS** | Utility-first CSS |
| **Radix UI** | Accessible primitives |
| **Lucide React** | Icon library |
| **Class Variance Authority** | Component variants |

### Internationalization
| Library | Purpose |
|---------|---------|
| **next-intl** | i18n for Next.js |

### HTTP Client
| Library | Purpose |
|---------|---------|
| **Axios** | HTTP requests |

---

## 📁 Project Structure

```
Front/
├── package.json                    # Dependencies
├── next.config.ts                  # Next.js configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── postcss.config.js               # PostCSS configuration
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Dashboard page
│   │   ├── globals.css             # Global styles
│   │   ├── providers.tsx           # App providers
│   │   └── (auth)/                 # Auth route group
│   │       ├── layout.tsx          # Auth layout
│   │       ├── login/              # Login page
│   │       │   └── page.tsx
│   │       └── register/           # Register page
│   │           └── page.tsx
│   │
│   ├── components/                 # React components
│   │   ├── ui/                     # UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   └── badge.tsx
│   │   ├── layout/                 # Layout components
│   │   │   ├── header.tsx
│   │   │   └── sidebar.tsx
│   │   ├── forms/                  # Form components
│   │   └── cards/                  # Card components
│   │
│   ├── lib/                        # Utility functions
│   │   └── utils.ts                # Helper functions
│   │
│   ├── hooks/                      # Custom React hooks
│   │
│   ├── types/                      # TypeScript types
│   │   └── index.ts                # All type definitions
│   │
│   ├── stores/                     # Zustand stores
│   │   ├── auth-store.ts           # Authentication state
│   │   └── app-store.ts            # App-wide state
│   │
│   ├── services/                   # API services
│   │   ├── api.ts                  # Axios configuration
│   │   ├── auth-service.ts         # Auth API calls
│   │   ├── project-service.ts      # Project API calls
│   │   └── task-service.ts         # Task API calls
│   │
│   ├── locales/                    # Translation files
│   │   ├── en/                     # English translations
│   │   │   └── common.json
│   │   └── fr/                     # French translations
│   │       └── common.json
│   │
│   └── i18n/                       # i18n configuration
│       └── request.ts
```

---

## 🌍 Internationalization (i18n)

### Supported Languages
- **English (en)** - Default
- **French (fr)**

### Translation Structure

All labels are externalized in JSON files under `src/locales/`:

```json
// locales/en/common.json
{
  "common": {
    "appName": "MyPersonalTasks",
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel"
  },
  "auth": {
    "loginTitle": "Sign in to your account",
    "email": "Email",
    "password": "Password"
  },
  "taskStatus": {
    "todo": "To Do",
    "inProgress": "In Progress",
    "completed": "Completed"
  }
}
```

### Usage in Components

```tsx
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('common');
  const tAuth = useTranslations('auth');
  
  return (
    <div>
      <h1>{tAuth('loginTitle')}</h1>
      <button>{t('save')}</button>
    </div>
  );
}
```

### Adding a New Language

1. Create a new folder in `src/locales/` (e.g., `es/`)
2. Add `common.json` with translations
3. Update `src/i18n/request.ts` to include the new locale
4. Update `src/stores/app-store.ts` to support the new language

---

## 🗃️ State Management

### Zustand Stores

#### Auth Store
```typescript
// stores/auth-store.ts
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  setAuth: (response: AuthResponse) => void;
  logout: () => void;
}
```

#### App Store
```typescript
// stores/app-store.ts
interface AppState {
  theme: 'light' | 'dark' | 'system';
  locale: 'en' | 'fr';
  sidebarOpen: boolean;
  
  setTheme: (theme: Theme) => void;
  setLocale: (locale: Locale) => void;
  toggleSidebar: () => void;
}
```

### Usage

```tsx
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, setTheme } = useAppStore();
  
  // ...
}
```

---

## 🔌 API Integration

### API Client Configuration

```typescript
// services/api.ts
export const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor for JWT
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh
    }
  }
);
```

### Service Examples

```typescript
// services/project-service.ts
export const projectService = {
  async getProjects(params) {
    const response = await api.get('/projects', params);
    return response.data;
  },
  
  async createProject(data) {
    const response = await api.post('/projects', data);
    return response.data;
  },
};
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or bun

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd Front
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

---

## ⚙️ Environment Variables

Create a `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=

# Optional: Feature Flags
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
```

---

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🎨 Theming

The application supports light and dark themes using Tailwind CSS CSS variables.

### Toggle Theme

```tsx
import { useAppStore } from '@/stores/app-store';

function ThemeToggle() {
  const { theme, setTheme } = useAppStore();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

### CSS Variables

Defined in `globals.css`:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

---

## 🔒 Authentication Flow

1. User enters credentials on login page
2. Credentials sent to `/auth/login` endpoint
3. Server returns `accessToken` and `refreshToken`
4. Tokens stored in Zustand (persisted to localStorage)
5. `accessToken` included in all API requests
6. On 401 error, `refreshToken` used to get new tokens
7. If refresh fails, user redirected to login

---

## 📱 Responsive Design

- **Mobile First**: Base styles for mobile, enhanced for larger screens
- **Breakpoints**: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- **Collapsible Sidebar**: Hamburger menu on mobile
- **Touch-friendly**: Large tap targets, swipe gestures

---

## 📄 License

MIT License
