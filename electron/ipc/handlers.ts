import { ipcMain } from 'electron';
import { ActivityTracker } from '../tracker/activityTracker';
import { db } from '../db';
import { DailySummaryDTO, TopAppDTO, AppCategory, TimelineDTO, FocusSessionConfig, FocusSessionDTO } from '../../shared/types/index';
import { focusSessionService } from '../focus/focusSessionService';

export function registerHandlers(tracker: ActivityTracker) {

    // --- Tracking Control ---
    ipcMain.handle('tracking:start', () => {
        tracker.startTracking();
        return { status: 'started' };
    });

    ipcMain.handle('tracking:stop', () => {
        tracker.stopTracking();
        return { status: 'stopped' };
    });

    // --- Stats Helpers ---
    async function getEventsForDay(dateString: string) {
        const startOfDay = new Date(dateString);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateString);
        endOfDay.setHours(23, 59, 59, 999);

        return await db.activityEvent.findMany({
            where: {
                timestamp: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            include: { app: { include: { rules: true } } },
            orderBy: { timestamp: 'asc' }
        });
    }

    // --- Dashboard ---
    ipcMain.handle('get-daily-summary', async (_event, date: string): Promise<DailySummaryDTO> => {
        return await generateDailySummary(date);
    });

    ipcMain.handle('get-top-apps', async (_event, date: string, limit: number): Promise<TopAppDTO[]> => {
        const events = await getEventsForDay(date);
        const appMap = new Map<string, TopAppDTO>();

        for (let i = 0; i < events.length; i++) {
            const current = events[i];
            const next = events[i + 1];

            let duration = 0;
            if (next) {
                duration = next.timestamp.getTime() - current.timestamp.getTime();
                if (duration > 5 * 60 * 1000) duration = 2000;
            } else {
                duration = 2000;
            }

            if (current.eventType === 'ACTIVE' && current.app) {
                const appId = current.appId!;
                if (!appMap.has(appId)) {
                    appMap.set(appId, {
                        appId,
                        displayName: current.app.name,
                        durationMs: 0,
                        category: (current.app.rules?.[0]?.category as AppCategory) || 'UNCATEGORIZED',
                        iconUrl: current.app.icon || undefined
                    });
                }
                appMap.get(appId)!.durationMs += duration;
            }
        }

        return Array.from(appMap.values())
            .sort((a, b) => b.durationMs - a.durationMs)
            .slice(0, limit);
    });

    async function getTimelineForDate(date: string): Promise<TimelineDTO> {
        const events = await getEventsForDay(date);
        // Transform to Segments
        // Ideally we merge adjacent same-app events

        const segments: any[] = [];
        let currentSegment: any = null;

        for (let i = 0; i < events.length; i++) {
            const e = events[i];
            const next = events[i + 1];
            let duration = 0;
            if (next) {
                duration = next.timestamp.getTime() - e.timestamp.getTime();
                if (duration > 5 * 60 * 1000) duration = 2000;
            } else {
                duration = 2000;
            }

            const appName = e.app?.name || 'Unknown';
            const cat = (e.app?.rules?.[0]?.category as AppCategory) || 'UNCATEGORIZED';

            if (currentSegment &&
                currentSegment.app?.displayName === appName &&
                currentSegment.kind === (e.eventType === 'ACTIVE' ? 'FOREGROUND' : 'IDLE')) {
                // Merge
                currentSegment.durationMs += duration;
                currentSegment.endTime = new Date(new Date(currentSegment.endTime).getTime() + duration).toISOString();
            } else {
                // New Segment
                currentSegment = {
                    id: e.id,
                    startTime: e.timestamp.toISOString(),
                    endTime: new Date(e.timestamp.getTime() + duration).toISOString(),
                    durationMs: duration,
                    app: e.app ? { id: e.app.id, displayName: e.app.name, iconUrl: e.app.icon } : undefined,
                    category: cat,
                    kind: e.eventType === 'ACTIVE' ? 'FOREGROUND' : 'IDLE'
                };
                segments.push(currentSegment);
            }
        }

        return { date, segments };
    }

    ipcMain.handle('get-timeline', async (_event, date: string): Promise<TimelineDTO> => {
        return getTimelineForDate(date);
    });

    ipcMain.handle('get-timeline-range', async (_event, startDate: string, endDate: string): Promise<TimelineDTO[]> => {
        const result: TimelineDTO[] = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Loop from start to end inclusive
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const timeline = await getTimelineForDate(dateStr);
            if (timeline.segments.length > 0) {
                result.push(timeline);
            }
        }

        // Sort by date ascending
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return result;
    });



    // Helper function (to be created above and used)
    async function generateDailySummary(date: string): Promise<DailySummaryDTO> {
        const events = await getEventsForDay(date);

        // Init stats
        const summary: DailySummaryDTO = {
            date,
            activeMs: 0,
            idleMs: 0,
            focusMs: 0,
            distractedMs: 0,
            switchCount: 0,
            byCategoryMs: {
                WORK: 0,
                COMM: 0,
                ENT: 0,
                OTHER: 0,
                UNCATEGORIZED: 0
            }
        };

        for (let i = 0; i < events.length; i++) {
            const current = events[i];
            const next = events[i + 1];

            let duration = 0;
            if (next) {
                duration = next.timestamp.getTime() - current.timestamp.getTime();
                if (duration > 5 * 60 * 1000) duration = 2000;
            } else {
                duration = 2000;
            }

            if (current.eventType === 'ACTIVE') {
                summary.activeMs += duration;
                summary.switchCount++;

                const cat = (current.app?.rules?.[0]?.category as AppCategory) || 'UNCATEGORIZED';
                if (summary.byCategoryMs[cat] !== undefined) {
                    summary.byCategoryMs[cat] += duration;
                } else {
                    summary.byCategoryMs.OTHER += duration;
                }
            } else if (current.eventType === 'IDLE') {
                summary.idleMs += duration;
            }
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const sessions = await db.focusSession.findMany({
            where: {
                startTime: { gte: startOfDay, lte: endOfDay }
            }
        });

        for (const s of sessions) {
            if (s.endTime) {
                summary.focusMs += (s.endTime.getTime() - s.startTime.getTime());
            } else if (s.status === 'RUNNING') {
                summary.focusMs += (new Date().getTime() - s.startTime.getTime());
            }
        }

        return summary;
    }

    // Using the helper in the new handler:

    ipcMain.handle('get-stats-range', async (_event, startDate: string, endDate: string): Promise<DailySummaryDTO[]> => {
        const result: DailySummaryDTO[] = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const summary = await generateDailySummary(dateStr);
            result.push(summary);
        }
        return result;
    });

    // --- Settings (Apps) ---
    ipcMain.handle('get-all-apps', async () => {
        const apps = await db.app.findMany({
            include: { rules: true },
            orderBy: { name: 'asc' }
        });
        return apps.map((app: any) => ({
            id: app.id,
            name: app.name,
            icon: app.icon, // map to iconUrl if needed
            category: app.rules[0]?.category || 'UNCATEGORIZED',
            isBlocked: app.rules[0]?.isBlocked || false
        }));
    });

    ipcMain.handle('update-app-category', async (_event, appId: string, category: string) => {
        return await db.appRule.upsert({
            where: { appId },
            create: { appId, category, isBlocked: false, ignoreTracking: false },
            update: { category }
        });
    });

    // --- Focus Sessions ---
    ipcMain.handle('start-focus-session', async (_event, config: FocusSessionConfig) => {
        try {
            return await focusSessionService.startSession(config);
        } catch (error: any) {
            console.error('IPC Error (start-focus-session):', error);
            throw error;
        }
    });

    ipcMain.handle('end-focus-session', async (_event, sessionId: string) => {
        try {
            return await focusSessionService.endSession(sessionId);
        } catch (error: any) {
            console.error('IPC Error (end-focus-session):', error);
            throw error;
        }
    });

    // Extensions
    ipcMain.handle('pause-focus-session', async () => {
        try {
            await focusSessionService.pauseSession();
            return { status: 'paused' };
        } catch (error: any) {
            console.error('IPC Error (pause-focus-session):', error);
            throw error;
        }
    });

    ipcMain.handle('resume-focus-session', async () => {
        try {
            await focusSessionService.resumeSession();
            return { status: 'running' };
        } catch (error: any) {
            console.error('IPC Error (resume-focus-session):', error);
            throw error;
        }
    });

    // --- Daily Advice ---
    ipcMain.handle('get-daily-advice', async () => {
        try {
            const count = await db.advice.count();
            if (count > 0) {
                const skip = Math.floor(Math.random() * count);
                return await db.advice.findFirst({ skip });
            }
            return {
                text: "Focus is the key to productivity.",
                author: "FocusFlow"
            };
        } catch (error: any) {
            console.error('IPC Error (get-daily-advice):', error);
            throw error;
        }
    });
}
