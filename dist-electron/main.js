import { ipcMain, app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename$1);
function createWindow() {
  const win = new BrowserWindow({
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
      preload: path.join(__dirname$1, "preload.mjs"),
      sandbox: false
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname$1, "../dist/index.html"));
  }
}
ipcMain.handle("get-daily-summary", async (event, date) => {
  return {
    date,
    activeMs: 1e3 * 60 * 60 * 5.5,
    // 5.5 hours
    idleMs: 1e3 * 60 * 45,
    // 45 mins
    focusMs: 1e3 * 60 * 60 * 3.2,
    // 3.2 hours
    distractedMs: 1e3 * 60 * 60 * 1,
    // 1 hour
    switchCount: 42,
    byCategoryMs: {
      "WORK": 1e3 * 60 * 60 * 4,
      "COMM": 1e3 * 60 * 30,
      "ENT": 1e3 * 60 * 45,
      "OTHER": 1e3 * 60 * 15,
      "UNCATEGORIZED": 0
    }
  };
});
ipcMain.handle("get-top-apps", async (event, date, limit) => {
  return [
    { appId: "vscode", displayName: "Visual Studio Code", durationMs: 1e3 * 60 * 125, category: "WORK" },
    { appId: "chrome", displayName: "Google Chrome", durationMs: 1e3 * 60 * 90, category: "WORK" },
    { appId: "slack", displayName: "Slack", durationMs: 1e3 * 60 * 45, category: "COMM" },
    { appId: "spotify", displayName: "Spotify", durationMs: 1e3 * 60 * 45, category: "ENT" },
    { appId: "term", displayName: "Terminal", durationMs: 1e3 * 60 * 30, category: "WORK" }
  ];
});
ipcMain.handle("get-timeline", async (event, date) => {
  const baseTime = new Date(date).getTime();
  const mockSegments = [];
  mockSegments.push({
    id: "1",
    startTime: new Date(baseTime + 9 * 3600 * 1e3).toISOString(),
    endTime: new Date(baseTime + 10.5 * 3600 * 1e3).toISOString(),
    durationMs: 1.5 * 3600 * 1e3,
    app: { id: "vscode", displayName: "Visual Studio Code" },
    category: "WORK",
    kind: "FOREGROUND"
  });
  mockSegments.push({
    id: "2",
    startTime: new Date(baseTime + 10.5 * 3600 * 1e3).toISOString(),
    endTime: new Date(baseTime + 10.75 * 3600 * 1e3).toISOString(),
    durationMs: 0.25 * 3600 * 1e3,
    category: "UNCATEGORIZED",
    kind: "IDLE"
  });
  mockSegments.push({
    id: "3",
    startTime: new Date(baseTime + 10.75 * 3600 * 1e3).toISOString(),
    endTime: new Date(baseTime + 11.25 * 3600 * 1e3).toISOString(),
    durationMs: 0.5 * 3600 * 1e3,
    app: { id: "chrome", displayName: "Google Chrome" },
    category: "ENT",
    kind: "FOREGROUND",
    sessionId: "session-1",
    focusState: "DISTRACTED"
  });
  mockSegments.push({
    id: "4",
    startTime: new Date(baseTime + 11.25 * 3600 * 1e3).toISOString(),
    endTime: new Date(baseTime + 12 * 3600 * 1e3).toISOString(),
    durationMs: 0.75 * 3600 * 1e3,
    app: { id: "figma", displayName: "Figma" },
    category: "WORK",
    kind: "FOREGROUND",
    sessionId: "session-1",
    focusState: "FOCUS"
  });
  return {
    date,
    segments: mockSegments
  };
});
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
