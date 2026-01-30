import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    // Stats
    getDailySummary: (date: string) => ipcRenderer.invoke('get-daily-summary', date),
    getTopApps: (date: string, limit: number) => ipcRenderer.invoke('get-top-apps', date, limit),
    getTimeline: (date: string) => ipcRenderer.invoke('get-timeline', date),
    getTimelineRange: (startDate: string, endDate: string) => ipcRenderer.invoke('get-timeline-range', startDate, endDate),
    getStatsRange: (startDate: string, endDate: string) => ipcRenderer.invoke('get-stats-range', startDate, endDate),


    // Tracking
    startTracking: () => ipcRenderer.invoke('tracking:start'),
    stopTracking: () => ipcRenderer.invoke('tracking:stop'),
    onActivityUpdate: (callback: (data: any) => void) => ipcRenderer.on('activity-update', (_event, value) => callback(value)),

    // Settings / Apps
    getAllApps: () => ipcRenderer.invoke('get-all-apps'),
    updateAppCategory: (appId: string, category: string) => ipcRenderer.invoke('update-app-category', appId, category),

    // Focus
    startFocusSession: (config: any) => ipcRenderer.invoke('start-focus-session', config),
    endFocusSession: (sessionId: string) => ipcRenderer.invoke('end-focus-session', sessionId),
    pauseFocusSession: () => ipcRenderer.invoke('pause-focus-session'),
    resumeFocusSession: () => ipcRenderer.invoke('resume-focus-session'),
    onFocusSessionUpdate: (callback: (session: any) => void) => ipcRenderer.on('focus-session-update', (_event, value) => callback(value)),

    // Advice
    getDailyAdvice: () => ipcRenderer.invoke('get-daily-advice'),
});
