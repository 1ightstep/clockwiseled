import Database from "better-sqlite3";
import { app } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { type ScheduleData } from "../src/shared/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const runtimePaths = globalThis as typeof globalThis & {
  __filename?: string;
  __dirname?: string;
};
runtimePaths.__filename = __filename;
runtimePaths.__dirname = __dirname;

type DbStatement = {
  insertSchedule: Database.Statement;
  updateSchedule: Database.Statement;
  deleteSchedule: Database.Statement;
  getSchedule: Database.Statement;
  getAllSchedules: Database.Statement;
  insertEvent: Database.Statement;
  deleteEventsBySchedule: Database.Statement;
  getEventsBySchedule: Database.Statement;
};

let db: Database.Database | null = null;
let stmts: DbStatement | null = null;

function initializeStatements(database: Database.Database): DbStatement {
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
      "SELECT * FROM schedules ORDER BY updated_at DESC",
    ),
    insertEvent: database.prepare(`
      INSERT INTO events (id, schedule_id, start_h, start_m, end_h, end_m, r, g, b)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    deleteEventsBySchedule: database.prepare(
      "DELETE FROM events WHERE schedule_id = ?",
    ),
    getEventsBySchedule: database.prepare(
      "SELECT * FROM events WHERE schedule_id = ?",
    ),
  };
}

function getDatabase(): Database.Database {
  if (!db) {
    const userDataPath = app.getPath("userData");
    const dbPath = path.join(userDataPath, "clockwiseled.db");

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

function getStatements(): DbStatement {
  if (!stmts) {
    getDatabase();
  }
  return stmts!;
}

export const dbOperations = {
  saveSchedule: (schedule: ScheduleData) => {
    const database = getDatabase();
    const statements = getStatements();

    const txn = database.transaction(() => {
      const existing = statements.getSchedule.get(String(schedule.id)) as
        | { id: string }
        | undefined;

      if (existing) {
        statements.updateSchedule.run(
          schedule.title,
          schedule.description,
          schedule.day,
          String(schedule.id),
        );
        statements.deleteEventsBySchedule.run(String(schedule.id));
      } else {
        statements.insertSchedule.run(
          String(schedule.id),
          schedule.title,
          schedule.description,
          schedule.day,
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
          event.b,
        );
      }
    });

    txn();
  },

  getAllSchedules: (): ScheduleData[] => {
    getDatabase();
    const statements = getStatements();

    const schedules = statements.getAllSchedules.all() as Array<{
      id: string;
      title: string;
      description: string;
      day: string;
      created_at: number;
      updated_at: number;
    }>;

    return schedules.map((schedule) => {
      const events = statements.getEventsBySchedule.all(schedule.id) as Array<{
        id: string;
        schedule_id: string;
        start_h: number;
        start_m: number;
        end_h: number;
        end_m: number;
        r: number;
        g: number;
        b: number;
      }>;

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
          b: e.b,
        })),
      };
    });
  },

  deleteSchedule: (id: string | number) => {
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
  },
};

app.on("before-quit", () => {
  dbOperations.close();
});
