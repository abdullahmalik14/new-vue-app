# 🚀 Vue.js Section-Based Application

A modern, scalable Vue.js application built with **section-based architecture** - where each route gets its own mini-SPA with independent JavaScript, CSS, translations, and assets.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Tech Stack](#tech-stack)

---

## 🎯 Overview

This application implements a **section-based architecture** where:
- Each route section has its own JS/CSS bundles
- Components can opt into individual CSS generation
- Assets are preloaded intelligently
- Translations load per-section
- Performance tracking is built-in

### Key Features

- ✅ **Section-Based Bundling**: Each route gets its own mini-SPA
- ✅ **Individual Component CSS**: Components can generate isolated CSS files
- ✅ **Intelligent Preloading**: JS, CSS, assets, and translations preload automatically
- ✅ **Route Configuration**: Single source of truth for all routes and sections
- ✅ **Environment Validation**: Automated env variable validation
- ✅ **Performance Tracking**: Built-in operation timing and logging
- ✅ **Authentication**: AWS Cognito integration with role-based access
- ✅ **Internationalization**: Per-section translation loading

---

## 🏗️ Architecture

### Section-Based Design

```
Route: /dashboard → Section: dashboard
├── dashboard.js (JavaScript bundle)
├── dashboard.css (CSS bundle)
├── translations/section-dashboard-{locale}.json
└── Preloaded assets (images, fonts, etc.)
```

### File Structure

```
vueApp-main-new/
├── build/                    # Build utilities and scripts
│   ├── validate-env.js      # Environment validation
│   ├── tailwind/            # Tailwind CSS generation
│   └── vite/                # Vite bundling plugins
├── config/                  # App runtime configurations
├── docs/                    # Documentation (main docs)
├── src/                     # Application source code
│   ├── components/          # Shared components
│   ├── templates/           # Route-specific templates
│   ├── utils/               # Utility functions
│   ├── router/              # Routing configuration
│   └── stores/              # Pinia state management
├── index.html               # Entry HTML file
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
└── package.json             # Dependencies and scripts
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20.19.0 or >= 22.12.0
- npm or yarn

### Installation

```bash
# Clone and enter directory
cd vueApp-main-new

# Install dependencies
npm install

# Copy environment file
cp .env.development .env.local

# Start development server
npm run dev
```

### Build for Production

```bash
# Validate environment
npm run validate-env:prod

# Build application
npm run build

# Preview production build
npm run preview
```

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build           # Production build
npm run preview         # Preview production build

# Environment Validation
npm run validate-env    # Validate current environment
npm run validate-env:dev # Validate development
npm run validate-env:prod # Validate production

# Testing
npm run test:unit       # Run unit tests
```

### Environment Setup

1. **Copy environment file**:
   ```bash
   cp .env.development .env.local
   ```

2. **Configure required variables**:
   ```bash
   # Required for all environments
   VITE_ENABLE_LOGGER=true
   VITE_ENABLE_PERFORMANCE_TRACKING=true
   VITE_AUTH_DEV_SHIM=true
   VITE_ENABLE_FOOTER_NAVIGATION=true

   # Required for production
   VITE_COGNITO_USER_POOL_ID=your_user_pool_id
   VITE_COGNITO_CLIENT_ID=your_client_id
   VITE_COGNITO_REGION=us-east-1
   ```

3. **Validate configuration**:
   ```bash
   npm run validate-env
   ```

### Key Development Concepts

#### Route Configuration
All routes are defined in `src/router/routeConfig.json`. This is the **single source of truth** for:
- Route paths and components
- Section assignments
- Authentication requirements
- Preloading behavior
- Custom component paths

#### Component CSS Generation
Components can opt into individual CSS generation:
```vue
<!-- tailwind-ignore -->
<template>
  <!-- Component content -->
</template>
```

#### Performance Tracking
All major operations are automatically tracked:
- Section preloading
- Asset loading
- Translation loading
- Route navigation

---

## 🧪 Testing

### Testing Checklists

Before deploying, run through our comprehensive testing checklists:

1. **Handler Testing**: Test each utility handler individually
2. **Flow Testing**: Test complete user journeys
3. **Route Configuration Testing**: Test all route scenarios
4. **Environment Testing**: Test all environment configurations

See `docs/TESTING_CHECKLISTS.md` for complete testing procedures.

### Manual Testing

#### Preloading Verification
1. Open browser dev tools → Network tab
2. Navigate to a route
3. Check that only section-specific bundles load
4. Verify no duplicate CSS/JS loading

#### Asset Preloading
1. Check Network tab for preloaded assets
2. Verify images/fonts load before they're needed
3. Confirm cache headers are set correctly

#### Authentication Testing
1. Test login/logout flows
2. Verify role-based route access
3. Test JWT token validation
4. Confirm session persistence

---

## 🚢 Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] `npm run validate-env:prod` passes
- [ ] Build succeeds: `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] Run full testing checklist
- [ ] Deploy to hosting platform

### Environment Variables for Production

```bash
# Core Features
VITE_ENABLE_LOGGER=false
VITE_ENABLE_PERFORMANCE_TRACKING=true
VITE_AUTH_DEV_SHIM=false
VITE_ENABLE_FOOTER_NAVIGATION=true

# AWS Cognito (Required for production)
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXX
VITE_COGNITO_REGION=us-east-1
```

### Hosting Platforms

This app can be deployed to:
- **Vercel**: Zero-config deployment
- **Netlify**: Automatic builds and previews
- **AWS S3 + CloudFront**: Static hosting with CDN
- **Any static hosting service**

---

## 📚 Documentation

### Main Documentation

| Document | Purpose |
|----------|---------|
| `docs/DEV_GUIDE_COMPLETE.md` | Complete developer guide (0→hero) |
| `docs/TESTING_CHECKLISTS.md` | Comprehensive testing procedures |
| `docs/ENV_SETUP_GUIDE.md` | Environment variable configuration |
| `docs/INDIVIDUAL_COMPONENT_CSS.md` | Individual CSS generation guide |

### API Documentation

| Area | Location | Description |
|------|----------|-------------|
| Build System | `build/README.md` | Build utilities and scripts |
| Tailwind | `build/tailwind/README.md` | CSS generation system |
| Utils | `src/utils/*/README.md` | Utility function documentation |
| Router | `src/router/README.md` | Routing system documentation |

### Archived Documentation

Historical documentation and development notes are in `docs/archived/`.

---

## 🛠️ Tech Stack

### Core Framework
- **Vue.js 3.5.18** - Progressive framework
- **Vite 7.0.6** - Fast build tool
- **Vue Router 4.5.1** - Official router

### UI & Styling
- **Tailwind CSS 3.4.18** - Utility-first CSS framework
- **Heroicons 2.2.0** - Beautiful icon set

### State Management
- **Pinia 3.0.3** - Intuitive state management
- **Pinia Persisted State 4.5.0** - State persistence

### Authentication
- **Amazon Cognito** - User authentication
- **AWS Amplify 6.15.5** - AWS integration
- **JWT Decode 4.0.0** - Token validation

### Development Tools
- **Vitest 3.2.4** - Unit testing
- **Vue DevTools 8.0.0** - Development debugging
- **ESLint** - Code linting

### Build & Utilities
- **TypeScript 5.6** - Type checking
- **Autoprefixer 10.4.21** - CSS vendor prefixes
- **Cross-env 7.0.3** - Cross-platform environment variables

### Content & Media
- **Quill Editor 1.2.0** - Rich text editing
- **Splide 0.6.12** - Carousel/slider component

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Make** your changes
4. **Run tests**: `npm run test:unit`
5. **Validate env**: `npm run validate-env`
6. **Commit** your changes: `git commit -am 'Add some feature'`
7. **Push** to the branch: `git push origin feature/your-feature`
8. **Submit** a pull request

### Development Standards

- **Environment Validation**: Always run `npm run validate-env` before committing
- **Testing**: Complete testing checklists before pull requests
- **Performance**: Use built-in performance tracking for new features
- **Documentation**: Update docs when adding new features

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🆘 Support

### Common Issues

**Environment validation fails**:
```bash
# Check your .env file
npm run validate-env

# See validation errors and fix them
```

**Build fails**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

**CSS not loading**:
- Check if component has `tailwind-ignore` marker
- Run individual CSS generation: `node build/tailwind/generateIndividualCss.js`

### Getting Help

1. Check the documentation in `docs/`
2. Review archived docs in `docs/archived/`
3. Check existing issues and pull requests
4. Create a new issue with detailed information

---

## 🎉 Acknowledgments

This project implements advanced Vue.js patterns including:
- Section-based code splitting
- Intelligent asset preloading
- Component-level CSS isolation
- Performance-first architecture

Built with modern web development best practices and scalable architecture patterns.
