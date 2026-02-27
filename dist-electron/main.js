import { app, ipcMain, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
const __filename$2 = fileURLToPath(import.meta.url);
const __dirname$2 = path.dirname(__filename$2);
const runtimePaths$1 = globalThis;
runtimePaths$1.__filename = __filename$2;
runtimePaths$1.__dirname = __dirname$2;
let db = null;
let stmts = null;
function initializeStatements(database) {
  return {
    insertSchedule: database.prepare(`
      INSERT INTO schedules (id, title, description, day, updated_at)
      VALUES (?, ?, ?, ?, strftime('%s', 'now'))
    `),
    updateSchedule: database.prepare(`
      UPDATE schedules 
      SET title = ?, description = ?, day = ?, updated_at = strftime('%s', 'now')
      WHERE id = ?
    `),
    deleteSchedule: database.prepare("DELETE FROM schedules WHERE id = ?"),
    getSchedule: database.prepare("SELECT * FROM schedules WHERE id = ?"),
    getAllSchedules: database.prepare(
      "SELECT * FROM schedules ORDER BY updated_at DESC"
    ),
    insertEvent: database.prepare(`
      INSERT INTO events (id, schedule_id, start_h, start_m, end_h, end_m, r, g, b)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    deleteEventsBySchedule: database.prepare(
      "DELETE FROM events WHERE schedule_id = ?"
    ),
    getEventsBySchedule: database.prepare(
      "SELECT * FROM events WHERE schedule_id = ?"
    )
  };
}
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
    stmts = initializeStatements(db);
  }
  return db;
}
function getStatements() {
  if (!stmts) {
    getDatabase();
  }
  return stmts;
}
const dbOperations = {
  saveSchedule: (schedule) => {
    const database = getDatabase();
    const statements = getStatements();
    const txn = database.transaction(() => {
      const existing = statements.getSchedule.get(String(schedule.id));
      if (existing) {
        statements.updateSchedule.run(
          schedule.title,
          schedule.description,
          schedule.day,
          String(schedule.id)
        );
        statements.deleteEventsBySchedule.run(String(schedule.id));
      } else {
        statements.insertSchedule.run(
          String(schedule.id),
          schedule.title,
          schedule.description,
          schedule.day
        );
      }
      for (const event of schedule.events) {
        statements.insertEvent.run(
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
    txn();
  },
  getAllSchedules: () => {
    getDatabase();
    const statements = getStatements();
    const schedules = statements.getAllSchedules.all();
    return schedules.map((schedule) => {
      const events = statements.getEventsBySchedule.all(schedule.id);
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
  deleteSchedule: (id) => {
    getDatabase();
    const statements = getStatements();
    statements.deleteSchedule.run(String(id));
  },
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
const runtimePaths = globalThis;
runtimePaths.__filename = __filename$1;
runtimePaths.__dirname = __dirname$1;
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
async function closeCurrentPort() {
  if (!currentPort || !currentPort.isOpen) return;
  currentPort.removeAllListeners();
  if (parser) parser.removeAllListeners();
  return new Promise((resolve, reject) => {
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
async function connectToPort(portPath) {
  try {
    await closeCurrentPort();
  } catch (err) {
    console.warn("Failed to close previous port:", err);
  }
  currentPort = new SerialPort({
    path: portPath,
    baudRate: 9600,
    autoOpen: true
  });
  parser = currentPort.pipe(
    new ReadlineParser({ delimiter: "\n" })
  );
  parser.on("data", (data) => {
    win == null ? void 0 : win.webContents.send("serial-data", data);
  });
  currentPort.on("error", (err) => {
    console.error("Serial Port Error:", err.message);
    win == null ? void 0 : win.webContents.send("serial-disconnect");
    currentPort = null;
    parser = null;
  });
  currentPort.on("close", () => {
    win == null ? void 0 : win.webContents.send("serial-disconnect");
    currentPort = null;
    parser = null;
  });
}
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("before-quit", async () => {
  await closeCurrentPort();
  dbOperations.close();
});
ipcMain.on("serial-write", (_, data) => {
  if (!currentPort || !currentPort.isOpen) {
    console.warn("Serial port not open");
    return;
  }
  currentPort.write(Buffer.from(data + "\n", "ascii"), (err) => {
    if (err) console.error("Serial write error:", err.message);
  });
});
ipcMain.handle("serial-devices", async () => {
  try {
    const ports = await SerialPort.list();
    return ports.map((port) => ({
      path: port.path,
      serialNumber: port.serialNumber,
      manufacturer: port.manufacturer
    }));
  } catch (err) {
    console.error("Error listing serial devices:", err);
    throw err;
  }
});
ipcMain.on("serial-connect", async (_, portPath) => {
  try {
    await connectToPort(portPath);
  } catch (err) {
    console.error("Error connecting to port:", err);
    win == null ? void 0 : win.webContents.send(
      "serial-error",
      err instanceof Error ? err.message : String(err)
    );
  }
});
ipcMain.handle("db-get-all-schedules", async () => {
  try {
    return dbOperations.getAllSchedules();
  } catch (error) {
    console.error("Error getting all schedules:", error);
    throw error;
  }
});
ipcMain.handle("db-save-schedule", async (_, schedule) => {
  try {
    dbOperations.saveSchedule(schedule);
    return { success: true };
  } catch (error) {
    console.error("Error saving schedule:", error);
    throw error;
  }
});
ipcMain.handle("db-delete-schedule", async (_, id) => {
  try {
    dbOperations.deleteSchedule(id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting schedule:", error);
    throw error;
  }
});
