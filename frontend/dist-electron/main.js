import { app, ipcMain, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
const require$1 = createRequire(import.meta.url);
const { SerialPort } = require$1("serialport");
const { ReadlineParser } = require$1("@serialport/parser-readline");
let win = null;
let currentPort = null;
let parser = null;
function createWindow() {
  win = new BrowserWindow({
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
    currentPort.close();
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
});
