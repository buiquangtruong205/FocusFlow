import type { DailySummaryDTO, TopAppDTO, TimelineDTO } from '../../shared/types';

// Wrapper for direct IPC calls
export const api = {
    getDailySummary: async (date: string): Promise<DailySummaryDTO> => {
        return window.electronAPI.getDailySummary(date);
    },
    getTopApps: async (date: string, limit: number): Promise<TopAppDTO[]> => {
        return window.electronAPI.getTopApps(date, limit);
    },
    getTimeline: async (date: string): Promise<TimelineDTO> => {
        return window.electronAPI.getTimeline(date);
    },
    getTimelineRange: async (startDate: string, endDate: string): Promise<TimelineDTO[]> => {
        return window.electronAPI.getTimelineRange(startDate, endDate);
    },
    getStatsRange: async (startDate: string, endDate: string): Promise<DailySummaryDTO[]> => {
        return window.electronAPI.getStatsRange(startDate, endDate);
    },
    // Settings
    getAllApps: async (): Promise<any[]> => {
        return window.electronAPI.getAllApps();
    },
    updateAppCategory: async (appId: string, category: string): Promise<any> => {
        return window.electronAPI.updateAppCategory(appId, category);
    },
    // Focus
    startFocusSession: async (config: any): Promise<any> => {
        return window.electronAPI.startFocusSession(config);
    },
    endFocusSession: async (sessionId: string): Promise<any> => {
        return window.electronAPI.endFocusSession(sessionId);
    }
};
