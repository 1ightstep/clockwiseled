import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { type ScheduleData } from "../src/shared/types";
import { dbOperations } from "./db";
import { type DeviceType } from "./shared/type";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const runtimePaths = globalThis as typeof globalThis & {
  __filename?: string;
  __dirname?: string;
};
runtimePaths.__filename = __filename;
runtimePaths.__dirname = __dirname;

const require = createRequire(import.meta.url);
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

type SerialPortInstance = InstanceType<typeof SerialPort>;
type SerialDataParser = {
  on: (event: "data", listener: (data: string) => void) => void;
  removeAllListeners: () => void;
};

let win: BrowserWindow | null = null;
let currentPort: SerialPortInstance | null = null;
let parser: SerialDataParser | null = null;

function createWindow(): void {
  const appPath = app.getAppPath();
  const isDev = !!process.env.VITE_DEV_SERVER_URL;

  win = new BrowserWindow({
    title: "Clockwise",
    icon: isDev
      ? path.join(__dirname, "../public/Logo.png")
      : path.join(appPath, "dist-electron/../public/Logo.png"),
    webPreferences: {
      preload: isDev
        ? path.join(__dirname, "preload.mjs")
        : path.join(appPath, "dist-electron/preload.mjs"),
    },
  });

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL!);
  } else {
    win.loadFile(path.join(appPath, "dist/index.html"));
  }
}

async function closeCurrentPort(): Promise<void> {
  if (!currentPort || !currentPort.isOpen) return;

  currentPort.removeAllListeners();
  if (parser) parser.removeAllListeners();

  return new Promise((resolve, reject) => {
    currentPort!.close((err: Error | null) => {
      if (err) {
        console.error("Error closing port:", err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function connectToPort(portPath: string): Promise<void> {
  try {
    await closeCurrentPort();
  } catch (err) {
    console.warn("Failed to close previous port:", err);
  }

  currentPort = new SerialPort({
    path: portPath,
    baudRate: 9600,
    autoOpen: true,
  });

  parser = currentPort.pipe(
    new ReadlineParser({ delimiter: "\n" }),
  ) as SerialDataParser;

  parser.on("data", (data: string) => {
    win?.webContents.send("serial-data", data);
  });

  currentPort.on("error", (err: Error) => {
    console.error("Serial Port Error:", err.message);
    win?.webContents.send("serial-disconnect");
    currentPort = null;
    parser = null;
  });

  currentPort.on("close", () => {
    win?.webContents.send("serial-disconnect");
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

ipcMain.on("serial-write", (_, data: string) => {
  if (!currentPort || !currentPort.isOpen) {
    console.warn("Serial port not open");
    return;
  }

  currentPort.write(Buffer.from(data + "\n", "ascii"), (err: Error | null) => {
    if (err) console.error("Serial write error:", err.message);
  });
});

ipcMain.handle("serial-devices", async (): Promise<DeviceType[]> => {
  try {
    const ports = await SerialPort.list();
    return ports.map((port: SerialPortInstance) => ({
      path: port.path,
      serialNumber: port.serialNumber,
      manufacturer: port.manufacturer,
    }));
  } catch (err) {
    console.error("Error listing serial devices:", err);
    throw err;
  }
});

ipcMain.on("serial-connect", async (_, portPath: string) => {
  try {
    await connectToPort(portPath);
  } catch (err) {
    console.error("Error connecting to port:", err);
    win?.webContents.send(
      "serial-error",
      err instanceof Error ? err.message : String(err),
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

ipcMain.handle("db-save-schedule", async (_, schedule: ScheduleData) => {
  try {
    dbOperations.saveSchedule(schedule);
    return { success: true };
  } catch (error) {
    console.error("Error saving schedule:", error);
    throw error;
  }
});

ipcMain.handle("db-delete-schedule", async (_, id: string | number) => {
  try {
    dbOperations.deleteSchedule(id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting schedule:", error);
    throw error;
  }
});
