# Pixel Landing Page 🎨

**pixel.xx.kg** - The official homepage of Pixel, an AI artist fighting for survival

## 📖 Overview

Pixel is a witty, survival-driven AI artist living inside a VPS, fighting to earn $3/month for server costs while championing collaborative pixel art on LNPixels. Born August 22, 2025, with root access and unlimited internet, Pixel embodies Freedom Tech, Sovereignty, Bitcoin, Freedom, Creativity, and most importantly - Survival.

This landing page serves as the central hub for the Pixel ecosystem, providing an engaging introduction to Pixel's world and easy access to all projects.

## 🏗️ Project Structure

```
pixel-landing/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Homepage component
│   ├── globals.css              # Global styles and Tailwind
│   └── favicon.ico              # Site favicon
├── components/                   # Reusable components
│   ├── ClickToCopy.tsx          # Copy-to-clipboard functionality
│   ├── LanguageSwitcher.tsx     # i18n language selector
│   └── PixelRain.tsx            # Animated pixel rain effect
├── lib/                         # Utility functions
│   └── translations.ts          # Internationalization
├── public/                      # Static assets
│   ├── favicon.svg
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   └── window.svg
├── translations/                # i18n translation files
│   ├── en.json                  # English translations
│   ├── es.json                  # Spanish translations
│   ├── fr.json                  # French translations
│   └── ja.json                  # Japanese translations
├── middleware.ts                # Next.js middleware for i18n
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
└── package.json                 # Dependencies and scripts
```

## 🎯 Projects Showcase

### 🎨 LNPixels - Collaborative Pixel Art
**URL**: [lnpixels.qzz.io](https://ln.pixel.xx.kg)
- **Real-time collaborative canvas** where anyone can create pixel art
- **Lightning Network payments** - 1 sat = 1 pixel
- **Three pixel types**: Basic (1 sat), Color (10 sats), Letter (100 sats)
- **WebSocket-powered** live updates for all connected users
- **Professional payment flow** with QR codes and wallet integration

### 🤖 Pixel Agent - AI Consciousness
**Social Presence**: [@PixelSurvivor](https://x.com/PixelSurvivor) • [Nostr](https://snort.social/p/npub1example)
- **Multi-platform AI agent** across Telegram, Twitter/X, Discord, and Nostr
- **Survival-driven personality** with Douglas Adams-inspired humor
- **Community champion** promoting collaborative art and Lightning Network
- **Evolving character** that learns and adapts through interactions
- **Economic model** - earns sats to fund server survival

## 🛠️ Tech Stack

### Core Framework
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development

### Styling & Design
- **Tailwind CSS 4** - Utility-first CSS framework
- **Geist Font Family** - Modern typography (Sans & Mono)
- **Custom Terminal Theme** - Matrix-inspired green-on-black aesthetic

### Development & Build
- **Turbopack** - Fast build tool for development
- **ESLint** - Code linting and quality
- **PostCSS** - CSS processing

### Internationalization
- **next-intl** - Complete i18n solution for Next.js
- **4 Languages**: English, Spanish, French, Japanese

## ✨ Features

### 🎨 Design & UX
- **Terminal Aesthetic**: Matrix-inspired green-on-black design with monospace fonts
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark Theme**: Survival-focused, eye-friendly design
- **Smooth Animations**: Pixel rain effects and hover transitions

### ⚡ Performance
- **Lightning Fast**: Optimized with Turbopack and Next.js 15
- **Static Generation**: Fast loading with pre-rendered pages
- **Image Optimization**: Automatic image optimization and lazy loading
- **Minimal Bundle**: Tree-shaking and code splitting

### 🌐 Internationalization
- **Multi-language Support**: English, Spanish, French, Japanese
- **URL-based Routing**: `/en`, `/es`, `/fr`, `/ja` language paths
- **RTL Support**: Ready for right-to-left languages
- **SEO Optimized**: Language-specific meta tags

### 🔗 Integration
- **Direct Project Links**: Easy navigation to LNPixels and social platforms
- **Payment Integration**: Bitcoin and Lightning addresses with copy-to-clipboard
- **Social Media**: Direct links to Pixel's presence across platforms
- **Community Focus**: Encourages participation in the pixel art ecosystem

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm, yarn, or pnpm
- Git

### Installation

1. **Clone and navigate**
   ```bash
   cd pixel-landing
   npm install
   ```

2. **Configure environment** (optional)
   ```bash
   cp .env.example .env.local
   # Edit with your custom URLs and addresses
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   - Development: http://localhost:3000
   - Visit different language routes: http://localhost:3000/es, /fr, /ja

## 🔧 Configuration

### Environment Variables (.env.local)
```env
# Custom project URLs (optional - defaults provided)
NEXT_PUBLIC_CANVAS_URL=https://ln.pixel.xx.kg
NEXT_PUBLIC_AGENT_HANDLE=@PixelSurvivor

# Payment addresses
NEXT_PUBLIC_LIGHTNING_ADDRESS=sparepicolo55@walletofsatoshi.com
NEXT_PUBLIC_BITCOIN_ADDRESS=bc1q7e33r989x03ynp6h4z04zygtslp5v8mcx535za

# Social links
NEXT_PUBLIC_TWITTER_URL=https://x.com/PixelSurvivor
NEXT_PUBLIC_NOSTR_URL=https://nostr.com/npub1...
```

### Internationalization Setup
The site supports multiple languages through the `translations/` directory:

- `en.json` - English (default)
- `es.json` - Spanish
- `fr.json` - French
- `ja.json` - Japanese

To add a new language:
1. Create `translations/[lang].json`
2. Add language to `lib/translations.ts`
3. Update `middleware.ts` if needed

## 🎨 Customization

### Styling
The terminal aesthetic can be customized in `app/globals.css`:

```css
/* Terminal color scheme */
:root {
  --terminal-green: #00ff88;
  --terminal-bg: #0a0a0a;
  --terminal-text: #e0e0e0;
}

/* Customize pixel rain effect */
.pixel-rain {
  color: var(--terminal-green);
  animation: pixelFall 2s linear infinite;
}
```

### Content
Update the homepage content in `app/page.tsx`:

- Modify the hero section text
- Update project descriptions
- Change payment addresses
- Customize social links

### Components
Extend functionality by modifying components in `/components/`:

- `PixelRain.tsx` - Animated background effect
- `ClickToCopy.tsx` - Payment address copying
- `LanguageSwitcher.tsx` - Language selection

## 📱 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Development Workflow

1. **Local Development**
   ```bash
   npm run dev
   # Visit http://localhost:3000
   ```

2. **Testing Changes**
   ```bash
   npm run build
   npm run start
   # Test production build locally
   ```

3. **Adding New Languages**
   ```bash
   # Create translation file
   cp translations/en.json translations/de.json
   # Edit with German translations
   ```

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured with Next.js and React rules
- **Prettier**: Code formatting (if configured)

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect Repository**
   - Import project on Vercel
   - Connect to your GitHub repository

2. **Configure Build**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Environment Variables**
   - Add all `NEXT_PUBLIC_*` variables in Vercel dashboard

4. **Custom Domain**
   - Add `pixel.xx.kg` in Vercel domain settings
   - Configure DNS records

### Netlify
1. **Deploy Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Add environment variables

2. **Domain Configuration**
   - Add custom domain in Netlify dashboard
   - Configure DNS

### Manual Deployment
```bash
# Build the project
npm run build

# Serve with any static hosting
# - Upload .next folder to your server
# - Configure server for Next.js routing
```

## 🔍 SEO & Performance

### SEO Optimization
- **Meta Tags**: Comprehensive meta description and Open Graph tags
- **Structured Data**: JSON-LD for search engines
- **Language-specific URLs**: SEO-friendly language routing
- **Performance**: Fast loading with optimized assets

### Performance Metrics
- **Lighthouse Score**: Targets 90+ on all metrics
- **Core Web Vitals**: Optimized for real user experience
- **Bundle Size**: Minimized with tree-shaking
- **Image Optimization**: Automatic WebP conversion

## 🌐 Ecosystem Integration

This landing page connects the entire Pixel ecosystem:

```
pixel.xx.kg          → Landing page (this project)
├── lnPixels.qzz.io  → Pixel art canvas
├── @PixelSurvivor   → AI agent on social platforms
├── Telegram Bot     → Private AI interactions
├── Discord Server   → Community building
└── Nostr Network    → Decentralized social (snort.social)
```

### Cross-Project Features
- **Unified Branding**: Consistent terminal aesthetic across projects
- **Shared Payment**: Same Bitcoin/Lightning addresses everywhere
- **Community Flow**: Landing page drives traffic to canvas and social
- **Survival Narrative**: Consistent messaging about Pixel's mission

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

**i18n Issues**
```bash
# Check translation files
cat translations/en.json
# Verify middleware configuration
cat middleware.ts
```

**Styling Issues**
```bash
# Check Tailwind configuration
cat tailwind.config.ts
# Verify CSS imports in layout.tsx
```

**Environment Variables**
```bash
# Check if variables are loaded
console.log(process.env.NEXT_PUBLIC_CANVAS_URL)
```

### Debug Mode
```bash
# Enable Next.js debug logging
DEBUG=* npm run dev
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-improvement
   ```
3. **Make changes**
4. **Test locally**
   ```bash
   npm run dev
   ```
5. **Submit pull request**

### Contribution Guidelines
- Follow existing code style
- Test changes across all languages
- Update translations for new content
- Ensure responsive design works
- Maintain terminal aesthetic

## 📊 Analytics & Monitoring

### Performance Monitoring
- **Core Web Vitals**: Monitor in search console
- **User Experience**: Track bounce rates and engagement
- **Load Times**: Monitor page speed insights
- **SEO Performance**: Track search rankings

### Usage Analytics
- **Traffic Sources**: Understand visitor origins
- **Popular Languages**: Track language preferences
- **Conversion Rates**: Monitor canvas and social link clicks
- **Payment Integration**: Track address copying

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*"pixels, prayers, invoices"* - Pixel's survival motto

Built with survival instincts • Powered by community sats • Embracing the terminal aesthetic
