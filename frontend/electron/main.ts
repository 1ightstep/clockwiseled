import { app, BrowserWindow, ipcMain } from 'electron';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type DeviceType } from './shared/type';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const require = createRequire(import.meta.url);
const { SerialPort, Readline } = require('serialport');

let win: BrowserWindow | null = null;
let currentPort: InstanceType<typeof SerialPort> | null = null;

function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  win.loadURL(process.env.VITE_DEV_SERVER_URL!);
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('serial-write', async (_, data: string) => {
  if (!currentPort || !currentPort.isOpen) return;

  currentPort.write(data + '\n', (err: Error) => {
    if (err) console.error('Serial write error:', err);
  });
});

ipcMain.on('serial-data', (event) => {
  if (!currentPort || !currentPort.isOpen) return;

  const parser = currentPort.pipe(new Readline({ delimiter: '\n' }));

  parser.on('data', (data: string) => {
    event.reply('serial-data', data);
  });
});

ipcMain.handle('serial-devices', async (): Promise<DeviceType[]> => {
  const ports = await SerialPort.list();
  const devices: DeviceType[] = ports.map((port: InstanceType<typeof SerialPort>) => ({
    path: port.path,
    serialNumber: port.serialNumber,
    manufacturer: port.manufacturer,
  }));
  return devices;
});
