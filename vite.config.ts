import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Якщо деплой на GitHub Pages у репо react_infrc
export default defineConfig({
  base: '/react_infrc/',
  plugins: [react()],
})
