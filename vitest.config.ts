import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    clearMocks: true,
    restoreMocks: true,
    coverage: { reporter: ['text', 'html'], include: ['src/lib/**/*.ts', 'src/app/api/**/*.ts'] },
  },
})
