import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron/simple';
import path from 'path';

export default defineConfig({
    plugins: [
        vue(),
        electron({
            main: {
                entry: 'electron/main.ts',
                vite: {
                    build: {
                        lib: {
                            entry: 'electron/main.ts',
                            formats: ['cjs'],
                            fileName: () => 'main.cjs',
                        },
                        rollupOptions: {
                            external: ['@prisma/client', 'active-win'],
                        },
                    },
                },
            },
            preload: {
                input: 'electron/preload.ts',
                vite: {
                    build: {
                        lib: {
                            entry: 'electron/preload.ts',
                            formats: ['cjs'],
                            fileName: () => 'preload.cjs',
                        },
                    },
                },
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    base: './', // Important for Electron to resolve assets
    server: {
        open: false, // Ensure it doesn't open in the browser
    },
});
