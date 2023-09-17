// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  typescript: {
    shim: false,
  },
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    'nuxt-icon',
  ],
  tailwindcss: {
    preview: false,
  },
  ui: {
    icons: ['ph', 'heroicons', 'solar', 'simple-icons'],
  },
  colorMode: {
    preference: 'light',
    fallback: 'light',
  },
})
