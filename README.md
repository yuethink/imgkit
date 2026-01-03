# ImgKit

<p align="center">
  <img src="public/logo.svg" alt="ImgKit Logo" width="180">
</p>

<p align="center">
  <strong>🖼️ Smart Online Image Toolkit</strong><br>
  Crop, compress, and convert images with ease.
</p>

<p align="center">
  <a href="https://imgkit.yuethink.com">Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#deployment">Deployment</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/nuxt-4.x-00DC82?logo=nuxt.js" alt="Nuxt 4">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License">
  <img src="https://img.shields.io/badge/vue-3.x-4FC08D?logo=vue.js" alt="Vue 3">
</p>

---

## 📸 Screenshots

<p align="center">
  <img src="public/page1.webp" alt="ImgKit - Upload" width="600">
</p>

<p align="center">
  <img src="public/page2.webp" alt="ImgKit - Editor" width="600">
</p>


## ✨ Features

- **🖼️ Image Cropping** - Precise cropping with preset aspect ratios (16:9, 4:3, 1:1, etc.)
- **📦 Smart Compression** - Powered by Sharp for high-quality, efficient compression
- **🔄 Format Conversion** - Support for WebP, AVIF, JPEG, PNG
- **🌍 Internationalization** - Chinese and English support
- **🌙 Dark Mode** - Automatic theme switching
- **📱 Responsive** - Works on desktop and mobile

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [Nuxt 4](https://nuxt.com) | Vue framework for SSR/SSG |
| [Nuxt UI v4](https://ui.nuxt.com) | UI component library |
| [Sharp](https://sharp.pixelplumbing.com) | High-performance image processing |
| [vue-advanced-cropper](https://advanced-cropper.github.io/vue-advanced-cropper/) | Image cropping component |
| [Vercel](https://vercel.com) | Deployment platform |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm / npm / yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yuethink/imgkit.git
cd img-kit

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yuethink/imgkit)

Or deploy manually:

```bash
pnpm build
```

## 📝 License

[MIT](LICENSE) © Yuethink

---

<p align="center">
  Made with ❤️ by <a href="https://www.yuethink.com">Yuethink</a>
</p>
