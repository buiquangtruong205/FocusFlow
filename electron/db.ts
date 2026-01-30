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

// Manual Schema Definition to ensure resilience
const SCHEMA_SQL = [
    `CREATE TABLE IF NOT EXISTS "App" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "path" TEXT,
        "icon" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "App_name_key" ON "App"("name");`,

    `CREATE TABLE IF NOT EXISTS "AppRule" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "appId" TEXT NOT NULL,
        "category" TEXT NOT NULL DEFAULT 'OTHER',
        "isBlocked" BOOLEAN NOT NULL DEFAULT 0,
        "ignoreTracking" BOOLEAN NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        CONSTRAINT "AppRule_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "AppRule_appId_key" ON "AppRule"("appId");`,

    `CREATE TABLE IF NOT EXISTS "ActivityEvent" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "eventType" TEXT NOT NULL,
        "appId" TEXT,
        "windowTitle" TEXT,
        CONSTRAINT "ActivityEvent_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS "FocusSession" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "endTime" DATETIME,
        "status" TEXT NOT NULL,
        "goal" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS "FocusSessionEvent" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sessionId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FocusSessionEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "FocusSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS "DailyStat" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "date" DATETIME NOT NULL,
        "workTime" INTEGER NOT NULL DEFAULT 0,
        "commTime" INTEGER NOT NULL DEFAULT 0,
        "entTime" INTEGER NOT NULL DEFAULT 0,
        "otherTime" INTEGER NOT NULL DEFAULT 0,
        "idleTime" INTEGER NOT NULL DEFAULT 0,
        "focusTime" INTEGER NOT NULL DEFAULT 0,
        "distractedTime" INTEGER NOT NULL DEFAULT 0,
        "switchCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "DailyStat_date_key" ON "DailyStat"("date");`
];

export async function initDatabase() {
    try {
        await db.$connect();
        console.log('✅ Database connected successfully');

        // FORCE SCHEMA CREATION
        console.log('🔄 Verifying Schema...');
        for (const sql of SCHEMA_SQL) {
            await db.$executeRawUnsafe(sql);
        }
        console.log('✅ Schema verification complete');

    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
}
