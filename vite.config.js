import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            // eslint-disable-next-line no-undef
            entry: resolve(__dirname, 'src/main.ts'),
            name: 'sql4csv',
        },
    },
})
