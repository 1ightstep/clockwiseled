import { app as c, ipcMain as E, BrowserWindow as O } from "electron";
import { createRequire as y } from "node:module";
import l from "node:path";
import { fileURLToPath as S } from "node:url";
import I from "better-sqlite3";
const R = S(import.meta.url), b = l.dirname(R), N = globalThis;
N.__filename = R;
N.__dirname = b;
let a = null, m = null;
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
function h() {
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
    `), m = A(a);
  }
  return a;
}
function T() {
  return m || h(), m;
}
const u = {
  saveSchedule: (e) => {
    const t = h(), r = T();
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
      for (const o of e.events)
        r.insertEvent.run(
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
    h();
    const e = T();
    return e.getAllSchedules.all().map((r) => {
      const p = e.getEventsBySchedule.all(r.id);
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        day: r.day,
        events: p.map((s) => ({
          id: s.id,
          startH: s.start_h,
          startM: s.start_m,
          endH: s.end_h,
          endM: s.end_m,
          r: s.r,
          g: s.g,
          b: s.b
        }))
      };
    });
  },
  deleteSchedule: (e) => {
    h(), T().deleteSchedule.run(String(e));
  },
  close: () => {
    a && (a.close(), a = null, m = null);
  }
};
c.on("before-quit", () => {
  u.close();
});
const f = S(import.meta.url), _ = l.dirname(f), g = globalThis;
g.__filename = f;
g.__dirname = _;
const L = y(import.meta.url), { SerialPort: w } = L("serialport"), { ReadlineParser: P } = L("@serialport/parser-readline");
let i = null, n = null, d = null;
function U() {
  const e = c.getAppPath(), t = !!process.env.VITE_DEV_SERVER_URL;
  i = new O({
    title: "Clockwise",
    icon: t ? l.join(_, "../public/Logo.png") : l.join(e, "dist-electron/../public/Logo.png"),
    webPreferences: {
      preload: t ? l.join(_, "preload.mjs") : l.join(e, "dist-electron/preload.mjs")
    }
  }), t ? i.loadURL(process.env.VITE_DEV_SERVER_URL) : i.loadFile(l.join(e, "dist/index.html"));
}
async function v() {
  if (!(!n || !n.isOpen))
    return n.removeAllListeners(), d && d.removeAllListeners(), new Promise((e, t) => {
      n.close((r) => {
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
  n = new w({
    path: e,
    baudRate: 9600,
    autoOpen: !0
  }), d = n.pipe(
    new P({ delimiter: `
` })
  ), d.on("data", (t) => {
    i == null || i.webContents.send("serial-data", t);
  }), n.on("error", (t) => {
    console.error("Serial Port Error:", t.message), i == null || i.webContents.send("serial-disconnect"), n = null, d = null;
  }), n.on("close", () => {
    i == null || i.webContents.send("serial-disconnect"), n = null, d = null;
  });
}
c.whenReady().then(U);
c.on("window-all-closed", () => {
  process.platform !== "darwin" && c.quit();
});
c.on("before-quit", async () => {
  await v(), u.close();
});
E.handle("serial-write", async (e, t) => {
  if (!n || !n.isOpen)
    throw new Error("Serial port not open");
  return new Promise((r, p) => {
    n.write(
      Buffer.from(t + `
`, "ascii"),
      (s) => {
        s ? p(s) : r();
      }
    );
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
E.handle("serial-connect", async (e, t) => {
  try {
    return await D(t), { success: !0 };
  } catch (r) {
    throw console.error("Error connecting to port:", r), r;
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
