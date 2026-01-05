import { app, ipcMain, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
const require$1 = createRequire(import.meta.url);
const { SerialPort, Readline } = require$1("serialport");
let win = null;
function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.loadURL(process.env.VITE_DEV_SERVER_URL);
}
app.whenReady().then(() => {
  createWindow();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
ipcMain.on("serial-write", async (_, data) => {
  return;
});
ipcMain.on("serial-data", (event) => {
  return;
});
ipcMain.handle("serial-devices", async () => {
  const ports = await SerialPort.list();
  const devices = ports.map((port) => ({
    path: port.path,
    serialNumber: port.serialNumber,
    manufacturer: port.manufacturer
  }));
  return devices;
});
