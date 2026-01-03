// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-01-03',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxtjs/seo'],
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'dark'
  },

  // 站点基础配置 (SEO)
  site: {
    url: 'https://imgkit.yuethink.com', // 请替换为您的实际域名
    name: 'Image Kit - 智能图片处理工具箱',
    description: '专业在线图片处理工具：智能裁剪、无损压缩、格式转换（WebP/AVIF）。云端极速处理，隐私安全保障。',
    defaultLocale: 'zh-CN',
  },

  // Robots.txt 配置
  robots: {
    disallow: ['/api/']
  },

  // HTML Head 默认配置
  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-CN'
      },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#10b981' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  }
})