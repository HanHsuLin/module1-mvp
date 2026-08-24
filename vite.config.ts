import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Dropbox may lock Vite's atomic cache rename on Windows.
  // Keep disposable dependency cache outside the synced project folder.
  cacheDir: join(tmpdir(), 'module1-mvp-vite-cache'),
})
