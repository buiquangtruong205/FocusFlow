export type AppCategory = 'WORK' | 'COMM' | 'ENT' | 'OTHER' | 'UNCATEGORIZED';

export interface DailySummaryDTO {
    date: string; // ISO date string YYYY-MM-DD
    activeMs: number;
    idleMs: number;
    focusMs: number;
    distractedMs: number;
    switchCount: number;
    byCategoryMs: Record<AppCategory, number>;
}

export interface TopAppDTO {
    appId: string;
    displayName: string;
    durationMs: number;
    category: AppCategory;
    iconUrl?: string;
}

export interface TimelineAppInfo {
    id: string;
    displayName: string;
    iconUrl?: string;
}

export interface TimelineSegmentDTO {
    id: string;
    startTime: string; // ISO timestamp
    endTime: string; // ISO timestamp
    durationMs: number;
    app?: TimelineAppInfo;
    category: AppCategory;
    kind: 'FOREGROUND' | 'IDLE';
    sessionId?: string;
    focusState?: 'FOCUS' | 'DISTRACTED';
}

export interface TimelineDTO {
    date: string;
    segments: TimelineSegmentDTO[];
}

export interface FocusSessionConfig {
    durationMinutes: number;
    taskTitle?: string;
    allowedCategories: AppCategory[];
    strictMode: boolean;
}

export type FocusSessionState = 'SETUP' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

export interface FocusSessionDTO {
    sessionId: string;
    config: FocusSessionConfig;
    startTime: string; // ISO
    endTime?: string; // ISO
    state: FocusSessionState;

    // Real-time stats
    elapsedMs: number;
    totalFocusMs: number;
    totalDistractedMs: number;
    totalIdleMs: number;

    currentFocusState: 'FOCUS' | 'DISTRACTED' | 'IDLE';
    currentApp?: { displayName: string, category: AppCategory };
    distractionReason?: string;
}


// IPC API Interface
export interface ElectronAPI {
    getDailySummary: (date: string) => Promise<DailySummaryDTO>;
    getTopApps: (date: string, limit: number) => Promise<TopAppDTO[]>;
    getTimeline: (date: string) => Promise<TimelineDTO>;
    getTimelineRange: (startDate: string, endDate: string) => Promise<TimelineDTO[]>;
    getStatsRange: (startDate: string, endDate: string) => Promise<DailySummaryDTO[]>;

    // Focus APIs
    // Focus APIs
    startFocusSession: (config: FocusSessionConfig) => Promise<FocusSessionDTO>;
    endFocusSession: (sessionId: string) => Promise<FocusSessionDTO>;

    // Tracking
    startTracking: () => Promise<{ status: string }>;
    stopTracking: () => Promise<{ status: string }>;
    onActivityUpdate: (callback: (data: any) => void) => void;

    // Settings
    getAllApps: () => Promise<any[]>;
    updateAppCategory: (appId: string, category: string) => Promise<any>;
}

// Extend Window interface
declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
