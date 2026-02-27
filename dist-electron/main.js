import { app as c, ipcMain as E, BrowserWindow as O } from "electron";
import { createRequire as y } from "node:module";
import l from "node:path";
import { fileURLToPath as _ } from "node:url";
import I from "better-sqlite3";
const g = _(import.meta.url), b = l.dirname(g), R = globalThis;
R.__filename = g;
R.__dirname = b;
let a = null, h = null;
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
  if (!a) {
    const e = c.getPath("userData"), t = l.join(e, "clockwise.db");
    a = new I(t), a.exec(`
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
    `), h = A(a);
  }
  return a;
}
function m() {
  return h || p(), h;
}
const u = {
  saveSchedule: (e) => {
    const t = p(), r = m();
    t.transaction(() => {
      r.getSchedule.get(String(e.id)) ? (r.updateSchedule.run(
        e.title,
        e.description,
        e.day,
        String(e.id)
      ), r.deleteEventsBySchedule.run(String(e.id))) : r.insertSchedule.run(
        String(e.id),
        e.title,
        e.description,
        e.day
      );
      for (const i of e.events)
        r.insertEvent.run(
          String(i.id),
          String(e.id),
          i.startH,
          i.startM,
          i.endH,
          i.endM,
          i.r,
          i.g,
          i.b
        );
    })();
  },
  getAllSchedules: () => {
    p();
    const e = m();
    return e.getAllSchedules.all().map((r) => {
      const S = e.getEventsBySchedule.all(r.id);
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        day: r.day,
        events: S.map((o) => ({
          id: o.id,
          startH: o.start_h,
          startM: o.start_m,
          endH: o.end_h,
          endM: o.end_m,
          r: o.r,
          g: o.g,
          b: o.b
        }))
      };
    });
  },
  deleteSchedule: (e) => {
    p(), m().deleteSchedule.run(String(e));
  },
  close: () => {
    a && (a.close(), a = null, h = null);
  }
};
c.on("before-quit", () => {
  u.close();
});
const f = _(import.meta.url), T = l.dirname(f), N = globalThis;
N.__filename = f;
N.__dirname = T;
const L = y(import.meta.url), { SerialPort: w } = L("serialport"), { ReadlineParser: P } = L("@serialport/parser-readline");
let n = null, s = null, d = null;
function U() {
  const e = c.getAppPath(), t = !!process.env.VITE_DEV_SERVER_URL;
  n = new O({
    title: "Clockwise",
    icon: t ? l.join(T, "../public/Logo.png") : l.join(e, "dist-electron/../public/Logo.png"),
    webPreferences: {
      preload: t ? l.join(T, "preload.mjs") : l.join(e, "dist-electron/preload.mjs")
    }
  }), t ? n.loadURL(process.env.VITE_DEV_SERVER_URL) : n.loadFile(l.join(e, "dist/index.html"));
}
async function v() {
  if (!(!s || !s.isOpen))
    return s.removeAllListeners(), d && d.removeAllListeners(), new Promise((e, t) => {
      s.close((r) => {
        r ? (console.error("Error closing port:", r), t(r)) : e();
      });
    });
}
async function D(e) {
  try {
    await v();
  } catch (t) {
    console.warn("Failed to close previous port:", t);
  }
  s = new w({
    path: e,
    baudRate: 9600,
    autoOpen: !0
  }), d = s.pipe(
    new P({ delimiter: `
` })
  ), d.on("data", (t) => {
    n == null || n.webContents.send("serial-data", t);
  }), s.on("error", (t) => {
    console.error("Serial Port Error:", t.message), n == null || n.webContents.send("serial-disconnect"), s = null, d = null;
  }), s.on("close", () => {
    n == null || n.webContents.send("serial-disconnect"), s = null, d = null;
  });
}
c.whenReady().then(U);
c.on("window-all-closed", () => {
  process.platform !== "darwin" && c.quit();
});
c.on("before-quit", async () => {
  await v(), u.close();
});
E.on("serial-write", (e, t) => {
  if (!s || !s.isOpen) {
    console.warn("Serial port not open");
    return;
  }
  s.write(Buffer.from(t + `
`, "ascii"), (r) => {
    r && console.error("Serial write error:", r.message);
  });
});
E.handle("serial-devices", async () => {
  try {
    return (await w.list()).map((t) => ({
      path: t.path,
      serialNumber: t.serialNumber,
      manufacturer: t.manufacturer
    }));
  } catch (e) {
    throw console.error("Error listing serial devices:", e), e;
  }
});
E.on("serial-connect", async (e, t) => {
  try {
    await D(t);
  } catch (r) {
    console.error("Error connecting to port:", r), n == null || n.webContents.send(
      "serial-error",
      r instanceof Error ? r.message : String(r)
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
E.handle("db-save-schedule", async (e, t) => {
  try {
    return u.saveSchedule(t), { success: !0 };
  } catch (r) {
    throw console.error("Error saving schedule:", r), r;
  }
});
E.handle("db-delete-schedule", async (e, t) => {
  try {
    return u.deleteSchedule(t), { success: !0 };
  } catch (r) {
    throw console.error("Error deleting schedule:", r), r;
  }
});
