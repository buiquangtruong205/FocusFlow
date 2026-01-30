import { EventEmitter } from 'events';
import { db } from '../db';

export class ActivityTracker extends EventEmitter {
    private intervalId: NodeJS.Timeout | null = null;
    private isTracking = false;

    constructor() {
        super();
        console.log('Activity Tracker Initialized');
    }

    startTracking(intervalMs: number = 2000) {
        if (this.isTracking) return;
        this.isTracking = true;
        console.log('Tracking started');

        this.intervalId = setInterval(async () => {
            try {
                // Dynamic import for ESM-only package
                const { activeWindow } = await import('active-win');
                const result = await activeWindow();

                if (result) {
                    this.emit('activity-update', result);
                    // Save to Database
                    try {
                        let appName = result.owner.name;
                        const appPath = result.owner.path;

                        // Local fix: Rename "Electron" to "FocusFlow" in dev mode
                        if (appName === 'Electron' || appName === 'electron') {
                            appName = 'FocusFlow';
                        }

                        // Upsert App
                        const app = await db.app.upsert({
                            where: { name: appName },
                            update: { path: appPath, updatedAt: new Date() },
                            create: {
                                name: appName,
                                path: appPath,
                                rules: {
                                    create: {
                                        category: 'OTHER'
                                    }
                                }
                            }
                        });

                        await db.activityEvent.create({
                            data: {
                                eventType: 'ACTIVE',
                                appId: app.id,
                                windowTitle: result.title,
                                timestamp: new Date()
                            }
                        });
                    } catch (dbError) {
                        console.error('Database write failed:', dbError);
                    }
                }
            } catch (error) {
                console.error('Error tracking activity:', error);
            }
        }, intervalMs);
    }

    stopTracking() {
        if (!this.isTracking) return;
        this.isTracking = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        console.log('Tracking stopped');
    }
}
