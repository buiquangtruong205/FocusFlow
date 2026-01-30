// Simple console logger fallback since electron-log is missing
const log = {
    info: (...args: any[]) => console.log('[INFO]', ...args),
    error: (...args: any[]) => console.error('[ERROR]', ...args),
    warn: (...args: any[]) => console.warn('[WARN]', ...args),
    debug: (...args: any[]) => console.debug('[DEBUG]', ...args),
    transports: {
        file: { level: 'info' },
        console: { makeCodeLocationSnippet: false }
    }
};

export const logger = log;

export function setupLogging() {
    console.log('Logger initialized (console fallback)');

    // Catch unhandled errors
    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception:', error);
    });

    process.on('unhandledRejection', (reason) => {
        console.error('Unhandled Rejection:', reason);
    });
}

export default log;
