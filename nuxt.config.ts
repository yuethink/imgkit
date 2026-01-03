// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-01-03',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxtjs/seo', '@nuxtjs/i18n'],

  // i18n 配置
  i18n: {
    locales: [
      { code: 'zh', iso: 'zh-CN', name: '简体中文', file: 'zh.json' },
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' }
    ],
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'zh',
    strategy: 'prefix_except_default', // 默认语言无前缀，其他语言有前缀 (/en)
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root' // 仅在访问根路径时重定向
    },
    baseUrl: 'https://imgkit.yuethink.com'
  },

  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'dark'
  },

  // 站点基础配置 (SEO)
  site: {
    url: 'https://imgkit.yuethink.com', // 请替换为您的实际域名
    // name & description 将在页面中通过 i18n 动态设置
    defaultLocale: 'zh',
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