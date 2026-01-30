import { PrismaClient } from '@prisma/client';

// Prevent multiple instances in development
declare global {
    var prisma: PrismaClient | undefined;
}

// In production, the database file might be packed inside the app or need to be copied to userData.
// For this setup, we assume the DB is successfully located via the schema or env var.
// In a real localized Electron app, you might need to dynamically set the `datasourceUrl`.

export const db = global.prisma || new PrismaClient({
    datasources: {
        db: {
            url: 'file:E:/FocusFlow/focusflow.db',
        },
    },
    log: ['query', 'info', 'warn', 'error'],
});


export async function initDatabase() {
    try {
        await db.$connect();
        console.log('✅ Database connected successfully');
        // Schema management is now handled by Prisma Migrations
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
}
