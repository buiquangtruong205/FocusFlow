"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const electron = require("electron");
const path = require("path");
const events = require("events");
const client = require("@prisma/client");
const db = global.prisma || new client.PrismaClient({
  datasources: {
    db: {
      url: "file:E:/FocusFlow/focusflow.db"
    }
  },
  log: ["query", "info", "warn", "error"]
});
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
async function initDatabase() {
  try {
    await db.$connect();
    console.log("✅ Database connected successfully");
    console.log("🔄 Verifying Schema...");
    for (const sql of SCHEMA_SQL) {
      await db.$executeRawUnsafe(sql);
    }
    console.log("✅ Schema verification complete");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}
class ActivityTracker extends events.EventEmitter {
  constructor() {
    super();
    __publicField(this, "intervalId", null);
    __publicField(this, "isTracking", false);
    console.log("Activity Tracker Initialized");
  }
  startTracking(intervalMs = 2e3) {
    if (this.isTracking) return;
    this.isTracking = true;
    console.log("Tracking started");
    this.intervalId = setInterval(async () => {
      try {
        const { activeWindow } = await import("active-win");
        const result = await activeWindow();
        if (result) {
          this.emit("activity-update", result);
          try {
            const appName = result.owner.name;
            const appPath = result.owner.path;
            const app = await db.app.upsert({
              where: { name: appName },
              update: { path: appPath, updatedAt: /* @__PURE__ */ new Date() },
              create: {
                name: appName,
                path: appPath,
                rules: {
                  create: {
                    category: "OTHER"
                  }
                }
              }
            });
            await db.activityEvent.create({
              data: {
                eventType: "ACTIVE",
                appId: app.id,
                windowTitle: result.title,
                timestamp: /* @__PURE__ */ new Date()
              }
            });
          } catch (dbError) {
            console.error("Database write failed:", dbError);
          }
        }
      } catch (error) {
        console.error("Error tracking activity:", error);
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
    console.log("Tracking stopped");
  }
}
function registerHandlers(tracker2) {
  electron.ipcMain.handle("tracking:start", () => {
    tracker2.startTracking();
    return { status: "started" };
  });
  electron.ipcMain.handle("tracking:stop", () => {
    tracker2.stopTracking();
    return { status: "stopped" };
  });
  async function getEventsForDay(dateString) {
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
      orderBy: { timestamp: "asc" }
    });
  }
  electron.ipcMain.handle("get-daily-summary", async (_event, date) => {
    return await generateDailySummary(date);
  });
  electron.ipcMain.handle("get-top-apps", async (_event, date, limit) => {
    var _a, _b;
    const events2 = await getEventsForDay(date);
    const appMap = /* @__PURE__ */ new Map();
    for (let i = 0; i < events2.length; i++) {
      const current = events2[i];
      const next = events2[i + 1];
      let duration = 0;
      if (next) {
        duration = next.timestamp.getTime() - current.timestamp.getTime();
        if (duration > 5 * 60 * 1e3) duration = 2e3;
      } else {
        duration = 2e3;
      }
      if (current.eventType === "ACTIVE" && current.app) {
        const appId = current.appId;
        if (!appMap.has(appId)) {
          appMap.set(appId, {
            appId,
            displayName: current.app.name,
            durationMs: 0,
            category: ((_b = (_a = current.app.rules) == null ? void 0 : _a[0]) == null ? void 0 : _b.category) || "UNCATEGORIZED",
            iconUrl: current.app.icon || void 0
          });
        }
        appMap.get(appId).durationMs += duration;
      }
    }
    return Array.from(appMap.values()).sort((a, b) => b.durationMs - a.durationMs).slice(0, limit);
  });
  async function getTimelineForDate(date) {
    var _a, _b, _c, _d, _e;
    const events2 = await getEventsForDay(date);
    const segments = [];
    let currentSegment = null;
    for (let i = 0; i < events2.length; i++) {
      const e = events2[i];
      const next = events2[i + 1];
      let duration = 0;
      if (next) {
        duration = next.timestamp.getTime() - e.timestamp.getTime();
        if (duration > 5 * 60 * 1e3) duration = 2e3;
      } else {
        duration = 2e3;
      }
      const appName = ((_a = e.app) == null ? void 0 : _a.name) || "Unknown";
      const cat = ((_d = (_c = (_b = e.app) == null ? void 0 : _b.rules) == null ? void 0 : _c[0]) == null ? void 0 : _d.category) || "UNCATEGORIZED";
      if (currentSegment && ((_e = currentSegment.app) == null ? void 0 : _e.displayName) === appName && currentSegment.kind === (e.eventType === "ACTIVE" ? "FOREGROUND" : "IDLE")) {
        currentSegment.durationMs += duration;
        currentSegment.endTime = new Date(new Date(currentSegment.endTime).getTime() + duration).toISOString();
      } else {
        currentSegment = {
          id: e.id,
          startTime: e.timestamp.toISOString(),
          endTime: new Date(e.timestamp.getTime() + duration).toISOString(),
          durationMs: duration,
          app: e.app ? { id: e.app.id, displayName: e.app.name, iconUrl: e.app.icon } : void 0,
          category: cat,
          kind: e.eventType === "ACTIVE" ? "FOREGROUND" : "IDLE"
        };
        segments.push(currentSegment);
      }
    }
    return { date, segments };
  }
  electron.ipcMain.handle("get-timeline", async (_event, date) => {
    return getTimelineForDate(date);
  });
  electron.ipcMain.handle("get-timeline-range", async (_event, startDate, endDate) => {
    const result = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      const timeline = await getTimelineForDate(dateStr);
      if (timeline.segments.length > 0) {
        result.push(timeline);
      }
    }
    result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return result;
  });
  async function generateDailySummary(date) {
    var _a, _b, _c;
    const events2 = await getEventsForDay(date);
    const summary = {
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
    for (let i = 0; i < events2.length; i++) {
      const current = events2[i];
      const next = events2[i + 1];
      let duration = 0;
      if (next) {
        duration = next.timestamp.getTime() - current.timestamp.getTime();
        if (duration > 5 * 60 * 1e3) duration = 2e3;
      } else {
        duration = 2e3;
      }
      if (current.eventType === "ACTIVE") {
        summary.activeMs += duration;
        summary.switchCount++;
        const cat = ((_c = (_b = (_a = current.app) == null ? void 0 : _a.rules) == null ? void 0 : _b[0]) == null ? void 0 : _c.category) || "UNCATEGORIZED";
        if (summary.byCategoryMs[cat] !== void 0) {
          summary.byCategoryMs[cat] += duration;
        } else {
          summary.byCategoryMs.OTHER += duration;
        }
      } else if (current.eventType === "IDLE") {
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
        summary.focusMs += s.endTime.getTime() - s.startTime.getTime();
      } else if (s.status === "RUNNING") {
        summary.focusMs += (/* @__PURE__ */ new Date()).getTime() - s.startTime.getTime();
      }
    }
    return summary;
  }
  electron.ipcMain.handle("get-stats-range", async (_event, startDate, endDate) => {
    const result = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      const summary = await generateDailySummary(dateStr);
      result.push(summary);
    }
    return result;
  });
  electron.ipcMain.handle("get-all-apps", async () => {
    const apps = await db.app.findMany({
      include: { rules: true },
      orderBy: { name: "asc" }
    });
    return apps.map((app) => {
      var _a, _b;
      return {
        id: app.id,
        name: app.name,
        icon: app.icon,
        // map to iconUrl if needed
        category: ((_a = app.rules[0]) == null ? void 0 : _a.category) || "UNCATEGORIZED",
        isBlocked: ((_b = app.rules[0]) == null ? void 0 : _b.isBlocked) || false
      };
    });
  });
  electron.ipcMain.handle("update-app-category", async (_event, appId, category) => {
    return await db.appRule.upsert({
      where: { appId },
      create: { appId, category, isBlocked: false, ignoreTracking: false },
      update: { category }
    });
  });
  electron.ipcMain.handle("start-focus-session", async (_event, config) => {
    const session = await db.focusSession.create({
      data: {
        startTime: /* @__PURE__ */ new Date(),
        status: "RUNNING",
        goal: config.taskTitle
      }
    });
    return {
      sessionId: session.id,
      config,
      startTime: session.startTime.toISOString(),
      state: "RUNNING",
      elapsedMs: 0,
      totalFocusMs: 0,
      totalDistractedMs: 0,
      totalIdleMs: 0,
      currentFocusState: "FOCUS"
    };
  });
  electron.ipcMain.handle("end-focus-session", async (_event, sessionId) => {
    await db.focusSession.update({
      where: { id: sessionId },
      data: { status: "COMPLETED", endTime: /* @__PURE__ */ new Date() }
    });
    return {
      sessionId,
      state: "COMPLETED",
      endTime: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
}
let tracker;
function createWindow() {
  const win = new electron.BrowserWindow({
    icon: path.join(__dirname, process.env.VITE_DEV_SERVER_URL ? "../public/logo.png" : "../dist/logo.png"),
    width: 1280,
    height: 800,
    minWidth: 1e3,
    minHeight: 600,
    backgroundColor: "#0F0F13",
    // Matches Tailwind background
    titleBarStyle: "hidden",
    // Look more native
    titleBarOverlay: {
      color: "#0F0F13",
      symbolColor: "#ffffff",
      height: 30
    },
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  if (!tracker) {
    tracker = new ActivityTracker();
    registerHandlers(tracker);
  }
  tracker.on("activity-update", (data) => {
    if (!win.isDestroyed()) {
      win.webContents.send("activity-update", data);
    }
  });
}
electron.app.whenReady().then(async () => {
  await initDatabase();
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
