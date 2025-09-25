/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import('electron').IpcRenderer
  electronAPI?: {
    loadData: (key?: string) => Promise<any>
    saveData: (key: string, data: any) => Promise<boolean>
    selectFile: () => Promise<string | null>
    selectFolder: () => Promise<string | null>
    cleanDB: () => Promise<boolean>
    startFork: (opts?: any) => Promise<any>
    startCollectorFork: (opts?: any) => Promise<any>
    printPDF: (filePath: string) => Promise<any>
  }
}
