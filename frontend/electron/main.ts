import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { type DeviceType } from "./shared/type";
import { dbOperations } from "./db";
import { type ScheduleData } from "../src/shared/types";

// Define global __filename and __dirname for native modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
(globalThis as any).__filename = __filename;
(globalThis as any).__dirname = __dirname;

const require = createRequire(import.meta.url);

const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

let win: BrowserWindow | null = null;
let currentPort: InstanceType<typeof SerialPort> | null = null;
let parser: any = null;

function createWindow() {
  win = new BrowserWindow({
    title: "Clockwise",
    icon: path.join(__dirname, "../public/Logo.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  win.loadURL(process.env.VITE_DEV_SERVER_URL!);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("serial-write", (_, data: string) => {
  if (!currentPort || !currentPort.isOpen) return;
  currentPort.write(Buffer.from(data + "\n", "ascii"), (err: Error) => {
    if (err) console.error("Serial write error:", err.message);
  });
});

ipcMain.handle("serial-devices", async (): Promise<DeviceType[]> => {
  const ports = await SerialPort.list();

  const devices: DeviceType[] = ports.map(
    (port: InstanceType<typeof SerialPort>) => ({
      path: port.path,
      serialNumber: port.serialNumber,
      manufacturer: port.manufacturer,
    }),
  );

  return devices;
});

ipcMain.on("serial-connect", async (_, portPath: string) => {
  if (currentPort && currentPort.isOpen) {
    console.log("CLOSING EXISTING PORT...");

    currentPort.removeAllListeners();
    if (parser) parser.removeAllListeners();

    await new Promise<void>((resolve, reject) => {
      currentPort.close((err: Error) => {
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
    autoOpen: true,
  });

  parser = currentPort.pipe(new ReadlineParser({ delimiter: "\n" }));

  parser.on("data", (data: string) => {
    win?.webContents.send("serial-data", data);
  });

  currentPort.on("error", (err: Error) => {
    console.error("Serial Port Error: ", err.message);
  });
});

// Database IPC handlers
ipcMain.handle("db-get-all-schedules", () => {
  try {
    return dbOperations.getAllSchedules();
  } catch (error) {
    console.error("Error getting all schedules:", error);
    throw error;
  }
});

ipcMain.handle("db-save-schedule", (_, schedule: ScheduleData) => {
  try {
    dbOperations.saveSchedule(schedule);
    return { success: true };
  } catch (error) {
    console.error("Error saving schedule:", error);
    throw error;
  }
});

ipcMain.handle("db-delete-schedule", (_, id: string | number) => {
  try {
    dbOperations.deleteSchedule(id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting schedule:", error);
    throw error;
  }
});
