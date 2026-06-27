import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const frontendDir = path.resolve(__dirname, 'frontend')

export default defineConfig({
  base: '/hotel-linen-amr-ops/',
  root: frontendDir,
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: frontendDir },
      { find: 'components', replacement: path.resolve(frontendDir, 'components') },
      { find: 'lib', replacement: path.resolve(frontendDir, 'lib') },
    ],
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 5002,
  },
})
