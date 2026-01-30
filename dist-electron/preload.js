"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // Stats
  getDailySummary: (date) => electron.ipcRenderer.invoke("get-daily-summary", date),
  getTopApps: (date, limit) => electron.ipcRenderer.invoke("get-top-apps", date, limit),
  getTimeline: (date) => electron.ipcRenderer.invoke("get-timeline", date),
  getTimelineRange: (startDate, endDate) => electron.ipcRenderer.invoke("get-timeline-range", startDate, endDate),
  getStatsRange: (startDate, endDate) => electron.ipcRenderer.invoke("get-stats-range", startDate, endDate),
  // Tracking
  startTracking: () => electron.ipcRenderer.invoke("tracking:start"),
  stopTracking: () => electron.ipcRenderer.invoke("tracking:stop"),
  onActivityUpdate: (callback) => electron.ipcRenderer.on("activity-update", (_event, value) => callback(value)),
  // Settings / Apps
  getAllApps: () => electron.ipcRenderer.invoke("get-all-apps"),
  updateAppCategory: (appId, category) => electron.ipcRenderer.invoke("update-app-category", appId, category),
  // Focus
  startFocusSession: (config) => electron.ipcRenderer.invoke("start-focus-session", config),
  endFocusSession: (sessionId) => electron.ipcRenderer.invoke("end-focus-session", sessionId),
  pauseFocusSession: () => electron.ipcRenderer.invoke("pause-focus-session"),
  resumeFocusSession: () => electron.ipcRenderer.invoke("resume-focus-session"),
  onFocusSessionUpdate: (callback) => electron.ipcRenderer.on("focus-session-update", (_event, value) => callback(value)),
  // Advice
  getDailyAdvice: () => electron.ipcRenderer.invoke("get-daily-advice")
});
