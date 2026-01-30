import { BrowserWindow } from 'electron';
import { db } from '../db';
import { logger } from '../logger';
import { FocusSessionDTO, FocusSessionConfig } from '../../shared/types';

interface ActiveSession {
    id: string;
    startTime: Date;
    goal: string | null;
    durationMinutes: number;
    remainingSeconds: number;
    status: 'RUNNING' | 'PAUSED';
    timer: NodeJS.Timeout | null;
}

export class FocusSessionService {
    private currentSession: ActiveSession | null = null;
    private mainWindow: BrowserWindow | null = null;

    setWindow(win: BrowserWindow) {
        this.mainWindow = win;
    }

    async startSession(config: FocusSessionConfig): Promise<FocusSessionDTO> {
        // End existing if any
        if (this.currentSession) {
            await this.endSession(this.currentSession.id);
        }

        const durationMin = config.durationMinutes || 25;

        try {
            const session = await db.focusSession.create({
                data: {
                    startTime: new Date(),
                    status: 'RUNNING',
                    goal: config.taskTitle || 'Focus Session',
                }
            });

            this.currentSession = {
                id: session.id,
                startTime: session.startTime,
                goal: session.goal,
                durationMinutes: durationMin,
                remainingSeconds: durationMin * 60,
                status: 'RUNNING',
                timer: null
            };

            this.startTimer();

            logger.info(`Session started: ${session.id}`);
            return this.mapToDTO(this.currentSession);
        } catch (e) {
            logger.error('Failed to start session', e);
            throw e;
        }
    }

    private startTimer() {
        if (!this.currentSession) return;
        if (this.currentSession.timer) clearInterval(this.currentSession.timer);

        this.currentSession.timer = setInterval(() => {
            if (!this.currentSession) return;

            this.currentSession.remainingSeconds--;

            // Emit update every second
            this.broadcastStatus();

            if (this.currentSession.remainingSeconds <= 0) {
                this.completeSession();
            }
        }, 1000);
    }

    private stopTimer() {
        if (this.currentSession?.timer) {
            clearInterval(this.currentSession.timer);
            this.currentSession.timer = null;
        }
    }

    async pauseSession() {
        if (!this.currentSession || this.currentSession.status !== 'RUNNING') return;

        this.stopTimer();
        this.currentSession.status = 'PAUSED';
        await db.focusSessionEvent.create({
            data: {
                sessionId: this.currentSession.id,
                type: 'PAUSE',
            }
        });
        this.broadcastStatus();
    }

    async resumeSession() {
        if (!this.currentSession || this.currentSession.status !== 'PAUSED') return;

        this.currentSession.status = 'RUNNING';
        await db.focusSessionEvent.create({
            data: {
                sessionId: this.currentSession.id,
                type: 'RESUME',
            }
        });
        this.startTimer();
    }

    async endSession(sessionId: string): Promise<FocusSessionDTO | null> {
        if (!this.currentSession || this.currentSession.id !== sessionId) return null;

        this.stopTimer();

        // Update DB
        await db.focusSession.update({
            where: { id: sessionId },
            data: {
                status: 'COMPLETED', // or ABORTED if early?
                endTime: new Date()
            }
        });

        const completedSession = { ...this.currentSession, status: 'COMPLETED' } as const;
        this.currentSession = null;

        this.broadcastStatus(completedSession);
        return this.mapToDTO(completedSession);
    }

    private async completeSession() {
        if (!this.currentSession) return;
        logger.info(`Session time completed: ${this.currentSession.id}`);
        // Notify frontend it's done naturally
        // We could keep it in "COMPLETED" state until user dismisses,
        // but for now, let's just mark it done.
        await this.endSession(this.currentSession.id);
    }

    private broadcastStatus(overrideSession?: any) {
        if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

        const session = overrideSession || this.currentSession;
        if (session) {
            this.mainWindow.webContents.send('focus-session-update', this.mapToDTO(session));
        } else {
            this.mainWindow.webContents.send('focus-session-update', null);
        }
    }

    private mapToDTO(session: any): FocusSessionDTO {
        // Need to calculate elapsed/stats
        // For MVP, just send basic timing

        // This maps to the DTO expected by frontend
        // Note: Frontend types might need adjustment if they expect totalFocusMs etc.
        return {
            sessionId: session.id,
            config: {
                taskTitle: session.goal || '',
                durationMinutes: session.durationMinutes,
                allowedCategories: [],
                strictMode: false
            },
            startTime: session.startTime instanceof Date ? session.startTime.toISOString() : session.startTime,
            state: session.status, // "RUNNING" | "PAUSED" | "COMPLETED"

            // Allow frontend to calculate visual timer
            // Or send remainingSeconds directly if we change DTO
            elapsedMs: (session.durationMinutes * 60 - session.remainingSeconds) * 1000,

            totalFocusMs: 0, // TODO: calculate from events
            totalDistractedMs: 0,
            totalIdleMs: 0,
            currentFocusState: 'FOCUS'
        };
    }

    // Recovery on app restart
    async recoverActiveSession() {
        // Check DB for active sessions without end time?
        // If app crashed, we might have a RUNNING session.
        // For now, mark them as ABORTED or just ignore.
        // Implementing full recovery is complex (time elapsed might be offline).
        // Simple strategy: Close open sessions.
        const openSessions = await db.focusSession.findMany({
            where: { status: 'RUNNING' }
        });

        if (openSessions.length > 0) {
            logger.info(`Found ${openSessions.length} orphaned sessions. Closing them.`);
            for (const s of openSessions) {
                await db.focusSession.update({
                    where: { id: s.id },
                    data: { status: 'ABORTED', endTime: new Date() }
                });
            }
        }
    }
}

export const focusSessionService = new FocusSessionService();
