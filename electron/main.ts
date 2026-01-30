// Electron Main Process
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { ActivityTracker } from './tracker/activityTracker';
import { registerHandlers } from './ipc/handlers';
import { initDatabase } from './db';
import { setupLogging } from './logger';

setupLogging();

if (process.platform === 'win32') {
    app.setAppUserModelId('FocusFlow');
}
app.setName('FocusFlow');

let tracker: ActivityTracker;

function createWindow() {
    const win = new BrowserWindow({
        icon: path.join(__dirname, process.env.VITE_DEV_SERVER_URL ? '../public/logo.png' : '../dist/logo.png'),
        width: 1280,
        height: 800,
        minWidth: 1000,
        minHeight: 600,
        backgroundColor: '#0F0F13', // Matches Tailwind background
        titleBarStyle: 'hidden', // Look more native
        titleBarOverlay: {
            color: '#0F0F13',
            symbolColor: '#ffffff',
            height: 30
        },
        title: 'FocusFlow',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            sandbox: false,
            contextIsolation: true,
            nodeIntegration: false
        },
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Initialize Tracker if not already
    if (!tracker) {
        tracker = new ActivityTracker();
        registerHandlers(tracker);
    }

    // Forward events to renderer
    tracker.on('activity-update', (data) => {
        if (!win.isDestroyed()) {
            win.webContents.send('activity-update', data);
        }
    });

    // Initialize Focus Service
    const { focusSessionService } = require('./focus/focusSessionService');
    focusSessionService.setWindow(win);
    focusSessionService.recoverActiveSession();
}



app.whenReady().then(async () => {
    await initDatabase();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
