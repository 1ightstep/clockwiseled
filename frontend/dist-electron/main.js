import { app, ipcMain, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
const __filename$2 = fileURLToPath(import.meta.url);
const __dirname$2 = path.dirname(__filename$2);
globalThis.__filename = __filename$2;
globalThis.__dirname = __dirname$2;
let db = null;
let stmts = null;
function getDatabase() {
  if (!db) {
    const userDataPath = app.getPath("userData");
    const dbPath = path.join(userDataPath, "clockwise.db");
    db = new Database(dbPath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS schedules (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        day TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        schedule_id TEXT NOT NULL,
        start_h INTEGER NOT NULL,
        start_m INTEGER NOT NULL,
        end_h INTEGER NOT NULL,
        end_m INTEGER NOT NULL,
        r INTEGER NOT NULL,
        g INTEGER NOT NULL,
        b INTEGER NOT NULL,
        FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_events_schedule_id ON events(schedule_id);
    `);
    stmts = {
      // Schedules
      insertSchedule: db.prepare(`
        INSERT INTO schedules (id, title, description, day, updated_at)
        VALUES (?, ?, ?, ?, strftime('%s', 'now'))
      `),
      updateSchedule: db.prepare(`
        UPDATE schedules 
        SET title = ?, description = ?, day = ?, updated_at = strftime('%s', 'now')
        WHERE id = ?
      `),
      deleteSchedule: db.prepare("DELETE FROM schedules WHERE id = ?"),
      getSchedule: db.prepare("SELECT * FROM schedules WHERE id = ?"),
      getAllSchedules: db.prepare(
        "SELECT * FROM schedules ORDER BY updated_at DESC"
      ),
      // Events
      insertEvent: db.prepare(`
        INSERT INTO events (id, schedule_id, start_h, start_m, end_h, end_m, r, g, b)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `),
      deleteEventsBySchedule: db.prepare(
        "DELETE FROM events WHERE schedule_id = ?"
      ),
      getEventsBySchedule: db.prepare(
        "SELECT * FROM events WHERE schedule_id = ?"
      )
    };
  }
  return db;
}
const dbOperations = {
  // Save or update schedule with events
  saveSchedule: (schedule) => {
    const database = getDatabase();
    const transaction = database.transaction(() => {
      const existing = stmts.getSchedule.get(String(schedule.id));
      if (existing) {
        stmts.updateSchedule.run(
          schedule.title,
          schedule.description,
          schedule.day,
          String(schedule.id)
        );
        stmts.deleteEventsBySchedule.run(String(schedule.id));
      } else {
        stmts.insertSchedule.run(
          String(schedule.id),
          schedule.title,
          schedule.description,
          schedule.day
        );
      }
      for (const event of schedule.events) {
        stmts.insertEvent.run(
          String(event.id),
          String(schedule.id),
          event.startH,
          event.startM,
          event.endH,
          event.endM,
          event.r,
          event.g,
          event.b
        );
      }
    });
    transaction();
  },
  // Get all schedules with events
  getAllSchedules: () => {
    getDatabase();
    const schedules = stmts.getAllSchedules.all();
    return schedules.map((schedule) => {
      const events = stmts.getEventsBySchedule.all(schedule.id);
      return {
        id: schedule.id,
        title: schedule.title,
        description: schedule.description,
        day: schedule.day,
        events: events.map((e) => ({
          id: e.id,
          startH: e.start_h,
          startM: e.start_m,
          endH: e.end_h,
          endM: e.end_m,
          r: e.r,
          g: e.g,
          b: e.b
        }))
      };
    });
  },
  // Delete schedule (cascade deletes events)
  deleteSchedule: (id) => {
    getDatabase();
    stmts.deleteSchedule.run(String(id));
  },
  // Close database connection
  close: () => {
    if (db) {
      db.close();
      db = null;
      stmts = null;
    }
  }
};
app.on("before-quit", () => {
  dbOperations.close();
});
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename$1);
globalThis.__filename = __filename$1;
globalThis.__dirname = __dirname$1;
const require$1 = createRequire(import.meta.url);
const { SerialPort } = require$1("serialport");
const { ReadlineParser } = require$1("@serialport/parser-readline");
let win = null;
let currentPort = null;
let parser = null;
function createWindow() {
  win = new BrowserWindow({
    title: "Clockwise",
    icon: path.join(__dirname$1, "../public/Logo.png"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.loadURL(process.env.VITE_DEV_SERVER_URL);
}
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
ipcMain.on("serial-write", (_, data) => {
  if (!currentPort || !currentPort.isOpen) return;
  currentPort.write(Buffer.from(data + "\n", "ascii"), (err) => {
    if (err) console.error("Serial write error:", err.message);
  });
});
ipcMain.handle("serial-devices", async () => {
  const ports = await SerialPort.list();
  const devices = ports.map(
    (port) => ({
      path: port.path,
      serialNumber: port.serialNumber,
      manufacturer: port.manufacturer
    })
  );
  return devices;
});
ipcMain.on("serial-connect", async (_, portPath) => {
  if (currentPort && currentPort.isOpen) {
    console.log("CLOSING EXISTING PORT...");
    currentPort.removeAllListeners();
    if (parser) parser.removeAllListeners();
    await new Promise((resolve, reject) => {
      currentPort.close((err) => {
        if (err) {
          console.error("Error closing port:", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  currentPort = new SerialPort({
    path: portPath,
    baudRate: 9600,
    autoOpen: true
  });
  parser = currentPort.pipe(new ReadlineParser({ delimiter: "\n" }));
  parser.on("data", (data) => {
    win == null ? void 0 : win.webContents.send("serial-data", data);
  });
  currentPort.on("error", (err) => {
    console.error("Serial Port Error: ", err.message);
  });
});
ipcMain.handle("db-get-all-schedules", () => {
  try {
    return dbOperations.getAllSchedules();
  } catch (error) {
    console.error("Error getting all schedules:", error);
    throw error;
  }
});
ipcMain.handle("db-save-schedule", (_, schedule) => {
  try {
    dbOperations.saveSchedule(schedule);
    return { success: true };
  } catch (error) {
    console.error("Error saving schedule:", error);
    throw error;
  }
});
ipcMain.handle("db-delete-schedule", (_, id) => {
  try {
    dbOperations.deleteSchedule(id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting schedule:", error);
    throw error;
  }
});
