# Memo World

A 3D interactive memory management application built with React, Vite, and Three.js. Create, explore, and manage your memories in a beautiful 3D island environment powered by Base44.

## 🎯 Features

- **3D Island Visualization**: Explore memories in an interactive 3D world
- **Memory Management**: Create, organize, and browse your memories
- **Authentication**: Secure login and user registration with Base44
- **Customizable Character**: Personalize your avatar with different outfits and accessories
- **Audio Support**: Toggle audio and immersive soundscapes
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Interactions**: Dynamic memory bubbles and visual effects

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher (comes with Node.js)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a local environment file:

```bash
cp .env.example .env
```

Update the `.env` file with your Base44 credentials:

```bash
VITE_BASE44_APP_ID=your_base44_app_id
VITE_BASE44_APP_BASE_URL=https://your-base44-app-url
VITE_BASE44_FUNCTIONS_VERSION=prod
VITE_BASE44_SERVER_URL=
```

> **Note**: `VITE_BASE44_APP_BASE_URL` is essential for local development. Outside the Base44 sandbox, `@base44/vite-plugin` enables the local `/api` proxy only when this value is set.

### 3. Run Development Server

```bash
npm run dev
```

The application will start on your local machine. Vite will display the URL in the terminal, typically:

```
http://localhost:5173/
```

Open this URL in your browser to start using Memo World.

## 📦 Available Scripts

### Development
```bash
npm run dev          # Start development server with hot reload
```

### Production
```bash
npm run build        # Build optimized production bundle
npm run preview      # Preview production build locally
```

### Code Quality
```bash
npm run lint         # Run ESLint to check code quality
npm run lint:fix     # Automatically fix linting issues
npm run typecheck    # Run TypeScript type checking
```

## 🏗️ Project Structure

```
src/
├── api/                 # API clients and base44 integration
├── components/
│   ├── AuthLayout.jsx   # Authentication wrapper
│   ├── ProtectedRoute.jsx # Route protection
│   └── island/          # 3D island scene components
│       ├── IslandScene.jsx      # Main 3D scene
│       ├── Character.jsx        # Player character
│       ├── MemoryBubble.jsx     # Memory visualization
│       └── ...
│   ├── landing/         # Landing page components
│   └── ui/              # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and contexts
│   ├── AuthContext.jsx  # Authentication state
│   └── utils.js         # Helper functions
├── pages/               # Page components
│   ├── World.jsx        # Main memory world
│   ├── Login.jsx        # Authentication pages
│   └── ...
└── utils/               # Additional utilities
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite 6
- **3D Graphics**: Three.js + React Three Fiber
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: TanStack Query + React Context
- **Form Handling**: React Hook Form + Zod
- **Authentication**: Base44
- **Backend Integration**: Base44 SDK

## 🔐 Authentication

The app uses Base44 for authentication. Users can:
- Sign up with email
- Sign in with existing credentials
- Use OAuth providers (Google, etc.)
- Reset forgotten passwords

Protected routes ensure only authenticated users can access the main application.

## 🎨 Customization

Users can customize their experience through:
- Character customization (hats, outfits)
- World themes and appearance
- Audio preferences
- Mobile joystick controls

## 📱 Mobile Support

The app includes responsive design and mobile-specific features:
- Touch-friendly UI
- Mobile joystick for character control
- Optimized 3D rendering for mobile devices

## 🐛 Development Tips

### Hot Reload
Changes to your code will automatically reload in the browser during development.

### Type Checking
Run type checking to catch TypeScript errors before building:
```bash
npm run typecheck
```

### Debugging
- Use browser DevTools to inspect React components and network requests
- Check the terminal for Vite build errors and warnings

## 🚢 Deployment

To create a production build:

```bash
npm run build
```

This generates an optimized `dist/` directory ready for deployment. The build includes:
- Minified JavaScript and CSS
- Optimized 3D assets
- Code splitting for better performance

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_BASE44_APP_ID` | Yes | Your Base44 application ID |
| `VITE_BASE44_APP_BASE_URL` | Yes | Base44 API endpoint URL |
| `VITE_BASE44_FUNCTIONS_VERSION` | No | Base44 functions version (default: prod) |
| `VITE_BASE44_SERVER_URL` | No | Custom server URL for Base44 |

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and type checks:
   ```bash
   npm run lint:fix
   npm run typecheck
   ```
4. Build to ensure no errors:
   ```bash
   npm run build
   ```
5. Submit a pull request

## 📄 License

This project is part of the Hackathon 2024 competition.

## Base44 API Notes

The frontend client lives in `src/api/base44Client.js` and is configured from
`src/lib/app-params.js`.

This app currently expects these Base44 resources to exist in your Base44 app:

- `World` entity
- `Memory` entity
- `generateMemoryObject` function
- `getPublicWorld` function

Those backend entities/functions are still owned by Base44. This repo wires the
local frontend to the Base44 SDK and Vite proxy; it does not replace the
Base44-hosted backend.
