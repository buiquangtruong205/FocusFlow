/// <reference types="vite/client" />

declare module 'active-win';
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

import { ElectronAPI } from '../shared/types'

interface Window {
    electronAPI: ElectronAPI;
}
