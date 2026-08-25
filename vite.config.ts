import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// vite-plugin-pwa injects Vault of Value's manifest link + SW registration
// into every HTML entry it sees, including crowd/index.html — which already
// declares its own Zonecall manifest/icons. It does this by rewriting the
// emitted file directly rather than via transformIndexHtml, so the only
// reliable point to undo it is after the whole bundle is written to disk.
function stripPwaInjectionFromCrowd(): Plugin {
  return {
    name: 'strip-pwa-injection-from-crowd',
    apply: 'build',
    writeBundle(options) {
      const outDir = options.dir ?? resolve(__dirname, 'dist')
      const crowdHtmlPath = resolve(outDir, 'crowd/index.html')
      const html = readFileSync(crowdHtmlPath, 'utf-8')
      const stripped = html
        .replace(/<link rel="manifest" href="\/VAULTOFVALUE\/manifest\.webmanifest">/, '')
        .replace(/<script id="vite-plugin-pwa:register-sw"[^>]*><\/script>/, '')
      if (stripped !== html) writeFileSync(crowdHtmlPath, stripped)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/VAULTOFVALUE/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        crowd: resolve(__dirname, 'crowd/index.html'),
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'The Vault of Value',
        short_name: 'Vault',
        description: 'Personal networking book, pipeline and concierge for working the room at the Vault.',
        theme_color: '#006786',
        background_color: '#f3f2f2',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/VAULTOFVALUE/',
        scope: '/VAULTOFVALUE/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
      devOptions: {
        enabled: false,
      },
    }),
    stripPwaInjectionFromCrowd(),
  ],
})
