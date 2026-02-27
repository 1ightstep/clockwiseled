import { app as d, ipcMain as E, BrowserWindow as v } from "electron";
import { createRequire as y } from "node:module";
import c from "node:path";
import { fileURLToPath as _ } from "node:url";
import I from "better-sqlite3";
const R = _(import.meta.url), b = c.dirname(R), f = globalThis;
f.__filename = R;
f.__dirname = b;
let l = null, h = null;
function A(e) {
  return {
    insertSchedule: e.prepare(`
      INSERT INTO schedules (id, title, description, day, updated_at)
      VALUES (?, ?, ?, ?, strftime('%s', 'now'))
    `),
    updateSchedule: e.prepare(`
      UPDATE schedules 
      SET title = ?, description = ?, day = ?, updated_at = strftime('%s', 'now')
      WHERE id = ?
    `),
    deleteSchedule: e.prepare("DELETE FROM schedules WHERE id = ?"),
    getSchedule: e.prepare("SELECT * FROM schedules WHERE id = ?"),
    getAllSchedules: e.prepare(
      "SELECT * FROM schedules ORDER BY updated_at DESC"
    ),
    insertEvent: e.prepare(`
      INSERT INTO events (id, schedule_id, start_h, start_m, end_h, end_m, r, g, b)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    deleteEventsBySchedule: e.prepare(
      "DELETE FROM events WHERE schedule_id = ?"
    ),
    getEventsBySchedule: e.prepare(
      "SELECT * FROM events WHERE schedule_id = ?"
    )
  };
}
function p() {
  if (!l) {
    const e = d.getPath("userData"), r = c.join(e, "clockwise.db");
    l = new I(r), l.exec(`
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
    `), h = A(l);
  }
  return l;
}
function T() {
  return h || p(), h;
}
const u = {
  saveSchedule: (e) => {
    const r = p(), t = T();
    r.transaction(() => {
      t.getSchedule.get(String(e.id)) ? (t.updateSchedule.run(
        e.title,
        e.description,
        e.day,
        String(e.id)
      ), t.deleteEventsBySchedule.run(String(e.id))) : t.insertSchedule.run(
        String(e.id),
        e.title,
        e.description,
        e.day
      );
      for (const o of e.events)
        t.insertEvent.run(
          String(o.id),
          String(e.id),
          o.startH,
          o.startM,
          o.endH,
          o.endM,
          o.r,
          o.g,
          o.b
        );
    })();
  },
  getAllSchedules: () => {
    p();
    const e = T();
    return e.getAllSchedules.all().map((t) => {
      const S = e.getEventsBySchedule.all(t.id);
      return {
        id: t.id,
        title: t.title,
        description: t.description,
        day: t.day,
        events: S.map((i) => ({
          id: i.id,
          startH: i.start_h,
          startM: i.start_m,
          endH: i.end_h,
          endM: i.end_m,
          r: i.r,
          g: i.g,
          b: i.b
        }))
      };
    });
  },
  deleteSchedule: (e) => {
    p(), T().deleteSchedule.run(String(e));
  },
  close: () => {
    l && (l.close(), l = null, h = null);
  }
};
d.on("before-quit", () => {
  u.close();
});
const N = _(import.meta.url), m = c.dirname(N), g = globalThis;
g.__filename = N;
g.__dirname = m;
const L = y(import.meta.url), { SerialPort: w } = L("serialport"), { ReadlineParser: U } = L("@serialport/parser-readline");
let n = null, s = null, a = null;
function P() {
  n = new v({
    title: "Clockwise",
    icon: c.join(m, "../public/Logo.png"),
    webPreferences: {
      preload: c.join(m, "preload.mjs")
    }
  }), process.env.VITE_DEV_SERVER_URL ? n.loadURL(process.env.VITE_DEV_SERVER_URL) : n.loadFile(c.join(m, "../dist/index.html"));
}
async function O() {
  if (!(!s || !s.isOpen))
    return s.removeAllListeners(), a && a.removeAllListeners(), new Promise((e, r) => {
      s.close((t) => {
        t ? (console.error("Error closing port:", t), r(t)) : e();
      });
    });
}
async function C(e) {
  try {
    await O();
  } catch (r) {
    console.warn("Failed to close previous port:", r);
  }
  s = new w({
    path: e,
    baudRate: 9600,
    autoOpen: !0
  }), a = s.pipe(
    new U({ delimiter: `
` })
  ), a.on("data", (r) => {
    n == null || n.webContents.send("serial-data", r);
  }), s.on("error", (r) => {
    console.error("Serial Port Error:", r.message), n == null || n.webContents.send("serial-disconnect"), s = null, a = null;
  }), s.on("close", () => {
    n == null || n.webContents.send("serial-disconnect"), s = null, a = null;
  });
}
d.whenReady().then(P);
d.on("window-all-closed", () => {
  process.platform !== "darwin" && d.quit();
});
d.on("before-quit", async () => {
  await O(), u.close();
});
E.on("serial-write", (e, r) => {
  if (!s || !s.isOpen) {
    console.warn("Serial port not open");
    return;
  }
  s.write(Buffer.from(r + `
`, "ascii"), (t) => {
    t && console.error("Serial write error:", t.message);
  });
});
E.handle("serial-devices", async () => {
  try {
    return (await w.list()).map((r) => ({
      path: r.path,
      serialNumber: r.serialNumber,
      manufacturer: r.manufacturer
    }));
  } catch (e) {
    throw console.error("Error listing serial devices:", e), e;
  }
});
E.on("serial-connect", async (e, r) => {
  try {
    await C(r);
  } catch (t) {
    console.error("Error connecting to port:", t), n == null || n.webContents.send(
      "serial-error",
      t instanceof Error ? t.message : String(t)
    );
  }
});
E.handle("db-get-all-schedules", async () => {
  try {
    return u.getAllSchedules();
  } catch (e) {
    throw console.error("Error getting all schedules:", e), e;
  }
});
E.handle("db-save-schedule", async (e, r) => {
  try {
    return u.saveSchedule(r), { success: !0 };
  } catch (t) {
    throw console.error("Error saving schedule:", t), t;
  }
});
E.handle("db-delete-schedule", async (e, r) => {
  try {
    return u.deleteSchedule(r), { success: !0 };
  } catch (t) {
    throw console.error("Error deleting schedule:", t), t;
  }
});
